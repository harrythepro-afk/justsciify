'use client';
import { useState, useEffect } from 'react';

const DEMO_QUESTIONS = [
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
    topic: '🚀 Space & Solar System',
    class: 'Class 5',
    explanation: 'Mars appears red because of iron oxide (rust) on its surface!',
  },
  {
    question: 'What do plants produce during photosynthesis?',
    options: ['Water', 'Oxygen & Food', 'Carbon Dioxide', 'Soil'],
    correct: 1,
    topic: '🌿 Plants & Trees',
    class: 'Class 4',
    explanation: 'Plants use sunlight, water, and CO₂ to make food and release oxygen.',
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['106', '206', '306', '406'],
    correct: 1,
    topic: '🧬 Human Body',
    class: 'Class 5',
    explanation: 'Adults have 206 bones — babies are born with around 270!',
  },
];

export default function LiveQuizDemo() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = DEMO_QUESTIONS[qIndex];

  // Timer
  useEffect(() => {
    if (selected !== null || done) return;
    if (timeLeft <= 0) {
      handleSelect(-1); // time up
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, done]);

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore(s => s + 1);
    setShowExplanation(true);
    setTimeout(() => {
      if (qIndex + 1 < DEMO_QUESTIONS.length) {
        setQIndex(qi => qi + 1);
        setSelected(null);
        setTimeLeft(20);
        setShowExplanation(false);
      } else {
        setDone(true);
      }
    }, 2000);
  };

  const reset = () => {
    setQIndex(0); setSelected(null); setScore(0);
    setDone(false); setTimeLeft(20); setShowExplanation(false);
  };

  const timerPct = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? '#4ade80' : timeLeft > 5 ? '#facc15' : '#ef4444';

  return (
    <section className="py-24 relative overflow-hidden" id="quiz">
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[600px] h-[600px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), transparent)', opacity: 0.05 }} />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-5" style={{ color: '#4ade80' }}>
            <span>🎮</span>
            <span>Try It Now — No Signup!</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Live <span className="gradient-text">Quiz Demo</span>
          </h2>
          <p className="font-body text-slate-400 text-lg">
            Experience a real quiz right here. Can you answer all 3 correctly?
          </p>
        </div>

        {/* Quiz card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(11,18,37,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {!done ? (
            <>
              {/* Top bar */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-slate-500">Question</span>
                  <div className="flex gap-1">
                    {DEMO_QUESTIONS.map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          background: i < qIndex ? '#4ade80' : i === qIndex ? '#38bdf8' : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="font-body text-xs text-slate-400">{qIndex + 1}/{DEMO_QUESTIONS.length}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-body text-xs glass px-3 py-1 rounded-full text-slate-400">{q.class} · {q.topic}</span>
                  {/* Score */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⭐</span>
                    <span className="font-display font-bold text-sm" style={{ color: '#facc15' }}>{score}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Timer */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-xs text-slate-500">Time remaining</span>
                    <span className="font-display font-bold text-sm" style={{ color: timerColor }}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="h-2 bg-white/05 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${timerPct}%`,
                        background: `linear-gradient(90deg, ${timerColor}, ${timerColor}99)`,
                        boxShadow: `0 0 10px ${timerColor}60`,
                      }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h3 className="font-display font-bold text-white text-xl mb-6 leading-snug">
                  {q.question}
                </h3>

                {/* Options */}
                <div className="grid gap-3">
                  {q.options.map((opt, i) => {
                    let bg = 'rgba(255,255,255,0.04)';
                    let border = 'rgba(255,255,255,0.08)';
                    let textColor = '#cbd5e1';
                    let icon = null;

                    if (selected !== null) {
                      if (i === q.correct) {
                        bg = 'rgba(74,222,128,0.12)';
                        border = '#4ade80';
                        textColor = '#4ade80';
                        icon = <span className="text-green-400 text-lg">✓</span>;
                      } else if (i === selected && i !== q.correct) {
                        bg = 'rgba(239,68,68,0.12)';
                        border = '#ef4444';
                        textColor = '#ef4444';
                        icon = <span className="text-red-400 text-lg">✗</span>;
                      } else {
                        bg = 'rgba(255,255,255,0.02)';
                        textColor = '#475569';
                      }
                    }

                    return (
                      <button
                        key={i}
                        id={`quiz-option-${i}`}
                        onClick={() => handleSelect(i)}
                        disabled={selected !== null}
                        className="w-full text-left rounded-2xl p-4 flex items-center gap-4 font-body transition-all duration-200"
                        style={{
                          background: bg,
                          border: `1.5px solid ${border}`,
                          color: textColor,
                          cursor: selected !== null ? 'default' : 'pointer',
                        }}
                      >
                        <span
                          className="font-display font-black text-sm w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: selected === null ? 'rgba(56,189,248,0.15)' : 'transparent',
                            color: selected === null ? '#38bdf8' : 'inherit',
                            border: selected === null ? '1px solid rgba(56,189,248,0.3)' : 'none',
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-sm font-semibold">{opt}</span>
                        {icon && <span className="ml-auto">{icon}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div
                    className="mt-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}
                  >
                    <p className="font-body text-sm text-slate-300">
                      <span className="text-electric-400 font-bold">💡 Fun Fact: </span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results screen */
            <div className="p-10 text-center">
              <div
                className="text-7xl mb-6 inline-block"
                style={{
                  filter: `drop-shadow(0 0 30px ${score === 3 ? '#facc15' : score >= 2 ? '#38bdf8' : '#a855f7'}80)`,
                  animation: 'bounce-gentle 2s ease-in-out infinite',
                }}
              >
                {score === 3 ? '🏆' : score >= 2 ? '⭐' : '💪'}
              </div>

              <h3 className="font-display font-black text-3xl text-white mb-2">
                {score === 3 ? 'Perfect Score!' : score >= 2 ? 'Great Job!' : 'Keep Practicing!'}
              </h3>

              <div className="flex justify-center gap-1 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{
                      background: i < score ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${i < score ? '#facc15' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {i < score ? '⭐' : '○'}
                  </div>
                ))}
              </div>

              <p className="font-body text-slate-400 mb-2 text-lg">
                You got <span className="font-bold" style={{ color: '#38bdf8' }}>{score}/{DEMO_QUESTIONS.length}</span> correct!
              </p>
              <p
                className="font-body text-sm mb-8 px-4 py-2 rounded-full inline-block"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                🏅 You earned the <strong>Science Explorer</strong> badge!
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  id="quiz-retry"
                  onClick={reset}
                  className="btn-primary font-display font-bold px-7 py-3 rounded-xl text-white"
                >
                  🔄 Try Again
                </button>
                <button
                  id="quiz-signup"
                  className="btn-secondary font-display font-bold px-7 py-3 rounded-xl text-white"
                >
                  Sign Up for More →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
