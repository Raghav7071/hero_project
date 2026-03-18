'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { charityAPI, contentAPI } from '@/lib/api';
import { formatCurrency, convertToINR } from '@/lib/utils';
import { Trophy, Heart, Zap, TrendingUp, Users, ArrowRight, Star, Target, Gift, Loader2, Clock } from 'lucide-react';
import Countdown from 'react-countdown';

const stats = [
  { icon: Users, label: 'Active Players', value: '2,400+' },
  { icon: Trophy, label: 'Prizes Awarded', value: '₹1.9 Cr' },
  { icon: Heart, label: 'Charity Donated', value: '₹44 Lakh' },
];

const iconMap: any = {
  Star,
  Target,
  Gift
};

const countdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) return <span className="text-accent-400 font-bold animate-pulse">Draw is Live!</span>;
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="glass px-4 py-3 sm:px-5 sm:py-4 rounded-2xl min-w-[70px] sm:min-w-[80px] border-primary-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col items-center">
        <div className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">{days.toString().padStart(2, '0')}</div>
        <div className="text-[9px] sm:text-[11px] uppercase text-white/50 tracking-[0.2em] mt-1 font-semibold">Days</div>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white/20 pb-4">:</div>
      <div className="glass px-4 py-3 sm:px-5 sm:py-4 rounded-2xl min-w-[70px] sm:min-w-[80px] border-primary-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col items-center">
        <div className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">{hours.toString().padStart(2, '0')}</div>
        <div className="text-[9px] sm:text-[11px] uppercase text-white/50 tracking-[0.2em] mt-1 font-semibold">Hours</div>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white/20 pb-4">:</div>
      <div className="glass px-4 py-3 sm:px-5 sm:py-4 rounded-2xl min-w-[70px] sm:min-w-[80px] border-primary-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col items-center">
        <div className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">{minutes.toString().padStart(2, '0')}</div>
        <div className="text-[9px] sm:text-[11px] uppercase text-white/50 tracking-[0.2em] mt-1 font-semibold">Mins</div>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white/20 pb-4">:</div>
      <div className="glass px-4 py-3 sm:px-5 sm:py-4 rounded-2xl min-w-[70px] sm:min-w-[80px] border-accent-500/30 shadow-[0_0_25px_rgba(236,72,153,0.25)] flex flex-col items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-accent-500/10 animate-pulse-glow" />
        <div className="text-2xl sm:text-4xl font-display font-bold text-accent-400 tracking-tight relative z-10">{seconds.toString().padStart(2, '0')}</div>
        <div className="text-[9px] sm:text-[11px] uppercase text-accent-400/70 tracking-[0.2em] mt-1 font-semibold relative z-10">Secs</div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);

  useEffect(() => {
    charityAPI.getAll()
      .then(res => setCharities(res.data.charities.slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoadingCharities(false));

    contentAPI.getHowItWorks()
      .then(res => setSteps(res.data.steps))
      .catch(console.error)
      .finally(() => setLoadingSteps(false));
  }, []);
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-[#0A0A1B]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060613] via-[#0A0A1B] to-[#120B29] opacity-80" />
          
          {/* Glowing orbs */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-[15%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]" />
            
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-accent-600/15 rounded-full blur-[150px]" />

          {/* Floating abstract element (Golf Pin / Flag suggestion) */}
           <motion.div animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
             className="absolute top-[20%] left-[20%] opacity-10">
             <Trophy className="w-64 h-64 text-white" />
           </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center">
              <span className="badge-primary mb-8 inline-flex items-center gap-2 px-4 py-2 border border-primary-500/30 bg-primary-500/10 backdrop-blur-md text-primary-300 font-medium tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" /> Live v2.0 Platform
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-extrabold leading-[1.1] mb-6 tracking-tight text-white drop-shadow-2xl">
                Play Golf.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-[#A855F7] to-accent-400 animate-gradient-x">Win Big.</span><br />
                Change Lives.
              </h1>
              <p className="text-lg sm:text-2xl font-light text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                Turn your Stableford scores into winning lottery numbers and support global charities with every game.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-5 justify-center mb-16 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/signup" className="btn-primary text-lg !py-4 !px-10 flex items-center justify-center gap-2 font-semibold shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] transition-all hover:-translate-y-1">
                Start Playing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/charities" className="btn-outline text-lg !py-4 !px-10 font-semibold hover:bg-white/5 transition-all text-white border-white/20 hover:border-white/40">
                See Impact
              </Link>
            </motion.div>

            {/* Next Draw Countdown */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 100 }} className="mb-20 inline-block">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping" /> Next Monthly Draw
                </div>
                <Countdown date={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)} renderer={countdownRenderer} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
              {stats.map((s, idx) => (
                <div key={s.label} className="glass p-6 text-center rounded-2xl border border-white/5 group hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all duration-300">
                    <s.icon className="w-6 h-6 text-primary-400/70 group-hover:text-primary-400" />
                  </div>
                  <div className="text-3xl font-display font-bold text-white tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Subtle geometric separation line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              How <span className="gradient-text">HeroDraw</span> Works
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">Three simple steps to play, win, and make a difference.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingSteps ? (
              <div className="col-span-3 flex justify-center py-12"><Loader2 className="w-8 h-8 text-accent-400 animate-spin" /></div>
            ) : (
              steps.map((step, i) => {
                const IconComponent = iconMap[step.iconType] || Star;
                return (
                  <Link href={step.link || '/'} key={step.id}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                      className="glass p-8 text-center group hover:border-primary-500/30 hover:bg-white/5 transition-all cursor-pointer h-full">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-7 h-7 text-primary-400" />
                      </div>
                      <div className="text-xs text-primary-400 font-semibold mb-2">STEP {i + 1}</div>
                      <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">{step.title}</h3>
                      <p className="text-white/50 text-sm">{step.desc}</p>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Charity Impact */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Your Impact <Heart className="inline w-8 h-8 text-accent-400" />
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">Every subscription supports causes that matter. Here&apos;s what we&apos;ve achieved together.</p>
          </motion.div>

          {loadingCharities ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
            </div>
          ) : charities.length === 0 ? (
             <div className="text-center text-white/50">No charities available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {charities.map((c, i) => (
                <Link href="/charities" key={c.id || c.name}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="glass p-6 group hover:border-accent-500/30 hover:bg-white/5 transition-all cursor-pointer h-full">
                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 group-hover:bg-accent-500/20 transition-colors">
                      <Heart className="w-6 h-6 text-accent-400" />
                    </div>
                    <span className="badge-primary text-xs mb-3">{c.category}</span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-accent-400 transition-colors">{c.name}</h3>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white/40 text-xs">Total Raised</span>
                      <span className="text-accent-400 font-bold">{formatCurrency((c.total_received || 0) * 105)}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
            <div className="relative z-10">
              <Zap className="w-12 h-12 text-warning-500 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Ready to Play?</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Join for ₹1,049/month. Enter your scores, pick a charity, and you&apos;re in the next draw.
              </p>
              <Link href="/signup" className="btn-accent text-lg !py-3.5 !px-10 inline-flex items-center gap-2">
                Join HeroDraw <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
