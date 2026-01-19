import { Router, Response } from 'express';
import { stripe, PLANS } from '../config/stripe';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/subscription/checkout
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', req.userId)
      .single();

    // Check existing customer
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: { user_id: req.userId! },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { user_id: req.userId!, plan_type: plan.id },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subscription/cancel
router.post('/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscription/status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.json({ subscription: subscription || null });
  } catch (error: any) {
    res.json({ subscription: null });
  }
});

// GET /api/subscription/plans
router.get('/plans', (_req, res: Response) => {
  res.json({
    plans: Object.values(PLANS).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      interval: p.interval,
    }))
  });
});

export default router;
