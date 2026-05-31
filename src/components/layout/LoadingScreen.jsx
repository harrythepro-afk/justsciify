'use client';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15;
      });
    }, 150);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#03050F' }}
    >
      {/* Glow blob */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15), rgba(168,85,247,0.1), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
      />

      {/* Logo icon */}
      <div
        className="text-6xl mb-5 animate-bounce-gentle relative z-10"
        style={{ filter: 'drop-shadow(0 0 30px rgba(14,165,233,0.7)) drop-shadow(0 0 60px rgba(168,85,247,0.4))' }}
      >
        🔬
      </div>

      {/* Brand name */}
      <div className="font-display font-black text-3xl mb-1 relative z-10">
        <span className="text-white">Just</span>
        <span className="gradient-text">Sciify</span>
      </div>
      <p className="font-body text-slate-500 text-sm mb-8 relative z-10">Preparing your science adventure...</p>

      {/* Progress bar */}
      <div className="w-52 h-1.5 rounded-full overflow-hidden relative z-10" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #0ea5e9, #a855f7)',
            boxShadow: '0 0 10px rgba(14,165,233,0.6)',
          }}
        />
      </div>
    </div>
  );
}
