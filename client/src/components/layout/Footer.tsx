import Link from 'next/link';
import { Trophy, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-display font-bold gradient-text">HeroDraw</span>
            </div>
            <p className="text-white/40 text-sm max-w-sm">Play Golf. Win Big. Change Lives. A subscription platform that combines your love for golf with the chance to win prizes and support charities.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/charities" className="block text-white/40 hover:text-white text-sm transition-colors">Charities</Link>
              <Link href="/draw-results" className="block text-white/40 hover:text-white text-sm transition-colors">Draw Results</Link>
              <Link href="/dashboard" className="block text-white/40 hover:text-white text-sm transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <div className="space-y-2">
              <Link href="/login" className="block text-white/40 hover:text-white text-sm transition-colors">Log In</Link>
              <Link href="/signup" className="block text-white/40 hover:text-white text-sm transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} HeroDraw. All rights reserved.</p>
          <p className="text-white/30 text-xs flex items-center gap-1">Made with <Heart className="w-3 h-3 text-accent-400" /> for charity</p>
        </div>
      </div>
    </footer>
  );
}
