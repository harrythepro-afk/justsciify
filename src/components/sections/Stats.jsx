'use client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

function CountUp({ end, duration = 2200, suffix = '' }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const STATS = [
  {
    num: 10000, suffix: '+', label: 'Kids Learning', icon: '👧',
    color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',
    description: 'Active learners',
  },
  {
    num: 500, suffix: '+', label: 'Science Topics', icon: '📚',
    color: '#a855f7', bg: 'rgba(168,85,247,0.08)',
    description: 'Across all classes',
  },
  {
    num: 2000, suffix: '+', label: 'Quiz Questions', icon: '🎯',
    color: '#4ade80', bg: 'rgba(74,222,128,0.08)',
    description: 'Adaptive & graded',
  },
  {
    num: 50000, suffix: '+', label: 'Badges Earned', icon: '🏅',
    color: '#fb923c', bg: 'rgba(251,146,60,0.08)',
    description: 'Achievements unlocked',
  },
  {
    num: 99, suffix: '%', label: 'Love It', icon: '💖',
    color: '#f472b6', bg: 'rgba(244,114,182,0.08)',
    description: 'Kid satisfaction rate',
  },
  {
    num: 3, suffix: '', label: 'Classes Covered', icon: '🏫',
    color: '#facc15', bg: 'rgba(250,204,21,0.08)',
    description: 'Classes 3, 4 & 5',
  },
];

export default function Stats() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section className="py-20 relative overflow-hidden" id="stats">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), rgba(168,85,247,0.4), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4" ref={ref}>
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="section-label mb-4" style={{ color: '#38bdf8' }}>
            <span>📊</span>
            <span>By The Numbers</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white">
            Trusted by <span className="gradient-text">Thousands of Families</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="sci-card p-5 text-center group cursor-default hover:scale-105"
              style={{
                background: s.bg,
                borderColor: `${s.color}20`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Icon with glow */}
              <div
                className="text-3xl mb-3 transition-transform group-hover:scale-125 duration-300 inline-block"
              >
                {s.icon}
              </div>

              {/* Counter */}
              <div
                className="font-display font-black text-2xl mb-0.5"
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}
              >
                {inView ? <CountUp end={s.num} suffix={s.suffix} /> : '0'}
              </div>

              <div className="font-display font-bold text-white text-xs mb-1">{s.label}</div>
              <div className="font-body text-slate-600 text-xs">{s.description}</div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: s.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
