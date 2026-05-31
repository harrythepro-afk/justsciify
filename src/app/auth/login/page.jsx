'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#03050F' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[500px] h-[500px] -top-40 -left-40"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,1), transparent)', opacity: 0.1 }} />
        <div className="aurora-blob w-[400px] h-[400px] bottom-0 right-0"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), transparent)', opacity: 0.08 }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
              🔬
            </div>
            <span className="font-display font-black text-2xl">
              <span className="text-white">Just</span>
              <span className="gradient-text">Sciify</span>
            </span>
          </Link>
          <h1 className="font-display font-black text-2xl text-white mt-6 mb-1">Welcome back!</h1>
          <p className="font-body text-slate-500 text-sm">Log in to continue your science journey 🚀</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: 'rgba(11,18,37,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="font-body text-sm text-slate-400 mb-1.5 block">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl font-body text-white text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-body text-sm text-slate-400">Password</label>
                <button type="button" className="font-body text-xs text-electric-400 hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl font-body text-white text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl font-body text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-display font-bold text-base py-3.5 rounded-xl text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Logging in...' : '🚀 Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="font-body text-slate-600 text-xs">Don&apos;t have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <Link href="/auth/signup">
            <button className="w-full btn-secondary font-display font-bold text-sm py-3 rounded-xl text-white">
              ✨ Create Free Account
            </button>
          </Link>
        </div>

        <p className="text-center font-body text-slate-700 text-xs mt-6">
          By logging in, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
