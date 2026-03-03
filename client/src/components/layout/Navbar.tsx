'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold gradient-text">HeroDraw</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/charities" className="text-white/60 hover:text-white text-sm transition-colors">Charities</Link>
            <Link href="/draw-results" className="text-white/60 hover:text-white text-sm transition-colors">Draw Results</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
                {isAdmin && <Link href="/admin" className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors">Admin</Link>}
                <button onClick={logout} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">Log In</Link>
                <Link href="/signup" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white/60">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/charities" onClick={() => setOpen(false)} className="block text-white/60 hover:text-white text-sm">Charities</Link>
              <Link href="/draw-results" onClick={() => setOpen(false)} className="block text-white/60 hover:text-white text-sm">Draw Results</Link>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-white/60 hover:text-white text-sm">Dashboard</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="block text-amber-400 text-sm">Admin</Link>}
                  <button onClick={() => { logout(); setOpen(false); }} className="text-white/40 text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block text-white/60 text-sm">Log In</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary text-sm w-full text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
