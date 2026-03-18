'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Trophy, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (password.length < 8) { 
      setError('Password too weak (must be at least 8 characters)'); 
      return; 
    }
    
    if (password !== confirmPw) { 
      setError('Passwords do not match'); 
      return; 
    }

    setLoading(true);
    
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
      console.log('Signup exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const checks = [
    { ok: password.length >= 8, label: '8+ characters' },
    { ok: password === confirmPw && confirmPw.length > 0, label: 'Passwords match' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-20 pb-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">HeroDraw</span>
        </Link>

        <div className="glass-strong p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2">Join HeroDraw</h1>
            <p className="text-white/50">Create your account and start making a difference</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-error-500/10 border border-error-500/20 text-error-500 text-sm">
                {error}
              </motion.div>
            )}
            <div>
              <label className="block text-sm text-white/70 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="input-field pl-11" placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  className="input-field pl-11" placeholder="••••••••" required />
              </div>
            </div>
            <div className="flex gap-4">
              {checks.map(c => (
                <span key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-success-500' : 'text-white/30'}`}>
                  <CheckCircle className="w-3 h-3" /> {c.label}
                </span>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">Already have an account?{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
