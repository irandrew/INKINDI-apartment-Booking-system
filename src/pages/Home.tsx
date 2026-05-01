import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, Shield, Clock, MapPin, Calendar, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment } from '../types';
import ApartmentCard from '../components/ApartmentCard';
import { useApp } from '../context/AppContext';
import AboutSection from '../components/AboutSection';
import GallerySection from '../components/GallerySection';
import BlogSection from '../components/BlogSection';
import Counter from '../components/Counter';

export default function Home({ id }: { id?: string }) {
  const [featuredApartments, setFeaturedApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000",
      tagline: "home.hero_tagline",
      titleMain: "home.hero_title_art",
      titleItalic: "home.hero_title_ofstaying",
      titleSub: "",
      accentColor: "text-blue-500",
      cta: "home.cta_explore"
    },
    {
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000",
      tagline: "home.hero_tagline",
      titleMain: "home.hero_title_pure",
      titleItalic: "home.hero_title_design",
      titleSub: "",
      accentColor: "text-emerald-500",
      cta: "home.cta_view"
    },
    {
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000",
      tagline: "home.hero_tagline",
      titleMain: "home.hero_title_elite",
      titleItalic: "home.hero_title_comfort",
      titleSub: "",
      accentColor: "text-amber-500",
      cta: "home.cta_reserve"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'apartments'), limit(3));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Apartment[];
        setFeaturedApartments(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'apartments');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col transition-colors duration-500 ${isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900'}`}
    >
      {/* Hero Section */}
      <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden px-6 pb-24 pt-12">
        {/* Animated Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              <img 
                src={slides[currentSlide].image} 
                className="h-full w-full object-cover"
                alt="Architecture"
              />
            </motion.div>
          </AnimatePresence>
          <div className={`absolute inset-0 ${isDark ? 'bg-neutral-950/60' : 'bg-white/60'}`} />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-[90vw] lg:max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <span className="premium-label mb-10 block opacity-0 animate-[fadeIn_1s_ease_0.2s_forwards]">
                {t(slides[currentSlide].tagline)}
              </span>
              
              <h1 className="mb-20 leading-[0.8] tracking-tighter">
                <span className="block text-[14vw] lg:text-[180px] font-black uppercase md:-ml-8">
                  {t(slides[currentSlide].titleMain)}
                </span>
                <span className={`block text-[15vw] lg:text-[200px] font-serif italic font-light -mt-4 md:-mt-12 text-gold-600`}>
                  {t(slides[currentSlide].titleItalic)}
                </span>
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="w-full max-w-5xl"
          >
              <div className={`flex flex-col md:flex-row items-stretch rounded-[3rem] p-4 backdrop-blur-3xl shadow-premium border ${isDark ? 'border-white/10 bg-neutral-900/40' : 'border-gold-100 bg-white/60'}`}>
                <div className="flex-1 flex flex-col justify-center px-10 py-6">
                  <span className="premium-label mb-2 opacity-50">{t('search.location')}</span>
                  <span className="text-xl font-serif italic text-neutral-500">{t('search.location_cta')}</span>
                </div>
                <div className={`flex-1 flex flex-col justify-center px-10 py-6 border-y md:border-y-0 md:border-x ${isDark ? 'border-white/10' : 'border-gold-100'}`}>
                  <span className="premium-label mb-2 opacity-50">{t('search.checkin')}</span>
                  <span className="text-xl font-serif italic text-neutral-500">{t('search.checkin_cta')}</span>
                </div>
              <Link 
                to="/apartments"
                className={`luxury-button flex items-center justify-center gap-4 py-8 px-16 group transition-all duration-500 border-none ${
                  isDark ? 'bg-gold-600 text-white hover:bg-gold-500' : 'bg-white text-neutral-950 shadow-premium hover:bg-neutral-950 hover:text-white'
                }`}
              >
                {t(slides[currentSlide].cta)}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-16 right-16 flex flex-col gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`group flex items-center gap-4 transition-all`}
            >
               <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentSlide === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>0{i + 1}</span>
               <div className={`h-[2px] transition-all rounded-full ${currentSlide === i ? 'w-12 bg-gold-600' : 'w-4 bg-neutral-500/20'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* Featured Apartments */}
      <section className={`py-40 border-t transition-colors duration-500 ${isDark ? 'bg-neutral-950 border-white/5' : 'bg-white border-neutral-100'}`}>
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-12 mb-40">
          {[
            { label: t('home.stats.properties'), val: '150+' },
            { label: t('home.stats.stays'), val: '12K+' },
            { label: t('home.stats.cities'), val: '10' },
            { label: t('home.stats.service'), val: '24/7' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center md:text-left space-y-2"
            >
              <p className="text-5xl font-serif italic text-gold-600">
                <Counter value={stat.val} />
              </p>
              <p className="premium-label opacity-40">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <AboutSection />
        
        <GallerySection />

        <div className="mx-auto max-w-7xl px-6 lg:px-12 mt-40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 flex flex-col md:flex-row items-start md:items-end justify-between border-b pb-12 border-neutral-100"
          >
            <div className="max-w-2xl">
              <span className="premium-label">{t('home.featured_sub')}</span>
              <h2 className={`mt-6 text-5xl font-serif italic md:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('home.featured_title')}</h2>
            </div>
            <Link to="/apartments" className="luxury-button mt-8 md:mt-0">
              {t('home.explore_all')}
            </Link>
          </motion.div>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className={`h-[500px] animate-pulse rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
              ))
            ) : featuredApartments.length > 0 ? (
              featuredApartments.map(apt => (
                <motion.div 
                  key={apt.id} 
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={isDark ? 'dark-card-wrapper' : ''}
                >
                  <ApartmentCard apartment={apt} />
                </motion.div>
              ))
            ) : (
              <div className={`col-span-full py-24 text-center rounded-3xl border border-dashed ${isDark ? 'text-neutral-500 border-white/10' : 'text-neutral-400 border-black/10'}`}>
                {t('apartments.private')}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />

      {/* CTA Section */}
      <section className={`relative py-48 overflow-hidden border-t transition-colors duration-500 ${isDark ? 'border-white/5 bg-black' : 'border-black/5 bg-neutral-900'}`}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687940-47200269556d?auto=format&fit=crop&q=80&w=2000" 
            className="h-full w-full object-cover opacity-30 grayscale"
            alt="Inkindi Night"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-neutral-950/80'}`} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-8 text-5xl font-medium tracking-tight md:text-8xl font-display text-white italic font-serif leading-none">
              {t('home.cta_title')}
            </h2>
            <p className="mb-16 text-xl text-neutral-400 font-light tracking-widest uppercase">
              {t('home.cta_sub')}
            </p>
            <Link
              to="/apartments"
              className="inline-flex items-center gap-6 rounded-full px-16 py-7 text-xs font-black uppercase tracking-[0.4em] transition-all font-display bg-gold-600 text-white hover:bg-gold-500 shadow-2xl"
            >
              {t('home.cta_button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
