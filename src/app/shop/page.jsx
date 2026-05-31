'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { updateUserProfile } from '@/lib/db';

const SHOP_ITEMS = [
  { id: 'avatar_astro_boy', name: 'Astro Cadet', type: 'avatar', emoji: '🧑‍🚀', cost: 50, color: '#38bdf8', desc: 'Sleek neon explorer suit for beginner science scouts.' },
  { id: 'avatar_cyber_cyborg', name: 'Cybernetic Sage', type: 'avatar', emoji: '🤖', cost: 100, color: '#a855f7', desc: 'Chrome titanium shell equipped with advanced sensory logs.' },
  { id: 'avatar_alien_xenon', name: 'Xenon Lifeform', type: 'avatar', emoji: '👽', cost: 150, color: '#4ade80', desc: 'Bio-luminescent cosmic explorer visiting from the Andromeda galaxy.' },
  { id: 'avatar_solar_lord', name: 'Solar Monarch', type: 'avatar', emoji: '👑', cost: 250, color: '#facc15', desc: 'Equipped with solar radiation protection and plasma shielding.' },
  { id: 'avatar_blackhole_mage', name: 'Blackhole Wizard', type: 'avatar', emoji: '🌌', cost: 400, color: '#f87171', desc: 'Control gravity fields with the absolute ultimate cosmic explorer tier.' },
];

function ShopContent() {
  const { user, profile, refreshProfile } = useAuth();
  const [buyingId, setBuyingId] = useState(null);

  if (!profile) return null;

  const unlocked = profile.unlockedAvatars || [];
  const currentEquipped = profile.avatarId || 'explorer_default';

  const handlePurchase = async (item) => {
    if (profile.xp < item.cost) {
      alert('❌ Insufficient XP! Solve more quizzes to gain points.');
      return;
    }

    setBuyingId(item.id);
    try {
      const updatedUnlocked = [...unlocked, item.id];
      const newXP = profile.xp - item.cost;

      // Update database profile
      await updateUserProfile(user.$id, {
        xp: newXP,
        unlockedAvatars: updatedUnlocked,
        avatarId: item.id // Auto-equip on purchase
      });

      await refreshProfile();
      alert(`🎉 Successfully unlocked and equipped: ${item.name}!`);
    } catch (err) {
      console.error('Failed to buy item:', err);
    } finally {
      setBuyingId(null);
    }
  };

  const handleEquip = async (itemId) => {
    setBuyingId(itemId);
    try {
      await updateUserProfile(user.$id, { avatarId: itemId });
      await refreshProfile();
    } catch (err) {
      console.error('Failed to equip item:', err);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative" style={{ background: '#03050F' }}>
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(3,5,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base bg-gradient-to-r from-sky-400 to-indigo-500">🛍️</div>
          <span className="font-display font-black text-lg text-white">
            Cosmic<span className="gradient-text">Bazaar</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-display font-bold text-xs px-4 py-2 rounded-xl">
            ⭐ {profile.xp} XP Available
          </div>
          <Link href="/dashboard">
            <button className="btn-secondary font-display font-bold text-xs px-4 py-2 rounded-lg text-white">
              🏠 Dashboard
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl w-full mx-auto px-4 mt-12 z-10 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label mb-3">Bazaar Upgrades</span>
          <h1 className="font-display font-black text-4xl text-white mb-2 tracking-tight">
            Virtual <span className="gradient-text">Avatar Shop</span>
          </h1>
          <p className="font-body text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Spend your study points! Exchange your science XP to customize your public character avatar and profile badge grids.
          </p>
        </div>

        {/* Bazaar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default Free Card */}
          <div
            className="sci-card p-6 flex flex-col justify-between relative"
            style={{
              borderColor: currentEquipped === 'explorer_default' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
              background: 'rgba(11, 18, 37, 0.7)'
            }}
          >
            {currentEquipped === 'explorer_default' && (
              <span className="absolute top-4 right-4 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-display font-bold text-[8px] uppercase px-2 py-0.5 rounded-full">
                Equipped
              </span>
            )}
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-white/5 border border-white/10">
                🧑‍🔬
              </div>
              <h3 className="font-display font-black text-base text-white mb-1">Default Intern</h3>
              <span className="font-body font-bold text-[10px] text-slate-500">FREE BASE UNLOCK</span>
              <p className="font-body text-slate-400 text-xs mt-3 leading-relaxed">
                Your reliable rookie lab coat. Always ready to perform baseline concept science reviews.
              </p>
            </div>
            <button
              onClick={() => handleEquip('explorer_default')}
              disabled={currentEquipped === 'explorer_default' || buyingId !== null}
              className="w-full btn-secondary font-display font-bold text-xs py-2.5 rounded-xl mt-6 text-white"
            >
              {currentEquipped === 'explorer_default' ? 'Active' : 'Equip Avatar'}
            </button>
          </div>

          {/* Shop Items */}
          {SHOP_ITEMS.map((item) => {
            const isUnlocked = unlocked.includes(item.id);
            const isActive = currentEquipped === item.id;

            return (
              <div
                key={item.id}
                className="sci-card p-6 flex flex-col justify-between relative group"
                style={{
                  borderColor: isActive ? item.color : isUnlocked ? `${item.color}30` : 'rgba(255,255,255,0.06)',
                  background: 'rgba(11, 18, 37, 0.7)'
                }}
              >
                {/* Visual Glow Layer */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 30px ${item.color}` }}
                />

                {isActive && (
                  <span className="absolute top-4 right-4 font-display font-bold text-[8px] uppercase px-2.5 py-0.5 rounded-full text-white"
                    style={{ background: item.color }}>
                    Active
                  </span>
                )}

                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    {item.emoji}
                  </div>
                  <h3 className="font-display font-black text-base text-white mb-1">{item.name}</h3>
                  <span className="font-display font-bold text-[10px]" style={{ color: item.color }}>
                    {isUnlocked ? 'UNLOCKED' : `COST: ${item.cost} XP`}
                  </span>
                  <p className="font-body text-slate-400 text-xs mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {isUnlocked ? (
                  <button
                    disabled={isActive || buyingId !== null}
                    onClick={() => handleEquip(item.id)}
                    className="w-full btn-secondary font-display font-bold text-xs py-2.5 rounded-xl mt-6 text-white"
                  >
                    {buyingId === item.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : isActive ? (
                      'Equipped'
                    ) : (
                      'Equip Avatar'
                    )}
                  </button>
                ) : (
                  <button
                    disabled={profile.xp < item.cost || buyingId !== null}
                    onClick={() => handlePurchase(item)}
                    className="w-full font-display font-bold text-xs py-2.5 rounded-xl mt-6 text-white transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: profile.xp >= item.cost 
                        ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)`
                        : 'rgba(255,255,255,0.03)',
                      color: profile.xp >= item.cost ? '#000' : 'rgba(255,255,255,0.2)',
                      cursor: profile.xp >= item.cost ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {buyingId === item.id ? (
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>🔑 Unlock ({item.cost} XP)</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <AuthGuard>
      <ShopContent />
    </AuthGuard>
  );
}
