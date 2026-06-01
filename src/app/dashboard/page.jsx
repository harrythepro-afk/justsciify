'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getTopics, getUserResults, getBeltForXP, getNextBeltThreshold } from '@/lib/db';

const BELT_META = {
  white:  { color: '#e2e8f0', emoji: '🥋', label: 'White Belt' },
  yellow: { color: '#facc15', emoji: '⭐', label: 'Yellow Belt' },
  green:  { color: '#4ade80', emoji: '🌿', label: 'Green Belt' },
  blue:   { color: '#38bdf8', emoji: '💧', label: 'Blue Belt' },
  red:    { color: '#f87171', emoji: '🔥', label: 'Red Belt' },
  black:  { color: '#c084fc', emoji: '🏆', label: 'Black Belt' },
};

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];

function StatCard({ icon, value, label, color }) {
  return (
    <div className="sci-card p-5 text-center" style={{ borderColor: `${color}20` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-display font-black text-xl" style={{ color }}>{value}</div>
      <div className="font-body text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function DashboardContent() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [topics, setTopics]   = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [t, r] = await Promise.all([
        getTopics(profile.classNum),
        getUserResults(user.$id, 5),
      ]);
      setTopics(t);
      setResults(r);
      setLoading(false);
    })();
  }, [profile, user]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-4" style={{ background: '#03050F' }}>
        <div className="text-center p-8 rounded-3xl max-w-md w-full" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-display font-bold mb-2 text-red-400">Profile Not Found</h2>
          <p className="text-slate-300 text-sm font-body mb-6">
            We couldn't fetch your profile from the database. This usually happens if the <strong>Users collection permissions</strong> are not set in Appwrite, or if the signup was incomplete.
          </p>
          <button onClick={logout} className="w-full btn-primary font-display font-bold text-sm px-6 py-3 rounded-xl text-white">
            Log Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  const belt = BELT_META[profile.beltLevel] || BELT_META.white;
  const nextThreshold = getNextBeltThreshold(profile.xp);
  const currentMin = XP_THRESHOLDS[Object.keys(BELT_META).indexOf(profile.beltLevel)] || 0;
  const nextMin = nextThreshold?.min || currentMin + 500;
  const xpInLevel = profile.xp - currentMin;
  const xpNeeded = nextMin - currentMin;
  const xpPct = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <div className="min-h-screen" style={{ background: '#03050F' }}>
      {/* Top nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>🔬</div>
          <span className="font-display font-black text-lg">
            <span className="text-white">Just</span><span className="gradient-text">Sciify</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/topics">
            <button className="btn-primary font-display font-bold text-xs px-4 py-2 rounded-lg text-white">
              📚 Start Learning
            </button>
          </Link>
          <button onClick={logout}
            className="font-body text-xs text-slate-500 hover:text-white transition-colors px-3 py-2">
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-body text-slate-500 text-sm mb-1">Welcome back,</p>
              <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-3">
                {profile.name} 👋
              </h1>
              {/* Belt badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-display font-bold text-sm"
                style={{ background: `${belt.color}15`, border: `1.5px solid ${belt.color}40`, color: belt.color }}>
                {belt.emoji} {belt.label}
              </div>
            </div>
            {/* Streak */}
            <div className="text-center px-6 py-4 rounded-2xl"
              style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-display font-black text-2xl text-orange-400">{profile.streak}</div>
              <div className="font-body text-slate-500 text-xs">Day Streak</div>
            </div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="rounded-3xl p-6 mb-8"
          style={{ background: 'rgba(11,18,37,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-display font-bold text-white text-sm">XP Progress</span>
              <span className="font-body text-slate-500 text-xs ml-2">→ {nextThreshold ? nextThreshold.belt.charAt(0).toUpperCase() + nextThreshold.belt.slice(1) + ' Belt' : 'Max Level!'}</span>
            </div>
            <span className="font-display font-bold text-sm" style={{ color: belt.color }}>
              {profile.xp} XP {nextThreshold ? `/ ${nextMin} XP` : ''}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${xpPct}%`, background: `linear-gradient(90deg, ${belt.color}, ${belt.color}80)`, boxShadow: `0 0 12px ${belt.color}60` }} />
          </div>
          {nextThreshold && (
            <p className="font-body text-slate-600 text-xs mt-2">
              {nextMin - profile.xp} XP to reach {nextThreshold.belt.charAt(0).toUpperCase() + nextThreshold.belt.slice(1)} Belt
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon="📚" value={profile.completedTopics?.length || 0} label="Topics Done" color="#38bdf8" />
          <StatCard icon="🎯" value={results.length} label="Quizzes Taken" color="#a855f7" />
          <StatCard icon="⭐" value={profile.xp} label="Total XP" color="#facc15" />
          <StatCard icon="🏅" value={Object.keys(BELT_META).indexOf(profile.beltLevel)} label="Belt Level" color="#4ade80" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended topics */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-white text-lg mb-4">
              📖 Continue Learning — Class {profile.classNum}
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-body text-slate-500">No topics found. Ask your admin to add some!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.slice(0, 4).map(t => {
                  const done = profile.completedTopics?.includes(t.$id);
                  return (
                    <div
                      key={t.$id}
                      onClick={() => router.push(`/quiz?topicId=${t.$id}`)}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer group transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(11,18,37,0.8)', border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}` }}
                    >
                      <div className="text-2xl">{t.icon || '📚'}</div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-white text-sm">{t.title}</div>
                        <div className="font-body text-slate-500 text-xs">{t.questionCount || 0} questions</div>
                      </div>
                      {done
                        ? <span className="text-green-400 text-sm font-bold">✓ Done</span>
                        : <span className="font-display text-xs font-bold text-slate-500 group-hover:text-electric-400 transition-colors">Start →</span>
                      }
                    </div>
                  );
                })}
                {topics.length > 4 && (
                  <Link href="/topics">
                    <button className="w-full btn-secondary font-display font-bold text-sm py-3 rounded-xl text-white mt-2">
                      View All {topics.length} Topics →
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent results */}
          <div>
            <h2 className="font-display font-bold text-white text-lg mb-4">🏆 Recent Quizzes</h2>
            {results.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-body text-slate-500 text-sm">No quizzes yet.<br />Start one now!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(r => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const color = pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#f87171';

                  let displayName = 'Science Quiz';
                  if (r.subtopicId) {
                    if (typeof r.subtopicId === 'object') {
                      const subTitle = r.subtopicId.title;
                      const topTitle = r.subtopicId.topicId?.title;
                      displayName = topTitle ? `${topTitle}: ${subTitle}` : subTitle;
                    } else {
                      displayName = r.subtopicId;
                    }
                  }

                  return (
                    <div key={r.$id} className="p-4 rounded-2xl"
                      style={{ background: 'rgba(11,18,37,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-white text-xs">{displayName}</span>
                        <span className="font-display font-bold text-xs" style={{ color }}>
                          {r.score}/{r.total}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="font-body text-xs text-slate-600">
                          {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="font-body text-xs" style={{ color: '#facc15' }}>+{r.xpEarned} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Belt journey */}
        <div className="mt-10 rounded-3xl p-6" style={{ background: 'rgba(11,18,37,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-display font-bold text-white text-lg mb-5">🥋 Belt Journey</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(BELT_META).map(([key, b], i) => {
              const isActive = profile.beltLevel === key;
              const isPast = Object.keys(BELT_META).indexOf(key) < Object.keys(BELT_META).indexOf(profile.beltLevel);
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="text-center px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: isActive ? `${b.color}20` : isPast ? `${b.color}10` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? b.color : isPast ? `${b.color}40` : 'rgba(255,255,255,0.06)'}`,
                      opacity: isPast || isActive ? 1 : 0.4,
                    }}>
                    <div className="text-lg">{b.emoji}</div>
                    <div className="font-display font-bold text-xs mt-0.5" style={{ color: b.color }}>{b.label.split(' ')[0]}</div>
                    {isPast && <div className="text-green-400 text-xs">✓</div>}
                    {isActive && <div className="text-xs font-body" style={{ color: b.color }}>Now</div>}
                  </div>
                  {i < 5 && <div className="text-slate-700">→</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}