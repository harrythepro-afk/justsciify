'use client';
import { useState } from 'react';

const BELTS = [
  {
    name: 'White Belt', color: '#e2e8f0', textColor: '#0f172a', emoji: '🥋',
    xp: '0–100 XP', desc: 'Just getting started! Complete your first 5 topics to earn this belt.',
    unlock: 'Complete 5 topics', level: 1,
  },
  {
    name: 'Yellow Belt', color: '#facc15', textColor: '#0f172a', emoji: '⭐',
    xp: '100–300 XP', desc: 'Rising star! Complete 15 topics with a 70%+ score.',
    unlock: 'Complete 15 topics with 70%+', level: 2,
  },
  {
    name: 'Green Belt', color: '#4ade80', textColor: '#0f172a', emoji: '🌿',
    xp: '300–600 XP', desc: 'Science is growing on you! Ace 25 topics and show your mastery.',
    unlock: 'Ace 25 topics', level: 3,
  },
  {
    name: 'Blue Belt', color: '#38bdf8', textColor: '#0f172a', emoji: '💧',
    xp: '600–1000 XP', desc: 'Deep knowledge! Complete all topics in at least one full class.',
    unlock: 'Finish an entire class', level: 4,
  },
  {
    name: 'Red Belt', color: '#f87171', textColor: '#fff', emoji: '🔥',
    xp: '1000–1500 XP', desc: 'Blazing through science! You\'re in the top 10% of all learners.',
    unlock: 'Reach top 10% ranking', level: 5,
  },
  {
    name: 'Black Belt', color: '#c084fc', textColor: '#fff', emoji: '🏆',
    xp: '1500+ XP', desc: 'Ultimate Science Champion! You\'ve mastered all 3 classes!',
    unlock: 'Master all 3 classes', level: 6,
  },
];

const ACHIEVEMENT_BADGES = [
  { icon: '🌟', name: 'Perfect Score', desc: '100% on any quiz', color: '#facc15' },
  { icon: '🔥', name: 'On Fire!', desc: '7-day streak', color: '#fb923c' },
  { icon: '⚡', name: 'Speed Demon', desc: 'Quiz under 60s', color: '#38bdf8' },
  { icon: '🎯', name: "Bull's Eye", desc: '10 correct in a row', color: '#4ade80' },
  { icon: '🌍', name: 'Explorer', desc: 'All topics visited', color: '#2dd4bf' },
  { icon: '🧪', name: 'Mad Scientist', desc: 'All Class 5 topics', color: '#a855f7' },
];

export default function BadgesRewards() {
  const [active, setActive] = useState(3);
  const belt = BELTS[active];

  return (
    <section className="py-24 relative overflow-hidden" id="badges">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[600px] h-[600px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: `radial-gradient(circle, ${belt.color}, transparent)`, opacity: 0.05, transition: 'all 0.5s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mb-5" style={{ color: '#facc15' }}>
            <span>🥋</span>
            <span>Belt Reward System</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Earn Badges & <span className="gradient-text">Level Up!</span>
          </h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-lg">
            Just like martial arts — work your way from White Belt to the legendary Black Belt Science Champion!
          </p>
        </div>

        {/* Belt selector */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {BELTS.map((b, i) => (
            <button
              key={i}
              id={`belt-${i}`}
              onClick={() => setActive(i)}
              className="font-display font-bold text-xs px-4 py-2.5 rounded-full border-2 transition-all duration-300"
              style={{
                borderColor: b.color,
                color: active === i ? b.textColor : b.color,
                background: active === i ? b.color : 'transparent',
                transform: active === i ? 'scale(1.1)' : 'scale(1)',
                boxShadow: active === i ? `0 0 25px ${b.color}60` : 'none',
                opacity: active === i ? 1 : 0.65,
              }}
            >
              {b.emoji} {b.name}
            </button>
          ))}
        </div>

        {/* Belt detail card */}
        <div className="max-w-2xl mx-auto mb-14">
          <div
            className="rounded-3xl p-8 text-center relative overflow-hidden transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, rgba(11,18,37,0.95), rgba(11,18,37,0.8))`,
              border: `2px solid ${belt.color}40`,
              boxShadow: `0 0 60px ${belt.color}20, 0 30px 60px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Background shine */}
            <div
              className="absolute inset-0 opacity-5"
              style={{ background: `radial-gradient(ellipse at center, ${belt.color}, transparent 70%)` }}
            />

            {/* Level dots */}
            <div className="flex justify-center gap-1.5 mb-5 relative z-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  style={{
                    background: i < belt.level ? belt.color : 'rgba(255,255,255,0.1)',
                    boxShadow: i < belt.level ? `0 0 8px ${belt.color}` : 'none',
                    transform: i === belt.level - 1 ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <div
              className="text-7xl mb-4 relative z-10 inline-block"
              style={{ filter: `drop-shadow(0 0 30px ${belt.color}80)` }}
            >
              {belt.emoji}
            </div>

            <h3
              className="font-display font-black text-3xl mb-2 relative z-10"
              style={{ color: belt.color, textShadow: `0 0 30px ${belt.color}60` }}
            >
              {belt.name}
            </h3>

            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 relative z-10"
              style={{ background: `${belt.color}15`, border: `1px solid ${belt.color}40` }}
            >
              <span className="font-display font-bold text-sm" style={{ color: belt.color }}>{belt.xp}</span>
            </div>

            <p className="font-body text-slate-300 mb-5 relative z-10 text-base leading-relaxed max-w-md mx-auto">
              {belt.desc}
            </p>

            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl relative z-10"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-lg">🔓</span>
              <span className="font-body text-sm text-slate-400">Unlock by: </span>
              <span className="font-body text-sm text-white font-semibold">{belt.unlock}</span>
            </div>
          </div>
        </div>

        {/* Achievement badges */}
        <div className="text-center">
          <h3 className="font-display font-bold text-white text-xl mb-2">Special Achievement Badges</h3>
          <p className="font-body text-slate-500 text-sm mb-8">Earn these through exceptional performance</p>
          <div className="flex flex-wrap justify-center gap-4">
            {ACHIEVEMENT_BADGES.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 w-36 group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: `${b.color}08`,
                  border: `1px solid ${b.color}20`,
                }}
              >
                <div
                  className="text-3xl mb-2 transition-all duration-300 group-hover:scale-125 inline-block"
                  style={{ filter: `drop-shadow(0 0 12px ${b.color}60)` }}
                >
                  {b.icon}
                </div>
                <div className="font-display font-bold text-xs mb-1" style={{ color: b.color }}>{b.name}</div>
                <div className="font-body text-slate-500 text-xs">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
