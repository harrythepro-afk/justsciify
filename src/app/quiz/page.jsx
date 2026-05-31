'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getTopic, getQuestions, saveQuizResult, addXP } from '@/lib/db';

function QuizContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');
  const subtopicId = searchParams.get('subtopicId');

  const [topic, setTopic] = useState(null);
  const [subtopic, setSubtopic] = useState(null);
  const [questionsPool, setQuestionsPool] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adaptive Quiz Game State
  const [askedIds, setAskedIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(2); // Start at Difficulty 2
  const [questionsCount, setQuestionsCount] = useState(1);
  const [totalQuestionsToPlay] = useState(6); // Play exactly 6 adaptive questions

  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // Load data
  useEffect(() => {
    if (!topicId) {
      router.push('/topics');
      return;
    }

    (async () => {
      try {
        const tData = await getTopic(topicId);
        setTopic(tData);

        let qPool = [];
        if (subtopicId) {
          const sub = tData.subtopics?.find(s => s.$id === subtopicId || s.id === subtopicId);
          setSubtopic(sub);
          qPool = await getQuestions(subtopicId, 30);
        } else {
          // Fallback: If no subtopicId is provided, get questions for the first subtopic of this topic
          const firstSub = tData.subtopics?.[0];
          if (firstSub) {
            setSubtopic(firstSub);
            qPool = await getQuestions(firstSub.$id || firstSub.id, 30);
          } else {
            qPool = await getQuestions(topicId, 30);
          }
        }
        setQuestionsPool(qPool);

        // Select initial question at Difficulty 2
        if (qPool.length > 0) {
          // Find closest to difficulty 2
          let bestQ = qPool[0];
          let minDiff = Math.abs(qPool[0].difficulty - 2);

          qPool.forEach((q) => {
            const diffDist = Math.abs(q.difficulty - 2);
            if (diffDist < minDiff) {
              minDiff = diffDist;
              bestQ = q;
            }
          });

          setCurrentQuestion(bestQ);
          setAskedIds([bestQ.$id]);
          setCurrentDifficulty(bestQ.difficulty);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [topicId, subtopicId, router]);

  // Start question timer
  useEffect(() => {
    if (loading || !currentQuestion || isAnswered || saving) return;

    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, loading, isAnswered, saving]);

  const handleTimeOut = () => {
    setSelectedOpt(null);
    setIsAnswered(true);
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOpt === null || isAnswered) return;
    clearInterval(timerRef.current);

    const correct = currentQuestion.correctIndex === selectedOpt;
    if (correct) {
      setScore((prev) => prev + 1);
      // Linear XP: Difficulty * 3
      const points = currentQuestion.difficulty * 3;
      setXpEarned((prev) => prev + points);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = async () => {
    const wasCorrect = currentQuestion.correctIndex === selectedOpt;
    
    // Calculate next adaptive difficulty
    const nextDiff = wasCorrect 
      ? Math.min(currentDifficulty + 1, 10) 
      : Math.max(currentDifficulty - 1, 1);

    if (questionsCount < totalQuestionsToPlay) {
      // Pick next adaptive question from pool
      let bestQ = null;
      let minDiff = Infinity;

      questionsPool.forEach((q) => {
        if (askedIds.includes(q.$id)) return;
        const diffDist = Math.abs(q.difficulty - nextDiff);
        if (diffDist < minDiff) {
          minDiff = diffDist;
          bestQ = q;
        }
      });

      // Fallback if no questions left in pool
      if (!bestQ) {
        bestQ = questionsPool.find(q => !askedIds.includes(q.$id));
      }

      if (bestQ) {
        setCurrentQuestion(bestQ);
        setAskedIds((prev) => [...prev, bestQ.$id]);
        setCurrentDifficulty(bestQ.difficulty);
        setQuestionsCount((prev) => prev + 1);
        setSelectedOpt(null);
        setIsAnswered(false);
      } else {
        // No questions left, end quiz
        await finishQuiz();
      }
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setSaving(true);
    try {
      const activeId = subtopicId || topic.$id;
      // Save quiz result
      await saveQuizResult(user.$id, activeId, score, questionsCount, xpEarned);
      // Add XP and update belt levels
      await addXP(user.$id, profile.xp, xpEarned, activeId, profile.completedTopics);
      // Refresh AuthContext profile details
      await refreshProfile();
      // Redirect to results
      const quizTitle = subtopic ? `${topic.title} (${subtopic.title})` : topic.title;
      router.push(`/results?topicTitle=${encodeURIComponent(quizTitle)}&score=${score}&total=${questionsCount}&xp=${xpEarned}`);
    } catch (err) {
      console.error('Error saving quiz results:', err);
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#03050F' }}>
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold text-slate-400 text-sm">Initializing Adaptive Learning Engines...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#03050F' }}>
        <p className="font-display font-bold text-slate-400 mb-4">No questions found in this topic.</p>
        <Link href="/topics">
          <button className="btn-primary px-6 py-3 rounded-xl text-white font-display font-bold text-xs">
            Back to Topics
          </button>
        </Link>
      </div>
    );
  }

  const topicColor = topic?.color || '#38bdf8';
  const progressPct = (questionsCount / totalQuestionsToPlay) * 100;

  return (
    <div className="min-h-screen pb-20 relative flex flex-col justify-between" style={{ background: '#03050F' }}>
      {/* Quiz Top bar */}
      <div className="w-full">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5" style={{ background: 'rgba(3,5,15,0.7)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{topic?.icon || '📚'}</span>
            <div>
              <span className="font-body text-slate-500 text-[10px] uppercase tracking-wider">Adaptive Study Loop</span>
              <h2 className="font-display font-black text-sm text-white">{topic?.title}</h2>
            </div>
          </div>
          {/* Live Score/XP widgets */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-display font-bold text-xs px-3 py-1.5 rounded-xl">
              ⭐ {xpEarned} XP
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-white/5 font-display font-bold text-xs px-3 py-1.5 rounded-xl text-slate-400">
              Q {questionsCount}/{totalQuestionsToPlay}
            </div>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full h-1 bg-white/5">
          <div className="h-full transition-all duration-300" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${topicColor}, #a855f7)` }} />
        </div>
      </div>

      {/* Main Quiz Body */}
      <div className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Question Panel */}
        <div className="sci-card p-6 md:p-8 mb-6 relative overflow-hidden" style={{ background: 'rgba(11, 18, 37, 0.7)' }}>
          {/* Glowing border accent */}
          <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: topicColor }} />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[10px] uppercase tracking-wide px-3 py-1 rounded-full text-white bg-white/5">
                Grade {currentQuestion.classNum} Science
              </span>
              {/* Granular 1-10 difficulty bar badge */}
              <span className="font-display font-bold text-[10px] uppercase tracking-wide px-3 py-1 rounded-full text-sky-400 bg-sky-500/10 border border-sky-500/20">
                Difficulty Level {currentQuestion.difficulty} / 10
              </span>
            </div>

            {/* Circular Timer Widget */}
            <div className="flex items-center gap-2">
              <span className="text-sm">⏱️</span>
              <span className="font-display font-black text-sm transition-colors"
                style={{ color: timeLeft < 10 ? '#f87171' : '#facc15' }}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <h1 className="font-display font-bold text-lg md:text-xl text-white leading-snug">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((opt, idx) => {
            const letters = ['A', 'B', 'C', 'D'];
            const isSelected = selectedOpt === idx;
            const isCorrect = currentQuestion.correctIndex === idx;

            let borderStyle = 'rgba(255,255,255,0.06)';
            let bgStyle = 'rgba(11, 18, 37, 0.4)';
            let textGlow = 'text-slate-300';

            if (isAnswered) {
              if (isCorrect) {
                borderStyle = '#4ade8050';
                bgStyle = 'rgba(74,222,128,0.1)';
                textGlow = 'text-green-400 font-bold';
              } else if (isSelected) {
                borderStyle = '#f8717150';
                bgStyle = 'rgba(248,113,113,0.1)';
                textGlow = 'text-red-400 font-bold';
              } else {
                borderStyle = 'rgba(255,255,255,0.02)';
                bgStyle = 'rgba(11, 18, 37, 0.2)';
                textGlow = 'text-slate-600';
              }
            } else if (isSelected) {
              borderStyle = topicColor;
              bgStyle = `${topicColor}10`;
              textGlow = 'text-white font-bold';
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`sci-card p-5 cursor-pointer flex items-center gap-4 transition-all duration-200 ${
                  isAnswered ? 'pointer-events-none' : 'hover:-translate-y-0.5 hover:border-white/20'
                }`}
                style={{
                  border: `1.5px solid ${borderStyle}`,
                  background: bgStyle
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs"
                  style={{
                    background: isSelected ? topicColor : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#000' : '#888'
                  }}>
                  {letters[idx]}
                </div>
                <div className={`font-body text-xs md:text-sm ${textGlow}`}>
                  {opt}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instant Science Explanation / Fun Fact Block */}
        {isAnswered && (
          <div className="sci-card p-5 mb-6 relative overflow-hidden animate-fade-in"
            style={{
              borderColor: selectedOpt === currentQuestion.correctIndex ? '#4ade8030' : 'rgba(255,255,255,0.06)',
              background: 'rgba(11, 18, 37, 0.6)'
            }}>
            <div className="absolute top-0 left-0 w-1.5 h-full"
              style={{ background: selectedOpt === currentQuestion.correctIndex ? '#4ade80' : '#94a3b8' }} />
            <div className="flex gap-3">
              <span className="text-xl">{selectedOpt === currentQuestion.correctIndex ? '🎉' : '💡'}</span>
              <div>
                <span className="font-display font-bold text-xs uppercase tracking-wider block mb-1 text-slate-400">
                  {selectedOpt === currentQuestion.correctIndex ? `Correct! (+${currentQuestion.difficulty * 3} XP) Fun Fact:` : 'Science Explanation:'}
                </span>
                <p className="font-body text-slate-300 text-xs md:text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Bottom CTA Control Bar */}
      <div className="w-full px-6 py-4 border-t border-white/5" style={{ background: 'rgba(3,5,15,0.9)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/topics">
            <button className="font-body text-xs text-slate-500 hover:text-white transition-colors py-2 px-3">
              🏳️ Quit Study
            </button>
          </Link>

          {!isAnswered ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOpt === null}
              className="btn-primary px-8 py-3 rounded-xl text-white font-display font-bold text-xs disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${topicColor}, #a855f7)` }}
            >
              Check Answer ✓
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={saving}
              className="btn-primary px-8 py-3 rounded-xl text-white font-display font-bold text-xs flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : questionsCount === totalQuestionsToPlay ? (
                'Finish Adaptive Study 🏁'
              ) : (
                'Next Adaptive Question →'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}
