'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { charityAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, convertToINR } from '@/lib/utils';
import { Heart, Search, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

export default function CharitiesPage() {
  const { user, refresh } = useAuth();
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selecting, setSelecting] = useState<string | null>(null);
  const [pct, setPct] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await charityAPI.getAll();
        setCharities(data.charities);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSelect = async (charityId: string) => {
    setSelecting(charityId);
    try {
      await charityAPI.select({ charityId, contributionPct: pct });
      await refresh();
    } catch (err) { console.error(err); }
    setSelecting(null);
  };

  const categories = ['all', ...new Set(charities.map(c => c.category))];
  const filtered = charities.filter(c => {
    if (filter !== 'all' && c.category !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">
          Our <span className="gradient-text">Charity Partners</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto">Choose where your contribution goes. Every subscription supports these amazing causes.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search charities..." className="input-field pl-11" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === cat ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Contribution slider */}
      {user && (
        <div className="glass p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-white/50 text-sm shrink-0">Your Contribution:</span>
          <input type="range" min="10" max="100" step="5" value={pct} onChange={e => setPct(parseInt(e.target.value))}
            className="flex-1 accent-accent-500" />
          <span className="text-accent-400 font-bold text-lg w-16 text-right">{pct}%</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((charity, i) => {
            const isSelected = user?.charity_id === charity.id;
            return (
              <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass p-6 group hover:border-accent-500/30 transition-all ${isSelected ? 'border-accent-500/50 ring-1 ring-accent-500/20' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-accent-400" />
                  </div>
                  {charity.is_featured && <span className="badge-primary text-xs">Featured</span>}
                </div>
                <span className="text-xs text-white/40">{charity.category}</span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2">{charity.name}</h3>
                <p className="text-white/50 text-sm mb-4 line-clamp-3">{charity.description}</p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/40">Total Received</div>
                    <div className="text-accent-400 font-bold">{formatCurrency(convertToINR(charity.total_received || 0))}</div>
                  </div>

                  {user && (
                    isSelected ? (
                      <span className="flex items-center gap-1 text-success-500 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" /> Selected
                      </span>
                    ) : (
                      <button onClick={() => handleSelect(charity.id)} disabled={selecting === charity.id}
                        className="btn-outline text-sm !py-2 !px-4 flex items-center gap-1">
                        {selecting === charity.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Select'}
                      </button>
                    )
                  )}
                </div>

                {charity.website_url && (
                  <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                    className="mt-3 text-primary-400/60 hover:text-primary-400 text-xs flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Website
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-white/40 text-center py-16">No charities found matching your search.</p>
      )}
    </main>
  );
}
