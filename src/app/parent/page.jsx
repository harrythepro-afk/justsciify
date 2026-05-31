'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getUserResults } from '@/lib/db';

function ParentContent() {
  const { user, profile } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappAlert, setWhatsappAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserResults(user.$id, 100);
        setResults(res);
      } catch (err) {
        console.error('Failed to load parent data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!profile) return null;

  // Concept mastery analytics calculations based on actual quiz title records
  let physicsScore = { correct: 0, total: 0 };
  let biologyScore = { correct: 0, total: 0 };
  let earthScore = { correct: 0, total: 0 };

  results.forEach(r => {
    if (r.topicId.includes('Gravity') || r.topicId.includes('Forces') || r.topicId.includes('Olympiad')) {
      physicsScore.correct += r.score;
      physicsScore.total += r.total;
    } else if (r.topicId.includes('Living') || r.topicId.includes('Plants') || r.topicId.includes('Animals')) {
      biologyScore.correct += r.score;
      biologyScore.total += r.total;
    } else if (r.topicId.includes('Water') || r.topicId.includes('Cycle') || r.topicId.includes('Space') || r.topicId.includes('System')) {
      earthScore.correct += r.score;
      earthScore.total += r.total;
    }
  });

  const getPct = (scoreObj) => {
    if (scoreObj.total === 0) return 0;
    return Math.round((scoreObj.correct / scoreObj.total) * 100);
  };

  const pPct = getPct(physicsScore);
  const bPct = getPct(biologyScore);
  const ePct = getPct(earthScore);

  return (
    <div className="min-h-screen pb-20 relative" style={{ background: '#03050F' }}>
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

      {/* Top Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base bg-gradient-to-r from-indigo-500 to-sky-500">👪</div>
          <span className="font-display font-black text-lg text-white">Parent Progress Center</span>
        </Link>
        <Link href="/dashboard">
          <button className="btn-secondary font-display font-bold text-xs px-4 py-2 rounded-lg text-white">
            🏠 Student Dashboard
          </button>
        </Link>
      </nav>

      <div className="max-w-5xl w-full mx-auto px-4 mt-12 z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <p className="font-body text-slate-500 text-xs uppercase tracking-wide">Family Analytics Dashboard</p>
            <h1 className="font-display font-black text-3xl text-white mt-1">
              Monitoring <span className="gradient-text">{profile.name}</span>&apos;s Progress
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-display font-bold text-xs bg-slate-900 border border-white/5 text-slate-400">
            🏫 Class {profile.classNum} Student
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-body text-slate-500 text-xs">Assembling learning graphs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLUMNS: ANALYTICS CHARTS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Core subject metrics */}
              <div className="sci-card p-6" style={{ background: 'rgba(11, 18, 37, 0.6)' }}>
                <h2 className="font-display font-bold text-white text-base mb-6">📊 Subject Mastery Overview</h2>
                
                <div className="space-y-6 font-body text-xs">
                  {/* Physics */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">⚡ Physics & Simple Forces</span>
                      <span className="text-slate-400">{physicsScore.total === 0 ? 'No tests taken' : `${pPct}% Mastery (${physicsScore.correct}/${physicsScore.total} Marks)`}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pPct}%`, background: 'linear-gradient(90deg, #a855f7, #c084fc)', boxShadow: '0 0 10px rgba(168,85,247,0.4)' }} />
                    </div>
                  </div>

                  {/* Biology */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">🌿 Biology & Living Environments</span>
                      <span className="text-slate-400">{biologyScore.total === 0 ? 'No tests taken' : `${bPct}% Mastery (${biologyScore.correct}/${biologyScore.total} Marks)`}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${bPct}%`, background: 'linear-gradient(90deg, #4ade80, #22c55e)', boxShadow: '0 0 10px rgba(74,222,128,0.4)' }} />
                    </div>
                  </div>

                  {/* Earth Sciences */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">💧 Earth, Climate & Space</span>
                      <span className="text-slate-400">{earthScore.total === 0 ? 'No tests taken' : `${ePct}% Mastery (${earthScore.correct}/${earthScore.total} Marks)`}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${ePct}%`, background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', boxShadow: '0 0 10px rgba(56,189,248,0.4)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable recommendations box */}
              <div className="sci-card p-6 border-indigo-500/20" style={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                <h3 className="font-display font-bold text-indigo-400 text-sm mb-3">💡 Actionable Insights for {profile.name}</h3>
                <ul className="list-disc pl-5 font-body text-slate-400 text-xs md:text-sm space-y-2">
                  {results.length === 0 ? (
                    <li>Get your child started with their first science quiz in Grade {profile.classNum} topics to populate recommendations!</li>
                  ) : (
                    <>
                      {pPct < 60 && pPct > 0 && <li>Focus needed on <strong>Forces & Gravity</strong>. Review simple machines together.</li>}
                      {bPct < 60 && bPct > 0 && <li>Strengthen <strong>Living Environments</strong> concept definitions.</li>}
                      {ePct < 60 && ePct > 0 && <li>Revise <strong>Water Cycle</strong> steps (condensation, sublimation) to improve performance.</li>}
                      {profile.xp > 0 && <li>{profile.name} is performing at an overall accuracy of {Math.round(results.reduce((acc, r) => acc + (r.score / r.total), 0) / results.length * 100)}% across all topics!</li>}
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: SETTINGS & QUICK STATS */}
            <div className="space-y-6">
              {/* Quick stats box */}
              <div className="sci-card p-6" style={{ background: 'rgba(11, 18, 37, 0.6)' }}>
                <h3 className="font-display font-bold text-white text-sm mb-4">🏆 Student Overview</h3>
                <div className="grid grid-cols-2 gap-4 font-body text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block mb-0.5">Total XP</span>
                    <span className="font-display font-bold text-sm text-yellow-400">{profile.xp} XP</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block mb-0.5">Active Belt</span>
                    <span className="font-display font-bold text-xs uppercase text-slate-300">🥋 {profile.beltLevel}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block mb-0.5">Quizzes Solved</span>
                    <span className="font-display font-bold text-sm text-sky-400">{results.length}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-500 block mb-0.5">Active Streak</span>
                    <span className="font-display font-bold text-sm text-orange-400">🔥 {profile.streak} Days</span>
                  </div>
                </div>
              </div>

              {/* Weekly report settings toggle */}
              <div className="sci-card p-6" style={{ background: 'rgba(11, 18, 37, 0.6)' }}>
                <h3 className="font-display font-bold text-white text-sm mb-4">📨 Automatic Reporting</h3>
                
                <div className="space-y-4 font-body text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-300 block">Weekly WhatsApp Alerts</span>
                      <span className="text-slate-500 text-[10px]">Instant reports sent to your phone number</span>
                    </div>
                    <button
                      onClick={() => setWhatsappAlert(!whatsappAlert)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${whatsappAlert ? 'bg-green-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${whatsappAlert ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-300 block">Weekly Email Digests</span>
                      <span className="text-slate-500 text-[10px]">Complete academic performance PDF reviews</span>
                    </div>
                    <button
                      onClick={() => setEmailAlert(!emailAlert)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${emailAlert ? 'bg-green-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlert ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentPage() {
  return (
    <AuthGuard>
      <ParentContent />
    </AuthGuard>
  );
}
