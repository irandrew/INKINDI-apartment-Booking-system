import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, User, LogOut, Menu, X, Sun, Globe, Moon, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';

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
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? (isDark ? 'border-b border-white/10 bg-black/80 backdrop-blur-2xl py-0' : 'border-b border-black/5 bg-white/90 backdrop-blur-2xl py-0') 
          : 'border-b border-transparent bg-transparent py-2'
      }`}
    >
      <div className="mx-auto flex h-20 items-center justify-between px-6 sm:px-10 lg:px-12 max-w-7xl">
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-3 text-xl font-bold tracking-tighter font-display transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:rotate-12 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <Hotel className="h-5 w-5" />
          </div>
          <span className="italic font-serif leading-none">Inkindi</span>
        </Link>

        {/* Center Section: Links or Mini-Search */}
        <div className="hidden flex-1 items-center justify-center px-12 md:flex">
          {!scrolled ? (
            <div className="flex items-center gap-10">
              <Link to="/apartments" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-black'}`}>
                {t('nav.collection')}
              </Link>
              <Link to="#" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-black'}`}>
                {t('nav.amenities')}
              </Link>
              <Link to="#" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-black'}`}>
                {t('nav.journal')}
              </Link>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex items-center gap-6 rounded-full border px-6 py-2.5 shadow-xl transition-all ${isDark ? 'border-white/10 bg-neutral-900/50' : 'border-neutral-200 bg-white'}`}
            >
               <div className="flex items-center gap-3">
                 <MapPin className="h-3 w-3 text-neutral-400" />
                 <span className="text-[10px] font-bold tracking-widest">{t('common.location')}</span>
               </div>
               <div className="h-4 w-[1px] bg-neutral-500/30" />
               <div className="flex items-center gap-3">
                 <Calendar className="h-3 w-3 text-neutral-400" />
                 <span className="text-[10px] font-bold tracking-widest">{t('search.date_range')}</span>
               </div>
               <div className="h-4 w-[1px] bg-neutral-500/30" />
               <div className="flex items-center gap-3">
                 <User className="h-3 w-3 text-neutral-400" />
                 <span className="text-[10px] font-bold tracking-widest italic">{t('common.guests')}</span>
               </div>
            </motion.div>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden items-center gap-4 md:flex">
          <button 
            onClick={toggleTheme}
            className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all active:scale-95 ${isDark ? 'border-white/10 text-white hover:bg-white/10' : 'border-black/10 text-black hover:bg-black/5'}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`group flex h-12 items-center gap-3 rounded-full border px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${isDark ? 'border-white/10 text-white hover:bg-white/10' : 'border-black/10 text-black hover:bg-black/5'}`}
            >
              <Globe className={`h-4 w-4 transition-colors ${isDark ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-500 group-hover:text-black'}`} />
              <span>{language}</span>
            </button>
            
            {isLangOpen && (
              <div className={`absolute top-full right-0 mt-2 w-32 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/10 bg-neutral-900' : 'border-black/10 bg-white'}`}>
                {['EN', 'FR', 'RW'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l as any); setIsLangOpen(false); }}
                    className={`w-full px-4 py-3 text-left text-[10px] font-bold tracking-widest transition-colors ${isDark ? 'text-neutral-400 hover:bg-white/10 hover:text-white' : 'text-neutral-500 hover:bg-black/5 hover:text-black'}`}
                  >
                    {l === 'EN' ? 'ENGLISH' : l === 'FR' ? 'FRANÇAIS' : 'KINYARWANDA'}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className={`ml-2 h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

          {isAdmin && (
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>
                {t('nav.dashboard')}
              </Link>
              <button 
                onClick={handleLogout}
                className={`rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
              >
                {t('nav.signout')}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isDark ? "p-2 text-white" : "p-2 text-black"}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`border-t p-8 md:hidden transition-colors duration-500 ${isDark ? 'border-white/10 bg-black text-white' : 'border-black/5 bg-white text-black'}`}>
          <div className="flex flex-col gap-6">
            <Link to="/apartments" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">{t('nav.collection')}</Link>
            <Link to="#" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">{t('nav.amenities')}</Link>
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">{t('nav.dashboard')}</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
                  <LogOut className="h-4 w-4" /> {t('nav.signout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
