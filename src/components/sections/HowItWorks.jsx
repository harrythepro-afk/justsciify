'use client';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    icon: '🏫',
    title: 'Choose Your Class',
    desc: 'Pick Class 3, 4, or 5. Your content is perfectly matched to your school syllabus!',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  {
    num: '02',
    icon: '📖',
    title: 'Pick a Topic',
    desc: 'Explore exciting topics like Solar System, Plants, Animals, Human Body and much more!',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    borderColor: 'rgba(168,85,247,0.3)',
  },
  {
    num: '03',
    icon: '🎮',
    title: 'Learn & Quiz',
    desc: 'Read interactive lessons, watch animations, then test your knowledge with fun quizzes!',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  {
    num: '04',
    icon: '🏆',
    title: 'Earn Badges',
    desc: 'Score high and unlock amazing badges! Collect them all and become a Science Champion!',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.3)',
  },
];

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section className="py-24 relative overflow-hidden" id="how-it-works">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[500px] h-[500px] -left-40 top-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,1), transparent)', opacity: 0.06 }} />
        <div className="aurora-blob w-[400px] h-[400px] -right-20 top-1/3"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,1), transparent)', opacity: 0.06 }} />
      </div>

      <div className="max-w-6xl mx-auto px-4" ref={ref}>
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="section-label mb-5" style={{ color: '#38bdf8' }}>
            <span>⚡</span>
            <span>How It Works</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            4 Simple Steps to{' '}
            <span className="gradient-text">Science Mastery</span>
          </h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-lg">
            Start your journey in minutes. No complicated setup — just sign up and start exploring!
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[calc(25%-20px)] right-[calc(25%-20px)] h-0.5 z-0"
            style={{ background: 'linear-gradient(90deg, #38bdf8, #a855f7, #4ade80, #fb923c)' }} />

          {STEPS.map((s, i) => (
            <div
              key={i}
              className="relative z-10 rounded-3xl p-6 text-center group hover:scale-105 transition-all duration-300 cursor-default"
              style={{
                background: s.bg,
                border: `1px solid ${s.borderColor}`,
                transitionDelay: inView ? `${i * 0.1}s` : '0s',
                boxShadow: `0 0 30px ${s.color}10`,
              }}
            >
              {/* Step number badge */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs shadow-lg"
                style={{
                  background: s.color,
                  color: '#03050F',
                  boxShadow: `0 0 20px ${s.color}80`,
                }}
              >
                {s.num}
              </div>

              {/* Icon */}
              <div
                className="text-5xl mb-4 mt-5 block transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-2xl"
                style={{ filter: `drop-shadow(0 0 15px ${s.color}60)` }}
              >
                {s.icon}
              </div>

              <h3
                className="font-display font-bold text-lg mb-3"
                style={{ color: s.color }}
              >
                {s.title}
              </h3>
              <p className="font-body text-slate-400 text-sm leading-relaxed">
                {s.desc}
              </p>

              {/* Arrow for flow */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 z-20 text-lg">
                  ›
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA teaser */}
        <div className="text-center mt-14">
          <p className="font-body text-slate-500 mb-5">Ready to begin? It takes less than 2 minutes to set up.</p>
          <Link href="/auth/signup">
            <button
              id="hiw-cta"
              className="btn-primary font-display font-bold text-base px-8 py-3.5 rounded-2xl text-white inline-flex items-center gap-2"
            >
              🎓 Start for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
