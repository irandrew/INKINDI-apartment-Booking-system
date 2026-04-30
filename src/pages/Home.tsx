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

export default function Home({ id }: { id?: string }) {
  const [featuredApartments, setFeaturedApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000",
      tagline: "home.hero_tagline",
      titleMain: "home.hero_title_art",
      titleItalic: "home.hero_title_ofstaying",
      titleSub: "",
      accentColor: "text-blue-500",
      cta: "home.cta_explore"
    },
    {
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
      tagline: "home.hero_tagline",
      titleMain: "home.hero_title_pure",
      titleItalic: "home.hero_title_design",
      titleSub: "",
      accentColor: "text-emerald-500",
      cta: "home.cta_view"
    },
    {
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000",
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
      className={`flex flex-col transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {/* Hero Section */}
      <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden px-6 pt-12 pb-24">
        {/* Animated Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full"
            >
              <img 
                src={slides[currentSlide].image} 
                className="h-full w-full object-cover"
                alt="Architecture"
              />
            </motion.div>
          </AnimatePresence>
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/20 to-black/60' : 'bg-gradient-to-t from-white via-white/20 to-white/60'}`} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <p className={`mb-8 text-[11px] font-black uppercase tracking-[0.6em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {t(slides[currentSlide].tagline)}
              </p>
              
              <h1 className="mb-16 leading-[0.85]">
                <span className="block text-[100px] md:text-[220px] font-medium tracking-tighter">
                  {t(slides[currentSlide].titleMain)} <span className={`italic font-serif font-semibold ${slides[currentSlide].accentColor}`}>{t(slides[currentSlide].titleItalic)}</span>
                </span>
                {slides[currentSlide].titleSub && (
                  <span className="block text-[80px] md:text-[180px] font-medium tracking-tighter -mt-4 md:-mt-10 opacity-80">
                    {t(slides[currentSlide].titleSub)}
                  </span>
                )}
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-4xl"
          >
            <div className={`flex flex-col md:flex-row items-center gap-0 rounded-[2.5rem] border p-2 backdrop-blur-3xl lg:p-3 shadow-2xl transition-all ${isDark ? 'border-white/10 bg-black/40' : 'border-black/5 bg-white/60'}`}>
              <div className={`flex flex-1 items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <MapPin className="h-5 w-5 text-neutral-500" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">{t('search.location')}</span>
                  <span className="text-sm font-bold tracking-tight">{t('common.location')}</span>
                </div>
              </div>
              <div className={`flex flex-1 items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <Calendar className="h-5 w-5 text-neutral-500" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">{t('search.checkin')}</span>
                  <span className="text-sm font-bold tracking-tight">{t('search.date_range')}</span>
                </div>
              </div>
              <Link 
                to="/apartments"
                className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-full px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
              >
                {t(slides[currentSlide].cta)}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-[4px] transition-all rounded-full ${currentSlide === i ? 'w-12 bg-white' : 'w-4 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Apartments */}
      <section className={`py-32 transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-neutral-50'}`}>
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap justify-center sm:justify-between items-center mb-24 gap-8">
          {[
            { label: 'Properties', val: '150+' },
            { label: 'Happy Guests', val: '12K+' },
            { label: 'Cities', val: '10' },
            { label: 'Customer Support', val: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="text-center sm:text-left">
              <p className="text-2xl font-black text-blue-600">{stat.val}</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        <AboutSection />
        
        <div className="mt-32">
          <GallerySection />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-12 mt-32">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-blue-500">{t('home.featured_sub')}</p>
              <h2 className={`text-4xl font-bold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-black'}`}>{t('home.featured_title')}</h2>
            </div>
            <Link to="/apartments" className={`group flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-white hover:text-blue-500' : 'text-black hover:text-blue-600'}`}>
              {t('home.explore_all')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className={`h-[500px] animate-pulse rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
              ))
            ) : featuredApartments.length > 0 ? (
              featuredApartments.map(apt => (
                <div key={apt.id} className={isDark ? 'dark-card-wrapper' : ''}>
                  <ApartmentCard apartment={apt} />
                </div>
              ))
            ) : (
              <div className={`col-span-full py-24 text-center rounded-3xl border border-dashed ${isDark ? 'text-neutral-500 border-white/10' : 'text-neutral-400 border-black/10'}`}>
                {t('apartments.private')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />

      {/* CTA Section */}
      <section className={`relative py-40 overflow-hidden border-t transition-colors duration-500 ${isDark ? 'border-white/5 bg-black' : 'border-black/5 bg-neutral-50'}`}>
        <div className="relative z-10 mx-auto max-w-4xl text-center px-6">
          <h2 className={`mb-8 text-5xl font-medium tracking-tight md:text-7xl font-display ${isDark ? 'text-white' : 'text-black'}`}>{t('home.cta_title')}</h2>
          <p className="mb-12 text-xl text-neutral-400 font-medium">{t('home.cta_sub')}</p>
          <Link
            to="/apartments"
            className={`inline-flex items-center gap-3 rounded-full px-12 py-5 text-sm font-black uppercase tracking-widest transition-all font-display ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
          >
            {t('home.cta_button')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
