'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { updateUserProfile } from '@/lib/db';
import Link from 'next/link';

function ClassSelectorContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loadingClass, setLoadingClass] = useState(null);

  const classes = [
    {
      num: 3,
      title: 'Class 3 Explorers',
      age: 'Ages 8-9',
      icon: '🌱',
      color: '#4ade80',
      shadowColor: 'rgba(74,222,128,0.25)',
      description: 'Start your science journey! Explore plants, animals, food, and water.',
      topics: ['Living vs Non-Living', 'Plants & Animals', 'Air & Water', 'Our Body']
    },
    {
      num: 4,
      title: 'Class 4 Champions',
      age: 'Ages 9-10',
      icon: '💧',
      color: '#38bdf8',
      shadowColor: 'rgba(56,189,248,0.25)',
      description: 'Go deeper! Discover the water cycle, properties of materials, and space.',
      topics: ['Magical Water Cycle', 'Solids, Liquids, Gases', 'Solar System', 'Teeth & Digestion']
    },
    {
      num: 5,
      title: 'Class 5 Masters',
      age: 'Ages 10-11',
      icon: '🍎',
      color: '#a855f7',
      shadowColor: 'rgba(168,85,247,0.25)',
      description: 'Become a master! Learn about gravity, natural disasters, and plant life cycles.',
      topics: ['Forces & Gravity', 'Seeds & Seeding', 'Forests & Wildlife', 'Natural Disasters']
    }
  ];

  const handleSelectClass = async (classNum) => {
    setLoadingClass(classNum);
    try {
      await updateUserProfile(user.$id, { classNum: parseInt(classNum) });
      await refreshProfile();
      router.push('/topics');
    } catch (err) {
      console.error('Failed to update class:', err);
    } finally {
      setLoadingClass(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 relative flex flex-col justify-center items-center overflow-hidden" style={{ background: '#03050F' }}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

      <div className="max-w-5xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-white transition-colors text-xs font-body">
            ← Back to Dashboard
          </Link>
          <span className="section-label mb-3">Grade Selection</span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Choose Your <span className="gradient-text">Science Adventure</span>
          </h1>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Hey {profile?.name || 'Explorer'}! Pick your class below to unlock custom topics, experiments, and quizzes aligned with your syllabus.
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {classes.map((cls) => {
            const isCurrent = profile?.classNum === cls.num;
            return (
              <div
                key={cls.num}
                onClick={() => !loadingClass && handleSelectClass(cls.num)}
                className="sci-card p-6 md:p-8 cursor-pointer flex flex-col justify-between relative group hover:-translate-y-2 transition-all duration-300"
                style={{
                  borderColor: isCurrent ? cls.color : 'rgba(255, 255, 255, 0.06)',
                  boxShadow: isCurrent ? `0 0 20px ${cls.shadowColor}` : 'none',
                  background: 'rgba(11, 18, 37, 0.7)',
                }}
              >
                {/* Ribbon badge for active class */}
                {isCurrent && (
                  <span className="absolute top-4 right-4 font-display font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{ background: cls.color }}>
                    Current Class
                  </span>
                )}

                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `${cls.color}15`, border: `1px solid ${cls.color}30` }}>
                    {cls.icon}
                  </div>
                  <h3 className="font-display font-black text-xl text-white mb-1 group-hover:text-slate-100 transition-colors">
                    {cls.title}
                  </h3>
                  <span className="font-body font-bold text-xs" style={{ color: cls.color }}>{cls.age}</span>

                  <p className="font-body text-slate-400 text-xs md:text-sm mt-4 leading-relaxed">
                    {cls.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <span className="font-display font-bold text-[11px] text-slate-500 uppercase tracking-wide block mb-3">Sample Topics:</span>
                    <div className="flex flex-wrap gap-2">
                      {cls.topics.map((t, idx) => (
                        <span key={idx} className="font-body text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={loadingClass !== null}
                  className="w-full font-display font-bold text-xs py-3 px-4 rounded-xl mt-8 text-white transition-all flex items-center justify-center gap-2"
                  style={{
                    background: isCurrent ? 'rgba(255, 255, 255, 0.08)' : `linear-gradient(135deg, ${cls.color}, ${cls.color}dd)`,
                    boxShadow: isCurrent ? 'none' : `0 4px 15px ${cls.shadowColor}`,
                    opacity: loadingClass && loadingClass !== cls.num ? 0.5 : 1,
                  }}
                >
                  {loadingClass === cls.num ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isCurrent ? (
                    'Already Selected (Enter)'
                  ) : (
                    'Choose Adventure →'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ClassSelectorPage() {
  return (
    <AuthGuard>
      <ClassSelectorContent />
    </AuthGuard>
  );
}
