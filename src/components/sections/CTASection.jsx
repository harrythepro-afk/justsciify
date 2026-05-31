'use client';

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,1) 0%, rgba(168,85,247,0.5) 40%, transparent 70%)', opacity: 0.08 }} />
        {/* Decorative rings */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ border: '1px solid rgba(56,189,248,0.06)' }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ border: '1px solid rgba(168,85,247,0.04)' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Icon with glow */}
        <div
          className="text-7xl mb-8 inline-block animate-bounce-gentle"
          style={{ filter: 'drop-shadow(0 0 40px rgba(250,204,21,0.6)) drop-shadow(0 0 80px rgba(250,204,21,0.3))' }}
        >
          🚀
        </div>

        {/* Headline */}
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
          Ready to Become a<br />
          <span className="gradient-text">Science Champion?</span>
        </h2>

        <p className="font-body text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Join 10,000+ kids already mastering science with JustSciify. Free to start. No credit card needed!
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            id="cta-main"
            className="btn-primary animate-pulse-glow font-display font-black text-xl px-12 py-5 rounded-2xl text-white relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              🎓 Start Learning Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 shimmer opacity-30" />
          </button>
          <button
            id="cta-app"
            className="btn-secondary font-display font-bold text-xl px-12 py-5 rounded-2xl text-white flex items-center gap-2 justify-center"
          >
            📱 Download App
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {[
            '✓ Free forever plan',
            '✓ No ads for kids',
            '✓ NCERT aligned',
            '✓ Progress always saved',
            '✓ Cancel anytime',
          ].map((t, i) => (
            <span key={i} className="font-body text-slate-600 text-sm">{t}</span>
          ))}
        </div>

        {/* Social proof mini */}
        <div className="mt-14 inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex -space-x-2">
            {['👧', '👦', '🧒', '👧', '👦'].map((e, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2"
                style={{ background: '#0B1225', borderColor: '#03050F' }}
              >
                {e}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
            <p className="font-body text-slate-400 text-sm">
              <span className="text-white font-semibold">10,000+ kids</span> are learning right now
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
