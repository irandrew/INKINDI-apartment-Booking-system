import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Clock, User } from 'lucide-react';

export default function BlogSection() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1600210491892-03d94ac25655?auto=format&fit=crop&q=80&w=600',
      category: 'Lifestyle',
      title: '10 Ways to Decorate Your Luxury Apartment',
      author: 'John Kamau',
      date: 'Oct 12, 2023'
    },
    {
      image: 'https://images.unsplash.com/photo-1620332372374-f108c53d2e03?auto=format&fit=crop&q=80&w=600',
      category: 'Real Estate',
      title: 'Why Kigali is the Best City for Investment',
      author: 'Sarah Umutesi',
      date: 'Oct 05, 2023'
    },
    {
      image: 'https://images.unsplash.com/photo-1615529328219-e3328e7e319d?auto=format&fit=crop&q=80&w=600',
      category: 'Design',
      title: 'The Future of Urban Living Spaces',
      author: 'Eric Nshimiye',
      date: 'Sep 28, 2023'
    }
  ];

  return (
    <section className={`py-40 font-sans ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-12 sm:flex-row sm:items-end mb-24 border-b border-neutral-100 pb-12">
          <div>
            <span className="premium-label tracking-[0.4em]">The Journal</span>
            <h2 className={`mt-6 text-5xl italic font-serif tracking-tight lg:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Insights & <span className="text-gold-600">Lifestyle.</span>
            </h2>
          </div>
          <button className="luxury-button">
            View All Stories
          </button>
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group cursor-pointer space-y-8"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[3rem] shadow-premium">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <span className="premium-label">{post.category}</span>
                <h3 className={`text-2xl italic font-serif leading-tight group-hover:text-gold-600 transition-colors duration-300 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {post.title}
                </h3>
                <div className="flex items-center gap-6 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                    <User className="h-3 w-3" /> {post.author}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                    <Clock className="h-3 w-3" /> {post.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
