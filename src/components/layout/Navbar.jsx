'use client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Topics', href: '#topics' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Badges', href: '#badges' },
    { label: 'Quiz Demo', href: '#quiz' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'py-5'
      }`}
      style={scrolled ? { background: 'rgba(3,5,15,0.85)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
              🔬
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#03050F] animate-pulse" />
          </div>
          <span className="font-display font-black text-xl tracking-tight">
            <span className="text-white">Just</span>
            <span className="gradient-text">Sciify</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="font-body text-sm font-semibold text-slate-400 hover:text-white transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/05"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="font-body font-bold text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Log In
          </button>
          <button
            className="btn-primary font-display font-bold text-sm px-5 py-2.5 rounded-xl text-white"
          >
            Start Free 🚀
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl glass text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l14 14M16 2L2 16" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 5h14M2 9h14M2 13h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] px-6 py-4 space-y-1"
          style={{ background: 'rgba(3,5,15,0.95)', backdropFilter: 'blur(20px)' }}>
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="block font-body font-semibold text-slate-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/05 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.06] mt-3">
            <button
              className="btn-primary w-full font-display font-bold py-3 rounded-xl text-white"
            >
              Start Free 🚀
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
