'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getAllUsers } from '@/lib/db';

const BELT_EMOJIS = {
  white: '🥋',
  yellow: '⭐',
  green: '🌿',
  blue: '💧',
  red: '🔥',
  black: '🏆',
};

function LeaderboardContent() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const usersList = await getAllUsers(100);
        // Sort students by XP in descending order
        const sorted = usersList.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        setStudents(sorted);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!profile) return null;

  // Find user's own rank
  const myRank = students.findIndex((s) => s.userId === user.$id) + 1;

  return (
    <div className="min-h-screen pb-20 relative" style={{ background: '#03050F' }}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base bg-gradient-to-r from-yellow-500 to-amber-600">👑</div>
          <span className="font-display font-black text-lg text-white">
            Just<span className="gradient-text">Sciify</span> Arena
          </span>
        </Link>
        <Link href="/dashboard">
          <button className="btn-secondary font-display font-bold text-xs px-4 py-2 rounded-lg text-white">
            🏠 Back to Dashboard
          </button>
        </Link>
      </nav>

      <div className="max-w-4xl w-full mx-auto px-4 mt-12 z-10 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-3 border-yellow-500/20 text-yellow-400" style={{ background: 'rgba(250,204,21,0.08)' }}>National Championship</span>
          <h1 className="font-display font-black text-4xl text-white mb-2 tracking-tight">
            Weekly Live <span className="text-yellow-400">Leaderboard</span>
          </h1>
          <p className="font-body text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Compete with young scientists all over the country! Solve quizzes, gain high-tier difficulty XP, and climb up the rankings.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-body text-slate-500 text-xs">Accessing arena registry...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 podium boxes */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 items-end mb-10 pt-8 max-w-2xl mx-auto">
              {/* Rank 2 (Left) */}
              {students[1] && (
                <div className="sci-card p-4 md:p-6 text-center flex flex-col items-center relative overflow-hidden"
                  style={{ background: 'rgba(11, 18, 37, 0.6)', borderColor: 'rgba(255,255,255,0.06)', height: '180px' }}>
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-slate-300">
                    {students[1].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="font-display font-bold text-white text-xs mt-2 truncate w-full">{students[1].name}</div>
                  <div className="font-body text-[10px] text-slate-500 mt-0.5">{BELT_EMOJIS[students[1].beltLevel] || '🥋'} {students[1].beltLevel}</div>
                  <div className="font-display font-black text-xs text-yellow-400 mt-2">{students[1].xp} XP</div>
                </div>
              )}

              {/* Rank 1 (Center) */}
              {students[0] && (
                <div className="sci-card p-5 md:p-6 text-center flex flex-col items-center relative overflow-hidden transform scale-105"
                  style={{
                    background: 'rgba(11, 18, 37, 0.8)',
                    borderColor: 'rgba(250,204,21,0.3)',
                    boxShadow: '0 0 30px rgba(250,204,21,0.15)',
                    height: '210px'
                  }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-400" />
                  <div className="text-3xl mb-1 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">👑</div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 border-2 border-yellow-400 flex items-center justify-center font-display font-bold text-sm text-yellow-400">
                    {students[0].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="font-display font-black text-white text-sm mt-2 truncate w-full">{students[0].name}</div>
                  <div className="font-body text-[10px] text-yellow-500 mt-0.5">{BELT_EMOJIS[students[0].beltLevel] || '🥋'} {students[0].beltLevel}</div>
                  <div className="font-display font-black text-sm text-yellow-400 mt-2">{students[0].xp} XP</div>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {students[2] && (
                <div className="sci-card p-4 md:p-6 text-center flex flex-col items-center relative overflow-hidden"
                  style={{ background: 'rgba(11, 18, 37, 0.6)', borderColor: 'rgba(255,255,255,0.06)', height: '160px' }}>
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-amber-600">
                    {students[2].name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="font-display font-bold text-white text-xs mt-2 truncate w-full">{students[2].name}</div>
                  <div className="font-body text-[10px] text-slate-500 mt-0.5">{BELT_EMOJIS[students[2].beltLevel] || '🥋'} {students[2].beltLevel}</div>
                  <div className="font-display font-black text-xs text-yellow-400 mt-2">{students[2].xp} XP</div>
                </div>
              )}
            </div>

            {/* User\'s own rank sticky widget */}
            {myRank > 0 && (
              <div className="sci-card p-4 flex items-center justify-between border-yellow-500/20 mb-8"
                style={{ background: 'rgba(250,204,21,0.06)' }}>
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-sm text-yellow-400">Your Rank: #{myRank}</span>
                  <div className="w-px h-4 bg-white/10" />
                  <span className="font-body text-xs text-slate-400">Class {profile.classNum} • {profile.xp} XP</span>
                </div>
                <Link href="/topics">
                  <button className="btn-primary py-2 px-4 rounded-xl text-white font-display font-bold text-xs">
                    Gain XP Now →
                  </button>
                </Link>
              </div>
            )}

            {/* List Table */}
            <div className="sci-card overflow-hidden" style={{ background: 'rgba(11,18,37,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="p-4 bg-slate-950/40 border-b border-white/5 font-display font-bold text-xs text-slate-500 uppercase tracking-wider">
                Arena Students Grid
              </div>
              <div className="divide-y divide-white/5">
                {students.map((student, idx) => {
                  const isMe = student.userId === user.$id;
                  const rank = idx + 1;

                  return (
                    <div
                      key={student.$id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        isMe ? 'bg-yellow-500/5' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank index */}
                        <span className="font-display font-black text-xs text-slate-500 w-6 text-center">
                          #{rank}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-display font-bold text-xs text-slate-400">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <span className="font-display font-bold text-xs md:text-sm text-white flex items-center gap-1.5">
                            {student.name} {isMe && <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">You</span>}
                          </span>
                          <span className="font-body text-[10px] text-slate-500 mt-0.5 block">
                            Grade {student.classNum} • {BELT_EMOJIS[student.beltLevel]} {student.beltLevel.toUpperCase()} BELT
                          </span>
                        </div>
                      </div>

                      <div className="font-display font-black text-xs md:text-sm text-yellow-400">
                        {student.xp} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <LeaderboardContent />
    </AuthGuard>
  );
}
