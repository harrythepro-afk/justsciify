'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getQuestions, saveQuizResult, addXP } from '@/lib/db';

function OlympiadContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [examActive, setExamActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Exam States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  // 120 Seconds Global Exam Timer
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef(null);

  useEffect(() => {
    if (examActive && !saving) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam(true); // Auto submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examActive, saving]);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      // Draw high difficulty questions (6 to 10) on Forces and water cycle
      const [q1, q2] = await Promise.all([
        getQuestions('t_gravity_force', 10),
        getQuestions('t_water_cycle', 10)
      ]);
      // Filter out low difficulty and merge
      const merged = [...q1, ...q2]
        .filter(q => q.difficulty >= 6)
        .slice(0, 5); // Take exactly 5 Olympiad rank questions

      setQuestions(merged);
      setExamActive(true);
      setTimeLeft(120);
      setCurrentIdx(0);
      setSelectedOpt(null);
      setAnswers({});
    } catch (err) {
      console.error('Failed to start mock exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (idx) => {
    setSelectedOpt(idx);
    setAnswers({ ...answers, [currentIdx]: idx });
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(answers[currentIdx + 1] !== undefined ? answers[currentIdx + 1] : null);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedOpt(answers[currentIdx - 1]);
    }
  };

  const handleSubmitExam = async (isTimeout = false) => {
    setSaving(true);
    clearInterval(timerRef.current);

    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const xpWon = score * 20 + (score === questions.length ? 50 : 0); // extra +50 XP for perfect score!

    try {
      // Log exam attempt in Database
      await saveQuizResult(user.$id, 'National Science Olympiad (NSO) Mock', score, questions.length, xpWon);
      // Award XP
      await addXP(user.$id, profile.xp, xpWon, 'NSO_mock', profile.completedTopics);
      await refreshProfile();

      router.push(`/results?topicTitle=${encodeURIComponent('National Science Olympiad Mock')}&score=${score}&total=${questions.length}&xp=${xpWon}`);
    } catch (err) {
      console.error('Failed to log exam:', err);
      router.push('/dashboard');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen relative flex flex-col justify-between" style={{ background: '#03050F' }}>
      {/* Top navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/5"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg, #ef4444, #fb923c)' }}>🏆</div>
          <span className="font-display font-black text-lg text-white">NSO Olympiad Hub</span>
        </Link>
        <Link href="/dashboard">
          <button className="font-body text-xs text-slate-500 hover:text-white transition-colors py-2">
            Leave Hub
          </button>
        </Link>
      </nav>

      {/* Main Workspace */}
      <div className="max-w-4xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center items-center">
        {!examActive ? (
          <div className="sci-card p-8 max-w-xl text-center relative overflow-hidden"
            style={{ background: 'rgba(11, 18, 37, 0.7)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            
            <div className="text-5xl mb-4">🏅</div>
            <span className="section-label mb-2 border-red-500/30 text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>Elite Competitive Mode</span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white mb-4">
              National Science <span className="text-red-400">Olympiad Mock</span>
            </h1>
            <p className="font-body text-slate-400 text-xs md:text-sm leading-relaxed mb-8">
              Challenge yourself with 5 high-difficulty questions (Difficulty 6 to 10) covering CBSE science concepts. You have exactly **120 seconds** to complete the entire test. Perfect scores unlock additional bonus XP!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 text-center text-xs font-body text-slate-400">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-lg mb-1">⏱️</div>
                <div className="font-bold text-white">120s</div>
                <div>Exam Time</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-lg mb-1">📝</div>
                <div className="font-bold text-white">5 MCQs</div>
                <div>High-Tier</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-lg mb-1">⭐</div>
                <div className="font-bold text-white">+100 XP</div>
                <div>Pass Reward</div>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Launch Timed Mock Exam 🚀'
              )}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-3xl flex flex-col justify-between">
            {/* Exam Progress Panel */}
            <div className="flex items-center justify-between mb-6 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              <span className="font-display font-bold text-xs text-red-400 uppercase tracking-widest animate-pulse">
                🚨 EXAM IN PROGRESS
              </span>
              <div className="flex items-center gap-4">
                <div className="font-display font-bold text-xs text-slate-400">
                  Question {currentIdx + 1} of {questions.length}
                </div>
                <div className="font-display font-black text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
                  ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Question Box */}
            <div className="sci-card p-6 md:p-8 mb-6 relative overflow-hidden" style={{ background: 'rgba(11, 18, 37, 0.7)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500" />
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-[9px] uppercase bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full">
                  NSO Rank Difficulty: {questions[currentIdx]?.difficulty} / 10
                </span>
              </div>
              <h2 className="font-display font-bold text-base md:text-lg text-white leading-snug">
                {questions[currentIdx]?.question}
              </h2>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {questions[currentIdx]?.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="sci-card p-5 cursor-pointer flex items-center gap-4 transition-all duration-200"
                    style={{
                      border: `1.5px solid ${isSelected ? '#ef4444' : 'rgba(255,255,255,0.06)'}`,
                      background: isSelected ? 'rgba(239,68,68,0.08)' : 'rgba(11, 18, 37, 0.4)'
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs"
                      style={{
                        background: isSelected ? '#ef4444' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#fff' : '#888'
                      }}>
                      {['A', 'B', 'C', 'D'][idx]}
                    </div>
                    <span className="font-body text-xs md:text-sm text-slate-300">{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between gap-4">
              <button
                disabled={currentIdx === 0}
                onClick={handlePrev}
                className="btn-secondary px-6 py-3 rounded-xl text-white font-display font-bold text-xs disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Previous
              </button>

              {currentIdx + 1 === questions.length ? (
                <button
                  onClick={() => handleSubmitExam(false)}
                  disabled={saving}
                  className="btn-primary px-8 py-3 rounded-xl text-white font-display font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #ea580c)' }}
                >
                  {saving ? 'Submitting...' : 'Finish & Submit Exam 🏁'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={selectedOpt === null}
                  className="btn-secondary px-6 py-3 rounded-xl text-white font-display font-bold text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OlympiadPage() {
  return (
    <AuthGuard>
      <OlympiadContent />
    </AuthGuard>
  );
}
