export default function Footer() {
  const COLS = [
    {
      title: 'Learn',
      links: [
        { label: 'Class 3 Science', href: '#' },
        { label: 'Class 4 Science', href: '#' },
        { label: 'Class 5 Science', href: '#' },
        { label: 'All Topics', href: '#' },
      ],
    },
    {
      title: 'Features',
      links: [
        { label: 'Interactive Quizzes', href: '#' },
        { label: 'Belt Rewards', href: '#' },
        { label: 'Progress Tracking', href: '#' },
        { label: 'Parent Dashboard', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Contact Us', href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(3,5,15,0.5))' }} />

      <div className="max-w-6xl mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
              >
                🔬
              </div>
              <span className="font-display font-black text-xl">
                <span className="text-white">Just</span>
                <span className="gradient-text">Sciify</span>
              </span>
            </div>
            <p className="font-body text-slate-500 text-sm leading-relaxed mb-5">
              India&apos;s most exciting science learning platform for Class 3–5 kids. NCERT aligned, gamified, and designed for young curious minds.
            </p>
            {/* Social links placeholder */}
            <div className="flex gap-3">
              {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="font-body text-slate-500 text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-body text-slate-600 text-sm">
            © 2024 JustSciify. Made with ❤️ for kids across India 🇮🇳
          </p>
          <div className="flex items-center gap-4">
            <span
              className="font-body text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              NCERT Aligned
            </span>
            <span
              className="font-body text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
            >
              Class 3–5
            </span>
            <span className="font-body text-slate-600 text-xs">English Medium</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
