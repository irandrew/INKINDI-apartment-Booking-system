import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Shield, Sparkles, Heart } from 'lucide-react';

export default function AboutSection() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const values = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Trust & Safety',
      desc: 'Your security is our priority. Every property is verified and maintained to the highest standards.'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Premium Comfort',
      desc: 'We curate spaces that blend modern aesthetics with functional luxury for a seamless living experience.'
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Personalized Service',
      desc: 'Our dedicated team is available 24/7 to ensure your stay exceeds every expectation.'
    }
  ];

  return (
    <section className={`py-24 font-sans ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Our Story</span>
              <h2 className={`mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Redefining the Art of <span className="text-blue-600">Living.</span>
              </h2>
            </div>
            
            <p className={`text-lg leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Founded in 2020, Inkindi has grown from a local startup to Rwanda's premier luxury apartment provider. We believe that a home is more than just a place to sleep—it's a sanctuary where life happens.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {values.map((val, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                    {val.icon}
                  </div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{val.title}</h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>{val.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1600607687940-4e524cb350b2?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Lobby" 
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 rounded-[2rem] bg-blue-600 p-10 text-white shadow-xl shadow-blue-500/20 max-w-[240px]">
              <p className="text-4xl font-black">150+</p>
              <p className="text-sm font-medium opacity-80 mt-1 uppercase tracking-wider">Premium Properties Managed</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
