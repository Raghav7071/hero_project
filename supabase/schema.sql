-- ============================================
-- HeroDraw Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  charity_id UUID,
  charity_contribution_pct INTEGER DEFAULT 10 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

-- ============================================
-- SCORES (Stableford scoring)
-- ============================================
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  play_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, play_date)
);

CREATE INDEX idx_scores_user ON public.scores(user_id);
CREATE INDEX idx_scores_date ON public.scores(play_date DESC);

-- ============================================
-- CHARITIES
-- ============================================
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  website_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_received NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from profiles to charities
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;

-- ============================================
-- CONTRIBUTIONS
-- ============================================
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_user ON public.contributions(user_id);
CREATE INDEX idx_contributions_charity ON public.contributions(charity_id);

-- ============================================
-- DRAWS
-- ============================================
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  algorithm TEXT NOT NULL DEFAULT 'random' CHECK (algorithm IN ('random', 'weighted')),
  winning_numbers INTEGER[] NOT NULL DEFAULT '{}',
  prize_pool NUMERIC(12,2) DEFAULT 0,
  jackpot_rollover NUMERIC(12,2) DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================
-- DRAW RESULTS
-- ============================================
CREATE TABLE public.draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_numbers INTEGER[] NOT NULL DEFAULT '{}',
  match_count INTEGER NOT NULL CHECK (match_count >= 0 AND match_count <= 5),
  prize_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draw_results_draw ON public.draw_results(draw_id);
CREATE INDEX idx_draw_results_user ON public.draw_results(user_id);

-- ============================================
-- WINNERS
-- ============================================
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_result_id UUID NOT NULL REFERENCES public.draw_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  prize_amount NUMERIC(10,2) NOT NULL,
  proof_image_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_winners_user ON public.winners(user_id);
CREATE INDEX idx_winners_draw ON public.winners(draw_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions: users see own
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages subscriptions" ON public.subscriptions FOR ALL USING (true);

-- Scores: users manage own
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Charities: public read
CREATE POLICY "Charities are viewable by everyone" ON public.charities FOR SELECT USING (true);

-- Contributions: users see own
CREATE POLICY "Users can view own contributions" ON public.contributions FOR SELECT USING (auth.uid() = user_id);

-- Draws: public read published
CREATE POLICY "Published draws are viewable" ON public.draws FOR SELECT USING (status = 'published');

-- Draw results: users see own
CREATE POLICY "Users can view own results" ON public.draw_results FOR SELECT USING (auth.uid() = user_id);

-- Winners: users see own
CREATE POLICY "Users can view own winnings" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own winner proof" ON public.winners FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_charities_updated_at
  BEFORE UPDATE ON public.charities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED DATA: Sample Charities
-- ============================================
INSERT INTO public.charities (name, slug, description, long_description, category, is_featured, image_url) VALUES
('Children First Foundation', 'children-first', 'Empowering underprivileged children through education and healthcare.', 'Children First Foundation works tirelessly to provide quality education, healthcare, and nutrition to underprivileged children worldwide. Every contribution helps build a brighter future for a child in need.', 'education', true, '/charities/children-first.jpg'),
('Ocean Conservation Trust', 'ocean-conservation', 'Protecting our oceans and marine biodiversity for future generations.', 'The Ocean Conservation Trust is dedicated to preserving marine ecosystems through research, conservation efforts, and community engagement. Together, we can protect our oceans.', 'environment', false, '/charities/ocean-conservation.jpg'),
('Mental Health Alliance', 'mental-health-alliance', 'Breaking stigma and providing accessible mental health support.', 'Mental Health Alliance provides free counseling, support groups, and educational resources to communities worldwide. We believe mental health care should be accessible to everyone.', 'health', true, '/charities/mental-health.jpg'),
('Green Earth Initiative', 'green-earth', 'Fighting climate change through reforestation and sustainable practices.', 'Green Earth Initiative plants trees, promotes sustainable agriculture, and educates communities about environmental stewardship. Every tree planted is a step toward a greener future.', 'environment', false, '/charities/green-earth.jpg'),
('Feed The World', 'feed-the-world', 'Eliminating hunger through sustainable food programs worldwide.', 'Feed The World operates food banks, community kitchens, and sustainable farming programs across 40 countries. No one should go to bed hungry.', 'humanitarian', true, '/charities/feed-world.jpg');
