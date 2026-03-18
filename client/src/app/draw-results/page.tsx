'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { drawAPI } from '@/lib/api';
import { formatCurrency, convertToINR, formatDate } from '@/lib/utils';
import { Trophy, Calendar, Users, Loader2, Hash } from 'lucide-react';

export default function DrawResultsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await drawAPI.results();
        setDraws(data.draws);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">
          <span className="gradient-text">Draw Results</span>
        </h1>
        <p className="text-white/50 max-w-lg mx-auto">See past winning numbers, prize pools, and participant counts.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
      ) : draws.length > 0 ? (
        <div className="space-y-6">
          {draws.map((draw, i) => (
            <motion.div key={draw.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{formatDate(draw.draw_date)}</h3>
                    <span className={`badge ${draw.status === 'published' ? 'badge-success' : 'badge-warning'} mt-1`}>{draw.status}</span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-1">Prize Pool</div>
                    <div className="text-warning-500 font-bold">{formatCurrency(convertToINR(draw.prize_pool || 0))}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-1">Players</div>
                    <div className="text-white font-bold flex items-center gap-1"><Users className="w-3 h-3" /> {draw.total_participants || 0}</div>
                  </div>
                  {draw.jackpot_rollover > 0 && (
                    <div className="text-center">
                      <div className="text-white/40 text-xs mb-1">Rollover</div>
                      <div className="text-accent-400 font-bold">{formatCurrency(convertToINR(draw.jackpot_rollover))}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Winning Numbers */}
              <div>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                  <Hash className="w-3 h-3" /> Winning Numbers
                </div>
                <div className="flex gap-3 flex-wrap">
                  {(draw.winning_numbers || []).map((n: number) => (
                    <div key={n} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <span className="text-white font-bold text-lg">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 text-center">
          <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white/40 mb-2">No Draws Yet</h3>
          <p className="text-white/30 text-sm">The first monthly draw is coming soon. Make sure your scores are entered!</p>
        </div>
      )}
    </main>
  );
}
