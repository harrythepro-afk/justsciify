'use client';
import { useState } from 'react';

const CLASSES = [
  {
    num: 3, emoji: '🌱', color: '#4ade80',
    bg: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.04))',
    borderColor: 'rgba(74,222,128,0.3)',
    topics: ['Plants & Animals', 'Food & Shelter', 'Water & Air', 'Light & Sound'],
    desc: 'Your perfect first step into the world of science!',
    quizzes: 12, badges: 8,
    highlight: 'Perfect for beginners',
  },
  {
    num: 4, emoji: '🔬', color: '#38bdf8',
    bg: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))',
    borderColor: 'rgba(56,189,248,0.4)',
    topics: ['Food & Nutrition', 'Teeth & Microbes', 'Shelter', 'Things We Make & Do'],
    desc: 'Dive deeper with fascinating science experiments!',
    quizzes: 18, badges: 12,
    featured: true,
    highlight: 'Most Popular ⭐',
  },
  {
    num: 5, emoji: '🚀', color: '#a855f7',
    bg: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))',
    borderColor: 'rgba(168,85,247,0.3)',
    topics: ['Living & Non-living', 'Human Body', 'Solar System', 'Matter & Materials'],
    desc: 'Advanced science for seriously curious minds!',
    quizzes: 24, badges: 16,
    highlight: 'Most Challenges',
  },
];

export default function ClassSelector() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-24 relative overflow-hidden" id="classes">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mb-5" style={{ color: '#38bdf8' }}>
            <span>🏫</span>
            <span>Pick Your Level</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Choose Your <span className="gradient-text">Class</span>
          </h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-lg">
            Content perfectly tailored to each grade level. Start exactly where you are.
          </p>
        </div>

        {/* Class cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLASSES.map((c) => (
            <div
              key={c.num}
              id={`class-card-${c.num}`}
              className="relative rounded-3xl p-7 cursor-pointer group transition-all duration-400"
              style={{
                background: c.bg,
                border: `${c.featured ? '2px' : '1px'} solid ${c.featured ? c.borderColor : 'rgba(255,255,255,0.07)'}`,
                boxShadow: hovered === c.num || c.featured
                  ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${c.color}15`
                  : 'none',
                transform: hovered === c.num ? 'translateY(-10px) scale(1.02)' : c.featured ? 'scale(1.03)' : 'scale(1)',
              }}
              onMouseEnter={() => setHovered(c.num)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Popular badge */}
              {c.featured && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 font-display font-black text-xs px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg"
                  style={{
                    background: c.color,
                    color: '#0f172a',
                    boxShadow: `0 0 20px ${c.color}60`,
                  }}
                >
                  {c.highlight}
                </div>
              )}

              {/* Highlight label (non-featured) */}
              {!c.featured && (
                <div
                  className="inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full mb-4"
                  style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}
                >
                  {c.highlight}
                </div>
              )}

              {c.featured && <div className="mb-4" />}

              {/* Emoji + class number */}
              <div
                className="text-5xl mb-2 transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 15px ${c.color}60)`,
                  transform: hovered === c.num ? 'scale(1.2) rotate(-5deg)' : 'scale(1)',
                }}
              >
                {c.emoji}
              </div>

              <h3
                className="font-display font-black text-4xl mb-1"
                style={{ color: c.color, textShadow: `0 0 20px ${c.color}40` }}
              >
                Class {c.num}
              </h3>

              <p className="font-body text-slate-400 text-sm mb-5">{c.desc}</p>

              {/* Topic list */}
              <div className="space-y-2 mb-6">
                {c.topics.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 font-body text-sm text-slate-300">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }}
                    />
                    {t}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  className="text-center rounded-2xl py-3"
                  style={{ background: `${c.color}10`, border: `1px solid ${c.color}20` }}
                >
                  <div className="font-display font-black text-xl" style={{ color: c.color }}>{c.quizzes}</div>
                  <div className="font-body text-slate-500 text-xs">Quizzes</div>
                </div>
                <div
                  className="text-center rounded-2xl py-3"
                  style={{ background: `${c.color}10`, border: `1px solid ${c.color}20` }}
                >
                  <div className="font-display font-black text-xl" style={{ color: c.color }}>{c.badges}</div>
                  <div className="font-body text-slate-500 text-xs">Badges</div>
                </div>
              </div>

              {/* CTA button */}
              <button
                className="w-full font-display font-bold py-3.5 rounded-2xl text-sm transition-all duration-300"
                style={{
                  background: c.color,
                  color: '#0f172a',
                  boxShadow: hovered === c.num ? `0 0 30px ${c.color}60` : `0 0 15px ${c.color}30`,
                }}
              >
                Start Class {c.num} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
