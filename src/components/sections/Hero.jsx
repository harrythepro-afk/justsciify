'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';

const WORDS = ['Plants 🌿', 'Space 🚀', 'Animals 🦁', 'Human Body 🧬', 'Earth 🌍', 'Chemistry 🧪'];

const FLOATING_ICONS = [
  { icon: '🔬', x: '6%', y: '22%', delay: '0s', size: '2.2rem', dur: '7s' },
  { icon: '⚛️', x: '88%', y: '18%', delay: '1.2s', size: '2.6rem', dur: '6s' },
  { icon: '🧬', x: '4%', y: '62%', delay: '2.1s', size: '2rem', dur: '8s' },
  { icon: '🚀', x: '91%', y: '58%', delay: '0.7s', size: '2.4rem', dur: '7.5s' },
  { icon: '🌍', x: '12%', y: '82%', delay: '1.8s', size: '2.1rem', dur: '6.5s' },
  { icon: '⭐', x: '82%', y: '78%', delay: '3.2s', size: '1.9rem', dur: '5.5s' },
  { icon: '🧪', x: '93%', y: '38%', delay: '2.8s', size: '1.9rem', dur: '8s' },
  { icon: '🌱', x: '2%', y: '45%', delay: '1.4s', size: '2.1rem', dur: '6.8s' },
  { icon: '💡', x: '75%', y: '8%', delay: '0.4s', size: '1.8rem', dur: '7.2s' },
  { icon: '🔭', x: '20%', y: '10%', delay: '2.5s', size: '2rem', dur: '7s' },
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const canvasRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const current = WORDS[wordIndex];
    let timeout;
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((wordIndex + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  // Canvas star field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.opacity += 0.008 * s.opacityDir;
        if (s.opacity >= 1) s.opacityDir = -1;
        if (s.opacity <= 0.1) s.opacityDir = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const STATS = useMemo(() => [
    { num: '10K+', label: 'Kids Learning', icon: '👧', color: '#38bdf8' },
    { num: '500+', label: 'Topics', icon: '📚', color: '#a855f7' },
    { num: '2000+', label: 'Quizzes', icon: '❓', color: '#4ade80' },
    { num: '50K+', label: 'Badges Earned', icon: '🏅', color: '#fb923c' },
  ], []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Canvas star field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Aurora blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-blob w-[700px] h-[700px] -top-40 -left-40"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,1), rgba(56,189,248,0.3), transparent 70%)' }} />
        <div className="aurora-blob w-[600px] h-[600px] -top-20 right-0"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), rgba(168,85,247,0.2), transparent 70%)', opacity: 0.12 }} />
        <div className="aurora-blob w-[500px] h-[500px] bottom-0 left-1/3"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,1), rgba(34,197,94,0.2), transparent 70%)', opacity: 0.08 }} />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ICONS.map((item, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: item.x, top: item.y,
              fontSize: item.size,
              animationDelay: item.delay,
              animationDuration: item.dur,
              animation: `float ${item.dur} ease-in-out ${item.delay} infinite`,
              filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.5)) drop-shadow(0 0 24px rgba(168,85,247,0.3))',
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-28 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-label text-electric-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span style={{ color: '#38bdf8' }}>NCERT Aligned · Class 3–5 · India&apos;s #1 Science Platform</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display font-black leading-[1.1] tracking-tight mb-4">
            <div className="text-5xl md:text-7xl text-white mb-3">
              Explore{' '}
              <span className="relative inline-block">
                <span className="gradient-text">{displayed}</span>
                <span
                  className="inline-block w-[3px] h-[0.8em] ml-1 align-middle rounded-sm animate-pulse"
                  style={{ background: 'linear-gradient(180deg, #38bdf8, #a855f7)', verticalAlign: 'middle' }}
                />
              </span>
            </div>
            <div className="text-4xl md:text-6xl">
              <span className="text-white">Make Science </span>
              <span className="glow-text" style={{ color: '#38bdf8' }}>Your Superpower!</span>
            </div>
          </h1>
        </div>

        <p
          className="font-body text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.35s' }}
        >
          The most exciting way for kids to learn science. Interactive 3D lessons, gamified quizzes, and a martial-arts belt reward system — all aligned with your school syllabus! 🎓
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up"
          style={{ animationDelay: '0.5s' }}
        >
          <Link href="/auth/signup">
            <button
              id="hero-cta-primary"
              className="btn-primary animate-pulse-glow font-display font-bold text-lg px-10 py-4 rounded-2xl text-white relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                🚀 Start Learning Free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 shimmer opacity-40" />
            </button>
          </Link>
          <button
            id="hero-cta-secondary"
            className="btn-secondary font-display font-bold text-lg px-10 py-4 rounded-2xl text-white flex items-center gap-2"
            onClick={() => document.getElementById('live-quiz-demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-xl">👀</span> Watch Demo
          </button>
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap justify-center gap-3 mb-16 animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          {['✓ Free to Start', '✓ No Credit Card', '✓ NCERT Aligned', '✓ All Progress Saved'].map((t, i) => (
            <span key={i} className="font-body text-sm text-slate-500">
              {t}
            </span>
          ))}
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-slide-up"
          style={{ animationDelay: '0.7s' }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              className="sci-card p-4 text-center group cursor-default"
              style={{ borderColor: `${s.color}25` }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-black text-xl" style={{ color: s.color }}>{s.num}</div>
              <div className="font-body text-slate-500 text-xs mt-0.5">{s.label}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity cursor-pointer">
        <span className="font-body text-xs text-slate-500 tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border border-slate-600 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-electric-400 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, #03050F)' }} />
    </section>
  );
}
