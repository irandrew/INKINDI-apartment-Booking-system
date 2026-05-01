import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, ArrowRight, Mail, Lock } from 'lucide-react';

export default function AdminLogin({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@inkindi.com');
  const [password, setPassword] = useState('admin123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Failed to sign in. Please check your credentials or ensure Email/Password auth is enabled in Firebase Console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen items-stretch overflow-hidden bg-white"
    >
      {/* Left Side: Elegant Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-[45%] lg:px-24">
        <div className="mb-16">
          <div className="mb-12">
            <span className="text-4xl italic font-serif leading-none tracking-tight">Inkindi</span>
            <span className="premium-label !text-[8px] opacity-40 mt-1 block">Exclusive Residences</span>
          </div>
          <h1 className="text-4xl font-serif italic tracking-tight text-neutral-900 mb-4">Admin Access</h1>
          <p className="text-neutral-500 font-light tracking-wide">Enter your credentials to manage the portfolio.</p>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600">
                  <LogIn className="h-5 w-5" />
                </div>
                <div>
                   <span className="premium-label !text-[10px] opacity-50 block">Security Protocol</span>
                   <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">Admin Credentials</span>
                </div>
             </div>
            <div className="space-y-2 text-sm font-medium text-neutral-600">
              <div className="flex justify-between">
                <span className="opacity-50">Email</span>
                <span className="font-mono text-xs">admin@inkindi.com</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Auth Code</span>
                <span className="font-mono text-xs">admin123</span>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-50 p-5 text-xs font-bold tracking-wider text-red-600 border border-red-100 uppercase"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-2">
              <label className="premium-label !text-[10px] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-neutral-200 bg-transparent py-4 pl-8 pr-4 outline-none transition-all placeholder:text-neutral-300 focus:border-gold-600 text-sm tracking-wide"
                  placeholder="admin@inkindi.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="premium-label !text-[10px] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-neutral-200 bg-transparent py-4 pl-8 pr-4 outline-none transition-all placeholder:text-neutral-300 focus:border-gold-600 text-sm tracking-wide"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-4 rounded-full bg-neutral-950 py-6 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-16 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-300 font-bold">
          Inkindi Residences © {new Date().getFullYear()} — Secure Access Only
        </p>
      </div>

      {/* Right Side: Showcase Image */}
      <div className="relative hidden lg:block lg:flex-1 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1628592102751-ba83b0314276?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Residence" 
          className="h-full w-full object-cover grayscale brightness-75 transition-transform duration-[10s] hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-neutral-950/20" />
        <div className="absolute bottom-20 left-20 right-20">
          <div className="h-[1px] w-24 bg-gold-500 mb-8" />
          <h2 className="text-6xl italic font-serif text-white tracking-tight leading-none mb-6">Redefining <br/> Hospitality.</h2>
          <p className="text-white/60 text-lg font-light tracking-widest uppercase">The Inkindi Curated Collection</p>
        </div>
      </div>
    </motion.div>
  );
}
