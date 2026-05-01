import React from 'react';
import { motion } from 'motion/react';
import { Hotel, Mail, Phone, MapPin, Globe, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t font-sans py-24 ${isDark ? 'bg-neutral-950 border-white/5' : 'bg-gold-50 border-gold-100'}`}>
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-4">
          <div className="space-y-8">
            <Link to="/" className={`flex flex-col group transition-colors ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              <span className="text-3xl italic font-serif leading-none tracking-tight">Inkindi</span>
              <span className="premium-label !text-[8px] opacity-40 mt-1">{t('nav.brand_tagline')}</span>
            </Link>
            <p className={`text-sm font-light leading-relaxed tracking-wide ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
              Curating the finest living experiences across the region. We redefine hospitality through architectural integrity and bespoke service.
            </p>
            <div className="flex gap-6">
              {[Globe, MessageCircle, Sparkles].map((Icon, i) => (
                <a key={i} href="#" className={`transition-colors ${isDark ? 'text-neutral-600 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="premium-label mb-8 block">{t('footer.navigation')}</span>
            <ul className="space-y-4">
              {['collection', 'amenities', 'journal', 'philosophy'].map((key) => (
                <li key={key}>
                  <Link to="#" className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-neutral-600 hover:text-gold-500' : 'text-neutral-400 hover:text-gold-600'}`}>
                    {t(key === 'philosophy' ? 'footer.philosophy' : `nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="premium-label mb-8 block">{t('footer.inquiries')}</span>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="h-4 w-4 text-gold-600 shrink-0 mt-1" />
                <span className={`text-xs font-medium leading-relaxed tracking-wide ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  123 Luxury Avenue, Business District<br />Kigali, Rwanda
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-4 w-4 text-gold-600 shrink-0" />
                <span className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>+250 788 000 000</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-4 w-4 text-gold-600 shrink-0" />
                <span className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>concierge@inkindi.com</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="premium-label mb-8 block">{t('footer.perspectives')}</span>
            <p className={`text-xs mb-6 font-light tracking-wide ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>{t('footer.newsletter_sub')}</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder={t('footer.newsletter_placeholder')}
                className={`w-full bg-transparent border-b py-4 text-[10px] font-black tracking-[0.2em] outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gold-600 hover:translate-x-1 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-32 pt-12 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/5' : 'border-neutral-100'}`}>
          <p className={`premium-label !opacity-30`}>
            © {new Date().getFullYear()} {t('footer.rights')}
          </p>
          <div className="flex gap-10">
            <Link to="/admin" className={`premium-label !opacity-30 hover:!opacity-100 transition-opacity`}>Admin</Link>
            <Link to="#" className={`premium-label !opacity-30 hover:!opacity-100 transition-opacity`}>Privacy</Link>
            <Link to="#" className={`premium-label !opacity-30 hover:!opacity-100 transition-opacity`}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
