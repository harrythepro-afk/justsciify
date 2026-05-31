'use client';
import { useState } from 'react';

const REVIEWS = [
  {
    name: 'Arya Sharma', class: 'Class 4', city: 'Delhi',
    text: 'I love JustSciify! The solar system part was so cool. I got 100% in my school test because of it!',
    emoji: '👧', stars: 5, belt: 'Blue Belt 💧',
    beltColor: '#38bdf8',
  },
  {
    name: 'Rohan Patel', class: 'Class 5', city: 'Mumbai',
    text: 'The quizzes are so fun! I earned my Blue Belt and my parents were so proud. Best app ever!',
    emoji: '👦', stars: 5, belt: 'Green Belt 🌿',
    beltColor: '#4ade80',
  },
  {
    name: 'Diya Nair', class: 'Class 3', city: 'Bangalore',
    text: 'Plants topic taught me things my teacher didn\'t! The explanations helped me remember everything.',
    emoji: '🧒', stars: 5, belt: 'Yellow Belt ⭐',
    beltColor: '#facc15',
  },
  {
    name: 'Aditya Singh', class: 'Class 5', city: 'Pune',
    text: 'I was scared of science but JustSciify made it fun. Now I want to be a scientist when I grow up!',
    emoji: '👦', stars: 5, belt: 'Blue Belt 💧',
    beltColor: '#38bdf8',
  },
  {
    name: 'Priya Verma', class: 'Parent', city: 'Hyderabad',
    text: 'My daughter checks JustSciify every day before school. Her scores improved by 30% this term!',
    emoji: '👩', stars: 5, belt: 'Parent Review',
    beltColor: '#f472b6',
  },
  {
    name: 'Karan Mehta', class: 'Parent', city: 'Chennai',
    text: 'The belt system keeps my son motivated every single day. He\'s already on Green Belt! Incredible platform.',
    emoji: '👨', stars: 5, belt: 'Parent Review',
    beltColor: '#f472b6',
  },
];

export default function Testimonials() {
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[500px] h-[500px] -left-20 top-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,1), transparent)', opacity: 0.04 }} />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mb-5" style={{ color: '#4ade80' }}>
            <span>💬</span>
            <span>Real Stories</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Loved by <span className="gradient-text">10,000+ Kids</span>
          </h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto text-lg">
            Join thousands of happy students and parents across India who swear by JustSciify!
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 cursor-pointer group transition-all duration-300 relative overflow-hidden hover:-translate-y-2"
              style={{
                background: 'rgba(11,18,37,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />

              {/* Top: avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${r.beltColor}15`, border: `1.5px solid ${r.beltColor}30` }}
                >
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-white text-sm">{r.name}</div>
                  <div className="font-body text-slate-500 text-xs">{r.class} · {r.city}</div>
                  <div
                    className="inline-block mt-1 font-body text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${r.beltColor}15`, color: r.beltColor, border: `1px solid ${r.beltColor}30` }}
                  >
                    {r.belt}
                  </div>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {[...Array(r.stars)].map((_, si) => (
                    <span key={si} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <span
                  className="absolute -top-1 -left-1 text-4xl leading-none opacity-20"
                  style={{ color: r.beltColor }}
                >
                  "
                </span>
                <p className="font-body text-slate-300 text-sm leading-relaxed pl-4">
                  {r.text}
                </p>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${r.beltColor}, transparent)` }}
              />
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { val: '4.9/5', label: 'Average Rating', icon: '⭐' },
            { val: '10,000+', label: 'Active Students', icon: '👨‍🎓' },
            { val: '98%', label: 'Would Recommend', icon: '❤️' },
            { val: 'NCERT', label: 'Curriculum Aligned', icon: '📋' },
          ].map((t, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="font-display font-black text-white text-lg">{t.val}</div>
              <div className="font-body text-slate-500 text-xs">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
