'use client';
import { useState } from 'react';

const TOPICS = [
  {
    icon: '🌿', title: 'Plants & Trees', classes: ['3', '4', '5'],
    desc: 'Photosynthesis, plant parts, types of plants and their importance in our ecosystem.',
    color: '#4ade80', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.2)',
    questions: 45, chapters: 6, tag: 'Popular',
  },
  {
    icon: '🦁', title: 'Animals', classes: ['3', '4', '5'],
    desc: 'Habitats, food chains, wild vs domestic, and fascinating animal adaptations.',
    color: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.2)',
    questions: 52, chapters: 8, tag: 'New!',
  },
  {
    icon: '🌍', title: 'Earth & Environment', classes: ['4', '5'],
    desc: 'Soil, water cycle, weather patterns, natural resources, and pollution effects.',
    color: '#38bdf8', bg: 'rgba(56,189,248,0.07)', border: 'rgba(56,189,248,0.2)',
    questions: 38, chapters: 5,
  },
  {
    icon: '🚀', title: 'Space & Solar System', classes: ['5'],
    desc: 'Planets, the Sun, Moon, stars, day & night cycles, and the four seasons.',
    color: '#a855f7', bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.2)',
    questions: 60, chapters: 9, tag: '⭐ Top Rated',
  },
  {
    icon: '🧬', title: 'Human Body', classes: ['4', '5'],
    desc: 'Body parts, organs, the five senses, food & nutrition, and personal health.',
    color: '#f472b6', bg: 'rgba(244,114,182,0.07)', border: 'rgba(244,114,182,0.2)',
    questions: 55, chapters: 7,
  },
  {
    icon: '💧', title: 'Water & Air', classes: ['3', '4'],
    desc: 'Properties of water, uses of air, the water cycle, and air pollution.',
    color: '#2dd4bf', bg: 'rgba(45,212,191,0.07)', border: 'rgba(45,212,191,0.2)',
    questions: 40, chapters: 5,
  },
  {
    icon: '🍎', title: 'Food & Nutrition', classes: ['3', '4', '5'],
    desc: 'Healthy food habits, food groups, cooking methods, and preservation techniques.',
    color: '#facc15', bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.2)',
    questions: 35, chapters: 4,
  },
  {
    icon: '🪨', title: 'Matter & Materials', classes: ['5'],
    desc: 'Solid, liquid, gas — properties of materials, and changes in matter.',
    color: '#94a3b8', bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.2)',
    questions: 42, chapters: 6,
  },
];

export default function TopicsShowcase() {
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState('All');

  const classFilters = ['All', 'Class 3', 'Class 4', 'Class 5'];

  const filtered = TOPICS.filter(t => {
    if (filter === 'All') return true;
    const num = filter.split(' ')[1];
    return t.classes.includes(num);
  });

  return (
    <section className="py-24 relative overflow-hidden" id="topics">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[600px] h-[600px] right-0 top-1/4"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), transparent)', opacity: 0.05 }} />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-5" style={{ color: '#a855f7' }}>
            <span>🧪</span>
            <span>Science Topics</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Explore <span className="gradient-text">Amazing Topics</span>
          </h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-lg">
            100% aligned with NCERT curriculum. Interactive lessons for every topic covered in Class 3, 4, and 5.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {classFilters.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="font-display font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-300"
              style={
                filter === c
                  ? {
                      background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                      color: '#ffffff',
                      boxShadow: '0 0 25px rgba(14,165,233,0.4)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8',
                    }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Topic grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((t, i) => (
            <div
              key={i}
              id={`topic-card-${i}`}
              className="rounded-3xl p-6 cursor-pointer relative overflow-hidden group transition-all duration-300"
              style={{
                background: hovered === i ? t.bg : 'rgba(11,18,37,0.6)',
                border: `1px solid ${hovered === i ? t.border : 'rgba(255,255,255,0.06)'}`,
                transform: hovered === i ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hovered === i ? `0 20px 50px rgba(0,0,0,0.4), 0 0 40px ${t.color}15` : 'none',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tag */}
              {t.tag && (
                <div
                  className="absolute top-3 right-3 font-display font-bold text-xs px-2.5 py-1 rounded-full"
                  style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                >
                  {t.tag}
                </div>
              )}

              {/* Shimmer on hover */}
              {hovered === i && (
                <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
              )}

              {/* Icon */}
              <div
                className="text-4xl mb-3 transition-all duration-300 inline-block"
                style={{
                  transform: hovered === i ? 'scale(1.3) rotate(5deg)' : 'scale(1)',
                  filter: `drop-shadow(0 0 ${hovered === i ? '20px' : '0px'} ${t.color}80)`,
                }}
              >
                {t.icon}
              </div>

              {/* Class badges */}
              <div className="flex gap-1 mb-2">
                {t.classes.map(cls => (
                  <span
                    key={cls}
                    className="font-body text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}
                  >
                    Class {cls}
                  </span>
                ))}
              </div>

              <h3 className="font-display font-bold text-white text-base mb-2">{t.title}</h3>
              <p className="font-body text-slate-400 text-xs leading-relaxed mb-4">{t.desc}</p>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-slate-500">❓ {t.questions} Q</span>
                  <span className="font-body text-xs text-slate-500">📖 {t.chapters} Ch</span>
                </div>
                <span
                  className="font-display text-xs font-bold flex items-center gap-1 transition-all duration-200"
                  style={{
                    color: t.color,
                    transform: hovered === i ? 'translateX(3px)' : 'translateX(0)',
                  }}
                >
                  Explore →
                </span>
              </div>

              {/* Bottom glow line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                  opacity: hovered === i ? 1 : 0,
                }}
              />
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <button className="btn-secondary font-display font-bold text-sm px-7 py-3 rounded-xl text-white inline-flex items-center gap-2">
            View All Topics
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
