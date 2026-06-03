'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { getTopics, getQuestions, saveQuizResult, addXP } from '@/lib/db';

function OlympiadContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  // Navigation states
  const [subjectSelected, setSubjectSelected] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all' | 'physics' | 'biology' | 'space'
  const [examActive, setExamActive] = useState(false);
  const [reviewActive, setReviewActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Exam States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);

  // 120 Seconds Global Exam Timer
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef(null);

  useEffect(() => {
    if (examActive && !saving) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam(); // Auto submit on timeout
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
      // Fetch all topics to dynamically find valid subtopic IDs
      const topics = await getTopics();
      let subtopicIds = [];
      
      for (const topic of topics) {
        if (topic.subtopics && topic.subtopics.length > 0) {
          let match = false;
          const titleLower = topic.title.toLowerCase();
          
          if (selectedSubject === 'all') {
            match = true;
          } else if (selectedSubject === 'physics') {
            match = titleLower.includes('force') || titleLower.includes('gravity') || titleLower.includes('motion') || titleLower.includes('matter') || titleLower.includes('robotics');
          } else if (selectedSubject === 'biology') {
            match = titleLower.includes('living') || titleLower.includes('plant') || titleLower.includes('animal') || titleLower.includes('organ') || titleLower.includes('body') || titleLower.includes('food');
          } else if (selectedSubject === 'space') {
            match = titleLower.includes('water') || titleLower.includes('cycle') || titleLower.includes('space') || titleLower.includes('system') || titleLower.includes('disaster') || titleLower.includes('weather');
          }
          
          if (match) {
            subtopicIds.push(...topic.subtopics.map(s => s._id || s.id));
          }
        }
      }

      // Draw high difficulty questions from the filtered subtopics
      let merged = [];
      if (subtopicIds.length > 0) {
        const promises = subtopicIds.slice(0, 3).map(id => getQuestions(id, 15));
        const questionsList = await Promise.all(promises);
        merged = questionsList.flat();
      } else {
        // Fallback to first subtopic if no match
        const firstTopic = topics[0];
        if (firstTopic && firstTopic.subtopics && firstTopic.subtopics.length > 0) {
          merged = await getQuestions(firstTopic.subtopics[0]._id || firstTopic.subtopics[0].id, 15);
        }
      }

      // Filter out low difficulty and merge
      const filtered = merged
        .filter(q => q.difficulty >= 6)
        .slice(0, 5); // Take exactly 5 Olympiad rank questions

      // If we don't have enough, fill in with any other questions
      if (filtered.length < 5 && merged.length > 0) {
        const remaining = merged.filter(q => !filtered.includes(q)).slice(0, 5 - filtered.length);
        filtered.push(...remaining);
      }

      setQuestions(filtered.slice(0, 5));
      setExamActive(true);
      setReviewActive(false);
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

  const handleSubmitExam = () => {
    clearInterval(timerRef.current);
    
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOption || answers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const xpWon = score * 20 + (score === questions.length ? 50 : 0); // extra +50 XP for perfect score!
    
    setEarnedScore(score);
    setEarnedXp(xpWon);
    setReviewActive(true);
    setExamActive(false);
  };

  const handleClaimReward = async () => {
    setSaving(true);
    try {
      // Log exam attempt in Database
      await saveQuizResult(user.$id, 'National Science Olympiad (NSO) Mock', earnedScore, questions.length, earnedXp);
      // Award XP
      await addXP(user.$id, profile.xp, earnedXp, 'NSO_mock', profile.completedTopics);
      await refreshProfile();
      router.push(`/results?topicTitle=${encodeURIComponent('National Science Olympiad Mock')}&score=${earnedScore}&total=${questions.length}&xp=${earnedXp}`);
    } catch (err) {
      console.error('Failed to log exam:', err);
      router.push('/dashboard');
    } finally {
      setSaving(false);
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
        
        {/* STEP 1: SUBJECT SELECTION SCREEN */}
        {!subjectSelected && !examActive && !reviewActive && (
          <div className="sci-card p-8 w-full max-w-2xl text-center relative overflow-hidden"
            style={{ background: 'rgba(11, 18, 37, 0.7)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            
            <div className="text-5xl mb-4">🏅</div>
            <span className="section-label mb-2 border-red-500/30 text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>Elite Competitive Mode</span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white mb-2">
              National Science <span className="text-red-400">Olympiad Mock</span>
            </h1>
            <p className="font-body text-slate-400 text-xs md:text-sm leading-relaxed mb-8">
              Select a specialized focus area below to build your custom timed Olympiad exam pool.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left font-body">
              {/* Physics */}
              <div 
                onClick={() => setSelectedSubject('physics')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSubject === 'physics' ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
              >
                <div className="text-xl mb-1">⚡</div>
                <div className="font-display font-bold text-white text-xs">Physics & Forces</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Gravity, simple machines, robotics, and basic physics laws.</p>
              </div>

              {/* Biology */}
              <div 
                onClick={() => setSelectedSubject('biology')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSubject === 'biology' ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
              >
                <div className="text-xl mb-1">🌿</div>
                <div className="font-display font-bold text-white text-xs">Biology & Life</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Living things, plant logic, organ systems, and animal adaptions.</p>
              </div>

              {/* Space */}
              <div 
                onClick={() => setSelectedSubject('space')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSubject === 'space' ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
              >
                <div className="text-xl mb-1">🪐</div>
                <div className="font-display font-bold text-white text-xs">Space & Earth Science</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">Water cycle, space systems, disasters, and atmospheric logs.</p>
              </div>

              {/* All */}
              <div 
                onClick={() => setSelectedSubject('all')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSubject === 'all' ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
              >
                <div className="text-xl mb-1">🎓</div>
                <div className="font-display font-bold text-white text-xs">Full NSO Syllabus</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">All concept segments drawn collectively for comprehensive rank checks.</p>
              </div>
            </div>

            <button
              onClick={() => setSubjectSelected(true)}
              className="btn-primary w-full py-4 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
            >
              Continue to Exam Console →
            </button>
          </div>
        )}

        {/* STEP 2: LAUNCH TIMER EXAM CONFIRMATION */}
        {subjectSelected && !examActive && !reviewActive && (
          <div className="sci-card p-8 max-w-xl text-center relative overflow-hidden animate-fade-in"
            style={{ background: 'rgba(11, 18, 37, 0.7)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
            
            <div className="text-5xl mb-4">⏱️</div>
            <span className="section-label mb-2 border-red-500/30 text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              Selected Area: {selectedSubject.toUpperCase()}
            </span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white mb-4">
              Ready to Launch?
            </h1>
            <p className="font-body text-slate-400 text-xs md:text-sm leading-relaxed mb-8">
              You will play 5 rank difficulty questions. You have exactly **120 seconds** to complete the mock. Focus, think carefully, and do your best!
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
                <div>NSO Rank</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-lg mb-1">⭐</div>
                <div className="font-bold text-white">+150 XP</div>
                <div>Perfect Score</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubjectSelected(false)}
                className="w-1/3 btn-secondary py-4 rounded-xl text-white font-display font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={handleStartExam}
                disabled={loading}
                className="flex-1 btn-primary py-4 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Start Live Exam 🚀'
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE ACTIVE EXAM WORKSPACE */}
        {examActive && !reviewActive && (
          <div className="w-full max-w-3xl flex flex-col justify-between animate-fade-in">
            {/* Exam Progress Panel */}
            <div className="flex items-center justify-between mb-6 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              <span className="font-display font-bold text-xs text-red-400 uppercase tracking-widest animate-pulse">
                🚨 EXAM IN PROGRESS
              </span>
              <div className="flex items-center gap-4">
                <div className="font-display font-bold text-xs text-slate-400">
                  Question {currentIdx + 1} of {questions.length}
                </div>
                <div className={`font-display font-black text-sm px-3 py-1.5 rounded-xl transition-all ${
                  timeLeft <= 30 
                    ? 'text-red-400 bg-red-500/15 border border-red-500/35 animate-pulse font-bold' 
                    : 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                }`}>
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
                {questions[currentIdx]?.questionText || questions[currentIdx]?.question}
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
                  onClick={handleSubmitExam}
                  className="btn-primary px-8 py-3 rounded-xl text-white font-display font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #ea580c)' }}
                >
                  Finish & Review Exam 🏁
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

        {/* STEP 4: EXAM SUBMISSION & DETAILED INLINE REVIEW */}
        {reviewActive && (
          <div className="w-full max-w-3xl flex flex-col justify-between animate-fade-in space-y-6">
            
            {/* Top Review Banner */}
            <div className="sci-card p-6 text-center relative overflow-hidden border-green-500/20"
              style={{ background: 'rgba(74, 222, 128, 0.05)' }}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-green-500" />
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="font-display font-black text-xl text-white">NSO Exam Submitted Successfully!</h2>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="bg-slate-900 border border-white/5 px-4 py-2 rounded-xl text-center">
                  <div className="font-body text-slate-500 text-[10px] uppercase">Final Marks</div>
                  <div className="font-display font-black text-base text-white">{earnedScore} / {questions.length}</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl text-center">
                  <div className="font-body text-yellow-500/70 text-[10px] uppercase">XP Reward</div>
                  <div className="font-display font-black text-base text-yellow-400">+{earnedXp} XP</div>
                </div>
              </div>
              <p className="font-body text-slate-400 text-xs mt-4">Review the question breakdown details below to solidify your logic before saving.</p>
            </div>

            {/* Questions Review Breakdown */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-white text-sm">📝 Answer Analysis & science Facts</h3>
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const correctOptIndex = q.correctOption !== undefined ? q.correctOption : q.correctIndex;
                const isCorrect = userAns === correctOptIndex;

                return (
                  <div key={idx} className="sci-card p-5 relative overflow-hidden bg-slate-900/30" style={{ borderColor: isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)' }}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                    
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className="font-display font-bold text-[9px] uppercase tracking-wide text-slate-500">
                        Question {idx + 1} • Difficulty {q.difficulty}/10
                      </span>
                      <span className={`font-display font-bold text-[10px] px-2 py-0.5 rounded ${isCorrect ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>

                    <p className="font-display font-bold text-white text-xs md:text-sm mb-3">{q.questionText || q.question}</p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userAns === oIdx;
                        const isAnswerKey = correctOptIndex === oIdx;

                        let borderStyle = 'border-white/5';
                        let bgStyle = 'bg-slate-950/20';
                        let textStyle = 'text-slate-400';

                        if (isAnswerKey) {
                          borderStyle = 'border-green-500/30';
                          bgStyle = 'bg-green-500/5';
                          textStyle = 'text-green-400 font-bold';
                        } else if (isChosen) {
                          borderStyle = 'border-red-500/30';
                          bgStyle = 'bg-red-500/5';
                          textStyle = 'text-red-400 font-bold';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-lg border text-[11px] font-body flex items-center gap-2 ${borderStyle} ${bgStyle} ${textStyle}`}>
                            <span className="font-bold uppercase">{['A', 'B', 'C', 'D'][oIdx]})</span>
                            <span>{opt}</span>
                            {isAnswerKey && <span className="ml-auto text-green-400 font-bold">✓</span>}
                            {isChosen && !isCorrect && <span className="ml-auto text-red-400 font-bold">✗</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Fun Fact Explanation */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] md:text-xs font-body text-slate-300 leading-relaxed">
                      💡 <span className="font-bold text-slate-500 uppercase tracking-wide">Fun Fact:</span> {q.explanation}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Save & Exit Actions */}
            <button
              onClick={handleClaimReward}
              disabled={saving}
              className="btn-primary w-full py-4 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Claiming rewards...
                </>
              ) : (
                `Claim +${earnedXp} XP & Complete Exam 🏁`
              )}
            </button>

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
