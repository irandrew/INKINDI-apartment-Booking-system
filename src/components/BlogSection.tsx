import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Clock, User } from 'lucide-react';

export default function BlogSection() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600',
      category: 'Lifestyle',
      title: '10 Ways to Decorate Your Luxury Apartment',
      author: 'John Kamau',
      date: 'Oct 12, 2023'
    },
    {
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
      category: 'Real Estate',
      title: 'Why Kigali is the Best City for Investment',
      author: 'Sarah Umutesi',
      date: 'Oct 05, 2023'
    },
    {
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600',
      category: 'Design',
      title: 'The Future of Urban Living Spaces',
      author: 'Eric Nshimiye',
      date: 'Sep 28, 2023'
    }
  ];

  return (
    <section className={`py-24 font-sans ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end mb-12">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Journal</span>
            <h2 className={`mt-4 text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Insights & <span className="text-blue-600">Lifestyle.</span>
            </h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600 hover:gap-3 transition-all">
            View All Posts <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-3xl mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-100 text-neutral-500'}`}>
                  {post.category}
                </span>
                <h3 className={`text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {post.title}
                </h3>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
                    <User className="h-3 w-3" /> {post.author}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
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
