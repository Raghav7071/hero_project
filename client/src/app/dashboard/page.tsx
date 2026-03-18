'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { scoresAPI, subscriptionAPI, winnerAPI, charityAPI } from '@/lib/api';
import { formatCurrency, convertToINR, formatDate } from '@/lib/utils';
import {
  Trophy, Target, Heart, CreditCard, TrendingUp, Plus, Trash2,
  Loader2, ArrowRight, Calendar, Zap, AlertCircle, Award, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, subscription, isSubscribed, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Score form
  const [newScore, setNewScore] = useState('');
  const [playDate, setPlayDate] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scoresRes, winningsRes] = await Promise.all([
        scoresAPI.getAll(),
        winnerAPI.myWinnings(),
      ]);
      setScores(scoresRes.data.scores);
      setWinnings(winningsRes.data.winners);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError('');
    const score = parseInt(newScore);
    if (isNaN(score) || score < 1 || score > 45) { setScoreError('Score must be 1-45'); return; }
    if (!playDate) { setScoreError('Play date is required'); return; }

    setAdding(true);
    try {
      await scoresAPI.add({ score, playDate });
      setNewScore(''); setPlayDate('');
      fetchData();
    } catch (err: any) {
      setScoreError(err.response?.data?.error || 'Failed to add score');
    }
    setAdding(false);
  };

  const handleDeleteScore = async (id: string) => {
    await scoresAPI.remove(id);
    fetchData();
  };

  const handleCheckout = async (planId: string) => {
    try {
      const { data } = await subscriptionAPI.checkout(planId);
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>;
  }

  const totalWinnings = winnings.reduce((s: number, w: any) => s + (w.prize_amount || 0), 0);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, <span className="gradient-text">{user?.full_name || 'Player'}</span>
        </h1>
        <p className="text-white/50 mb-8">Manage your scores, subscription, and winnings.</p>
      </motion.div>

      {/* Subscription Banner */}
      {!isSubscribed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 mb-8 border-warning-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-warning-500 shrink-0" />
              <div>
                <h3 className="text-white font-bold">No Active Subscription</h3>
                <p className="text-white/50 text-sm">Subscribe to enter your scores and join the monthly draw.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleCheckout('monthly')} className="btn-primary text-sm">₹1,049/mo</button>
              <button onClick={() => handleCheckout('yearly')} className="btn-accent text-sm">₹10,499/yr</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Level & XP Overview */}
      <div className="glass p-6 mb-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
          <Award className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Level 4: Amateur</h2>
              <p className="text-white/50 text-sm">You're in the top 30% of players!</p>
            </div>
            <div className="text-right">
              <span className="text-accent-400 font-bold">1,250 XP</span>
              <span className="text-white/40 text-sm"> / 2,000 XP</span>
            </div>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '62.5%' }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full relative">
              <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
            </motion.div>
          </div>
          <p className="text-xs text-white/40 mt-2 flex items-center gap-1"><Star className="w-3 h-3 text-warning-500" /> Earn 750 XP to reach <strong>Pro</strong></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CreditCard, label: 'Subscription', value: isSubscribed ? 'Active' : 'Inactive', color: isSubscribed ? 'text-success-500' : 'text-error-500' },
          { icon: Target, label: 'Scores Entered', value: `${scores.length}/5`, color: scores.length === 5 ? 'text-success-500' : 'text-warning-500' },
          { icon: Trophy, label: 'Total Winnings', value: formatCurrency(convertToINR(totalWinnings)), color: 'text-primary-400' },
          { icon: Heart, label: 'Charity', value: user?.charity_id ? 'Selected' : 'None', color: user?.charity_id ? 'text-accent-400' : 'text-white/40' },
        ].map(s => (
          <div key={s.label} className="glass p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scores & Analytics */}
        <div className="glass p-6 lg:col-span-1 border-primary-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-400" /> Your Scores
            </h2>
            <div className="text-xs badge-primary">Trend: Improving</div>
          </div>

          <div className="h-48 mb-6 w-full">
            {scores.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scores.slice().reverse()}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="play_date" tickFormatter={formatDate} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                Add at least 2 scores to see your trend
              </div>
            )}
          </div>

          {isSubscribed && (
            <form onSubmit={handleAddScore} className="mb-6 p-4 rounded-xl bg-white/3 border border-white/5">
              {scoreError && <p className="text-error-500 text-xs mb-2">{scoreError}</p>}
              <div className="grid grid-cols-5 gap-2">
                <input type="number" min="1" max="45" value={newScore} onChange={e => setNewScore(e.target.value)}
                  placeholder="Score" className="input-field col-span-1 text-center" />
                <input type="date" value={playDate} onChange={e => setPlayDate(e.target.value)}
                  className="input-field col-span-2" />
                <button type="submit" disabled={adding} className="btn-primary col-span-2 text-sm flex items-center justify-center gap-1">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add</>}
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2">{scores.length}/5 scores • Oldest replaced when full</p>
            </form>
          )}

          <div className="space-y-2">
            {scores.length > 0 ? scores.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400">{s.score}</div>
                  <div>
                    <span className="text-white/40 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(s.play_date)}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteScore(s.id)} className="text-white/20 hover:text-error-500 p-1 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )) : <p className="text-white/30 text-center py-6 text-sm">No scores yet. {isSubscribed ? 'Add your first score above!' : 'Subscribe to start.'}</p>}
          </div>

          {scores.length === 5 && (
            <div className="mt-4 p-3 rounded-xl bg-success-500/10 border border-success-500/20">
              <p className="text-success-500 text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" /> Draw numbers: {scores.map((s: any) => s.score).sort((a: number, b: number) => a - b).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Winnings */}
        <div className="glass p-6">
          <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning-500" /> Winnings History
          </h2>
          <div className="space-y-3">
            {winnings.length > 0 ? winnings.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                <div>
                  <div className="text-white font-medium">{formatCurrency(convertToINR(w.prize_amount))}</div>
                  <div className="text-white/40 text-xs">{w.draws?.draw_date ? formatDate(w.draws.draw_date) : 'N/A'}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`badge ${w.verification_status === 'approved' ? 'badge-success' : w.verification_status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                    {w.verification_status || 'pending'}
                  </span>
                  <span className={`badge ${w.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {w.payment_status || 'pending'}
                  </span>
                </div>
              </div>
            )) : <p className="text-white/30 text-center py-8 text-sm">No winnings yet. Keep playing!</p>}
          </div>

          {!user?.charity_id && (
            <Link href="/charities" className="mt-6 block p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-center hover:bg-accent-500/15 transition-all">
              <Heart className="w-5 h-5 text-accent-400 mx-auto mb-2" />
              <p className="text-accent-400 text-sm font-semibold">Choose a Charity</p>
              <p className="text-white/40 text-xs">Select where your contribution goes</p>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
