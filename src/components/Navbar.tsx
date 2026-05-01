import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, User, LogOut, Menu, X, Sun, Globe, Moon, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ id }: { id?: string }) {
  const { user, isAdmin } = useAuth();
  const { language, setLanguage, theme, toggleTheme, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Only use special background for home page
  const isHome = location.pathname === '/';
  const isDark = theme === 'dark';

  return (
    <nav 
      id={id} 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ${
        scrolled 
          ? (isDark ? 'bg-neutral-950/90 backdrop-blur-2xl py-4 border-b border-white/5' : 'bg-white/90 backdrop-blur-2xl py-4 shadow-sm border-b border-gold-100') 
          : 'bg-transparent py-8'
      }`}
    >
      <div className="mx-auto flex items-center justify-between px-8 lg:px-20 max-w-full">
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-4 group transition-colors ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          <div className="relative">
            <Hotel className={`h-6 w-6 transition-transform duration-500 group-hover:scale-110 ${isDark ? 'text-gold-500' : 'text-gold-600'}`} />
            <div className={`absolute -inset-2 rounded-full border border-gold-500/20 scale-0 group-hover:scale-100 transition-transform duration-500`} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl italic font-serif leading-none tracking-tight">Inkindi</span>
            <span className="premium-label !text-[8px] opacity-40 mt-1">{t('nav.brand_tagline')}</span>
          </div>
        </Link>

        {/* Center Section: Links */}
        <div className="hidden items-center gap-16 md:flex">
          {['collection', 'amenities', 'journal'].map((key) => (
            <Link 
              key={key}
              to={key === 'collection' ? '/apartments' : '#'} 
              className={`premium-label hover:text-gold-600 transition-colors relative group`}
            >
              {t(`nav.${key}`)}
              <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-gold-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-6 md:flex">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className={`h-4 w-[1px] ${isDark ? 'bg-white/10' : 'bg-neutral-200'}`} />
          </div>

          <div className="flex items-center gap-4">
            {!isAdmin ? (
                <Link 
                to="/apartments" 
                className={`luxury-button !py-3 !px-10 ${
                  isDark 
                    ? 'bg-neutral-900 text-white border-white/10 hover:bg-gold-600 hover:border-gold-600' 
                    : 'bg-white text-neutral-950 border-neutral-200 hover:bg-neutral-950 hover:text-white'
                }`}
              >
                {t('nav.book_now')}
              </Link>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/admin/dashboard" className="premium-label hover:text-gold-600 transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="luxury-button !py-3 !px-10"
                >
                  {t('nav.signout')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isDark ? "p-2 text-white" : "p-2 text-black"}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`overflow-hidden border-t md:hidden transition-colors duration-500 ${isDark ? 'border-white/10 bg-black text-white' : 'border-black/5 bg-white text-black'}`}
          >
            <div className="flex flex-col gap-8 p-12">
              <Link to="/apartments" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic">{t('nav.collection')}</Link>
              <Link to="#" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic text-neutral-400">{t('nav.amenities')}</Link>
              <Link to="#" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic text-neutral-400">{t('nav.journal')}</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic">{t('nav.dashboard')}</Link>
                  <button onClick={handleLogout} className="flex items-center gap-4 text-xl font-serif italic text-red-500">
                    <LogOut className="h-5 w-5" /> {t('nav.signout')}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
