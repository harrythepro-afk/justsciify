'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const BELT_COLORS = {
  white: '#e2e8f0',
  yellow: '#facc15',
  green: '#4ade80',
  blue: '#38bdf8',
  red: '#f87171',
  black: '#c084fc',
};

function ResultsContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicTitle = searchParams.get('topicTitle') || 'Science Quiz';
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '4');
  const xpEarned = parseInt(searchParams.get('xp') || '0');
  const duration = parseInt(searchParams.get('duration') || '0');

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const percentage = Math.round((score / total) * 100);

  // Decide star count based on score
  let stars = '⭐';
  let message = 'Keep practice, you are doing great!';
  let color = '#fb923c'; // orange

  if (percentage === 100) {
    stars = '⭐⭐⭐';
    message = 'Incredible! You got a perfect score! 🏆';
    color = '#4ade80'; // green
  } else if (percentage >= 70) {
    stars = '⭐⭐';
    message = 'Great job! You possess amazing science logic! 🚀';
    color = '#38bdf8'; // blue
  }

  const userBeltColor = profile ? (BELT_COLORS[profile.beltLevel] || '#e2e8f0') : '#e2e8f0';

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden" style={{ background: '#03050F' }}>
      {/* Aurora background glow */}
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${userBeltColor} 0%, transparent 70%)` }} />

      <div className="max-w-md w-full sci-card p-8 text-center relative z-10" style={{ background: 'rgba(11, 18, 37, 0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Celebration sparkles emoji */}
        <div className="text-4xl mb-4 animate-bounce">🎉</div>

        <span className="font-display font-bold text-slate-500 text-xs uppercase tracking-widest block mb-1">
          Adventure Completed
        </span>
        <h1 className="font-display font-black text-2xl text-white mb-6">
          {topicTitle}
        </h1>

        {/* Stars */}
        <div className="text-4xl mb-6 tracking-widest filter drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]">
          {stars}
        </div>

        {/* Big Score circle */}
        <div className="w-36 h-36 rounded-full mx-auto flex flex-col items-center justify-center border-4 mb-6 relative"
          style={{
            borderColor: color,
            boxShadow: `0 0 25px ${color}30`,
            background: 'rgba(255,255,255,0.02)'
          }}>
          <div className="font-display font-black text-3xl text-white">{score} / {total}</div>
          <div className="font-body text-slate-500 text-xs mt-1">{percentage}% Correct</div>
        </div>

        <p className="font-display font-bold text-white text-sm mb-2">{message}</p>
        <p className="font-body text-slate-400 text-xs max-w-xs mx-auto mb-6 leading-relaxed">
          You earned a total of <span className="font-display font-black text-yellow-400 text-sm">+{xpEarned} XP</span> which has been added to your profile!
        </p>

        {duration > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 bg-white/5 border border-white/5 py-2 px-4 rounded-xl w-fit mx-auto">
            <span className="text-sm">⏱️</span>
            <span className="font-display font-bold text-[10px] uppercase text-slate-500 tracking-wider">Completion Time:</span>
            <span className="font-display font-black text-xs text-sky-400">{timeStr}</span>
          </div>
        )}

        {/* User level details */}
        {profile && (
          <div className="p-4 rounded-2xl mb-8 border border-white/5 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-left">
              <span className="font-body text-slate-500 text-[10px] uppercase block">Current Belt</span>
              <span className="font-display font-bold text-sm uppercase tracking-wide" style={{ color: userBeltColor }}>
                🥋 {profile.beltLevel} Belt
              </span>
            </div>
            <div className="text-right">
              <span className="font-body text-slate-500 text-[10px] uppercase block">Total XP</span>
              <span className="font-display font-bold text-sm text-yellow-400">
                {profile.xp} XP
              </span>
            </div>
          </div>
        )}

        {/* Control CTAs */}
        <div className="space-y-3">
          <Link href="/topics" className="block">
            <button className="w-full btn-primary py-3.5 rounded-xl font-display font-bold text-xs text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>
              📚 Choose Next Topic
            </button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard">
              <button className="w-full btn-secondary py-3.5 rounded-xl font-display font-bold text-xs text-white">
                🏠 Dashboard
              </button>
            </Link>
            <button
              onClick={() => {
                const tId = searchParams.get('topicId') || 't_living_things';
                const sId = searchParams.get('subtopicId');
                router.push(`/quiz?topicId=${tId}${sId ? `&subtopicId=${sId}` : ''}`);
              }}
              className="w-full btn-secondary py-3.5 rounded-xl font-display font-bold text-xs text-white hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <AuthGuard>
      <ResultsContent />
    </AuthGuard>
  );
}
