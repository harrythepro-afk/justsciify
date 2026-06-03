'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getTopics } from '@/lib/db';

function TopicsContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  useEffect(() => {
    if (profile) {
      setSelectedClass(profile.classNum || 4);
    }
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getTopics(selectedClass);
        setTopics(data);
      } catch (err) {
        console.error('Failed to load topics:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass]);

  if (!profile) return null;

  return (
    <div className="min-h-screen pb-20 relative" style={{ background: '#03050F' }}>
      {/* Decorative background blobs */}
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>🔬</div>
          <span className="font-display font-black text-lg">
            <span className="text-white">Just</span><span className="gradient-text">Sciify</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {profile?.email === 'admin@justsciify.com' && (
            <Link href="/admin">
              <button className="btn-secondary font-display font-bold text-xs px-4 py-2 rounded-lg text-white hover:bg-red-500/10 transition-colors" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
                ⚙️ Admin Console
              </button>
            </Link>
          )}
          <Link href="/dashboard" className="font-body text-xs text-slate-400 hover:text-white transition-colors px-3 py-2">
            Dashboard
          </Link>
          <Link href="/class">
            <button className="btn-secondary font-display font-bold text-xs px-4 py-2 rounded-lg text-white">
              🏫 Change Class
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-12 z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-label mb-3">Syllabus Grid</span>
            <h1 className="font-display font-black text-4xl text-white mb-2 tracking-tight">
              Science <span className="gradient-text">Topics Catalog</span>
            </h1>
            <p className="font-body text-slate-400 text-sm max-w-xl leading-relaxed">
              Explore science topics aligned with your class curriculum. Collect XP, master the topics, and unlock powerful colored belts!
            </p>
          </div>

          {/* Grade filter tabs */}
          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5 self-start">
            {[3, 4, 5].map((cNum) => (
              <button
                key={cNum}
                onClick={() => setSelectedClass(cNum)}
                className={`font-display font-bold text-xs px-5 py-2.5 rounded-lg transition-all ${
                  selectedClass === cNum
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Grade {cNum}
              </button>
            ))}
          </div>
        </div>

        {/* Topics grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl shimmer" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="font-display font-black text-xl text-white mb-2">No Topics Available Yet</h3>
            <p className="font-body text-slate-500 max-w-md mx-auto text-sm">
              We are working hard to prepare interesting quizzes and facts for Class {selectedClass}. Check back in shortly or ask your admin to seed some topics!
            </p>
            {profile.email === 'admin@justsciify.com' && (
              <Link href="/admin" className="inline-block mt-6">
                <button className="btn-primary font-display font-bold text-xs px-6 py-3 rounded-xl text-white">
                  ⚙️ Go to Admin Panel to Add Data
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t) => {
              const isCompleted = profile.completedTopics?.includes(t.$id);
              const cardColor = t.color || '#38bdf8';
              const isExpanded = expandedTopicId === t.$id;

              return (
                <div
                  key={t.$id}
                  onClick={() => setExpandedTopicId(isExpanded ? null : t.$id)}
                  className={`sci-card p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 relative ${
                    isExpanded ? 'border-sky-500/50' : 'hover:-translate-y-2.5'
                  }`}
                  style={{
                    borderColor: isExpanded ? `${cardColor}60` : isCompleted ? '#4ade8050' : 'rgba(255,255,255,0.06)',
                    background: 'rgba(11, 18, 37, 0.7)',
                  }}
                >
                  {/* Outer glow aura on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `0 0 30px ${cardColor}50`,
                      border: `1px solid ${cardColor}`,
                    }}
                  />

                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/30 text-green-400 font-display font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>✓</span> Mastered
                    </div>
                  )}

                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110 duration-300"
                      style={{ background: `${cardColor}15`, border: `1px solid ${cardColor}30` }}>
                      {t.icon || '📚'}
                    </div>

                    <h3 className="font-display font-black text-lg text-white mb-2 group-hover:text-slate-100 transition-colors">
                      {t.title}
                    </h3>
                    <p className="font-body text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                      {t.description}
                    </p>

                    {/* Subtopics List Section */}
                    {isExpanded && t.subtopics && t.subtopics.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5 animate-fade-in">
                        <h4 className="font-display font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                          Chapters / Subtopics
                        </h4>
                        {t.subtopics.map((sub) => {
                          const isSubDone = profile.completedTopics?.includes(sub.$id || sub.id);
                          return (
                            <div
                              key={sub.$id || sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/quiz?topicId=${t.$id}&subtopicId=${sub.$id || sub.id}`);
                              }}
                              className="p-3 rounded-xl flex items-center justify-between gap-3 group/sub bg-slate-950/40 border border-white/5 hover:border-sky-500/30 transition-all hover:bg-slate-900/60"
                            >
                              <div className="flex-1">
                                <div className="font-display font-bold text-xs text-white group-hover/sub:text-sky-400 transition-colors">
                                  {sub.title}
                                </div>
                                <div className="font-body text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                                  {sub.description}
                                </div>
                              </div>
                              {isSubDone ? (
                                <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                  ✓ Mastered
                                </span>
                              ) : (
                                <span className="font-display text-[10px] font-bold text-sky-400 group-hover/sub:translate-x-0.5 transition-transform">
                                  Start →
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="font-body text-[11px] text-slate-500">
                      📝 {t.subtopics?.length || 0} Subtopics
                    </span>
                    <span className="font-display font-bold text-xs transition-all flex items-center gap-1"
                      style={{ color: isCompleted ? '#4ade80' : cardColor }}>
                      {isExpanded ? 'Collapse' : 'Explore Chapters'}
                      <span className="transform transition-transform group-hover:translate-x-0.5">
                        {isExpanded ? '↑' : '→'}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <AuthGuard>
      <TopicsContent />
    </AuthGuard>
  );
}
