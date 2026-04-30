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
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
            <LogIn className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Admin Portal</h1>
          <p className="mt-3 text-neutral-600">Access your dashboard to manage apartments and bookings.</p>
        </div>

        <div className="rounded-3xl bg-white p-10 shadow-xl ring-1 ring-neutral-200">
          <div className="mb-8 rounded-2xl bg-blue-50/50 p-4 border border-blue-100">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Admin Credentials</p>
            <div className="space-y-1 text-sm font-medium text-blue-900">
              <p>Email: admin@inkindi.com</p>
              <p>Pass: admin123</p>
            </div>
            <p className="mt-2 text-[10px] text-blue-500 italic">Note: Use these to log in (ensure email/password is enabled in console).</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="admin@inkindi.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-neutral-900 py-4 font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-neutral-400">
            Exclusive access for authorized Inkindi administrators only.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
