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
    <section className={`py-40 font-sans ${isDark ? 'bg-neutral-950' : 'bg-gold-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <span className="premium-label">Our Philosophy</span>
              <h2 className={`mt-6 text-5xl italic font-serif tracking-tight sm:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Refining the Art of <span className="text-gold-600">Elevated Living.</span>
              </h2>
            </div>
            
            <p className={`text-xl font-light leading-relaxed tracking-wide ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Inkindi is more than a property manager; we are curators of experience. Founded with a vision to merge Rwandan heritage with global luxury standards, we provide sanctuaries that resonate with soul.
            </p>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 pt-6">
              {values.map((val, i) => (
                <div key={i} className="space-y-4">
                  <div className="text-gold-600">
                    {val.icon}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-neutral-900'}`}>{val.title}</h4>
                  <p className={`text-[11px] font-medium leading-relaxed uppercase tracking-wider opacity-60 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{val.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[4rem] shadow-premium">
              <img 
                src="https://images.unsplash.com/photo-1618221415035-02603bb624ce?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Residence Interior" 
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`absolute -bottom-12 -left-12 rounded-[3rem] p-12 shadow-2xl backdrop-blur-2xl max-w-[280px] border ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-900 border-neutral-800 text-white'}`}>
              <p className="text-6xl font-serif italic text-gold-500 line-height-none">150+</p>
              <p className="text-[10px] font-black uppercase mt-4 tracking-[0.3em] opacity-80">Sanctuaries Curated Across the Region</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
