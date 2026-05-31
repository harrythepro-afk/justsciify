'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const CLASSES = [
  { num: 3, emoji: '🌱', color: '#4ade80' },
  { num: 4, emoji: '🔬', color: '#38bdf8' },
  { num: 5, emoji: '🚀', color: '#a855f7' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm]     = useState({ name: '', email: '', password: '', classNum: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.classNum) { setError('Please select your class!'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, form.classNum);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#03050F' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[500px] h-[500px] top-0 right-0"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), transparent)', opacity: 0.1 }} />
        <div className="aurora-blob w-[400px] h-[400px] bottom-0 -left-20"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,1), transparent)', opacity: 0.07 }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
              🔬
            </div>
            <span className="font-display font-black text-2xl">
              <span className="text-white">Just</span>
              <span className="gradient-text">Sciify</span>
            </span>
          </Link>
          <h1 className="font-display font-black text-2xl text-white mt-6 mb-1">Create your account</h1>
          <p className="font-body text-slate-500 text-sm">Start your science adventure for free! 🧪</p>
        </div>

        <div className="rounded-3xl p-8" style={{ background: 'rgba(11,18,37,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="font-body text-sm text-slate-400 mb-1.5 block">Your Name</label>
              <input
                id="signup-name"
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Arya Sharma"
                className="w-full px-4 py-3 rounded-xl font-body text-white text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-body text-sm text-slate-400 mb-1.5 block">Email Address</label>
              <input
                id="signup-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl font-body text-white text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-body text-sm text-slate-400 mb-1.5 block">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl font-body text-white text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Class selector */}
            <div>
              <label className="font-body text-sm text-slate-400 mb-3 block">Which class are you in?</label>
              <div className="grid grid-cols-3 gap-3">
                {CLASSES.map(c => (
                  <button
                    key={c.num}
                    type="button"
                    id={`class-select-${c.num}`}
                    onClick={() => setForm(f => ({ ...f, classNum: c.num }))}
                    className="py-4 rounded-2xl text-center transition-all duration-200 font-display font-bold"
                    style={{
                      background: form.classNum === c.num ? `${c.color}20` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${form.classNum === c.num ? c.color : 'rgba(255,255,255,0.08)'}`,
                      color: form.classNum === c.num ? c.color : '#94a3b8',
                      boxShadow: form.classNum === c.num ? `0 0 20px ${c.color}30` : 'none',
                      transform: form.classNum === c.num ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <div className="text-2xl mb-1">{c.emoji}</div>
                    <div className="text-xs">Class {c.num}</div>
                  </button>
                ))}
              </div>
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
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-display font-bold text-base py-3.5 rounded-xl text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating account...' : '✨ Create Free Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="font-body text-slate-600 text-xs">Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <Link href="/auth/login">
            <button className="w-full btn-secondary font-display font-bold text-sm py-3 rounded-xl text-white">
              🔑 Log In
            </button>
          </Link>
        </div>

        <p className="text-center font-body text-slate-700 text-xs mt-6">
          Free forever · No credit card · NCERT Aligned
        </p>
      </div>
    </div>
  );
}
