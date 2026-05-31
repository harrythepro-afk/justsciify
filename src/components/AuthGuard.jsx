'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (adminOnly && profile?.email !== 'admin@justsciify.com') {
      router.push('/dashboard');
    }
  }, [user, profile, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#03050F' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-gentle"
            style={{ filter: 'drop-shadow(0 0 20px rgba(14,165,233,0.6))' }}>🔬</div>
          <div className="font-display font-black text-xl mb-3">
            <span className="text-white">Just</span>
            <span className="gradient-text">Sciify</span>
          </div>
          <div className="w-40 h-1.5 rounded-full mx-auto overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full shimmer" style={{ background: 'linear-gradient(90deg, #0ea5e9, #a855f7)', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && profile?.email !== 'admin@justsciify.com') return null;

  return children;
}
