import React from 'react';
import { motion } from 'motion/react';
import { Hotel, Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t font-sans ${isDark ? 'bg-neutral-950 border-white/10' : 'bg-white border-neutral-100'}`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white`}>
                <Hotel className="h-6 w-6" />
              </div>
              <span className={`text-xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Inkindi
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Redefining luxury living in the heart of the city. We provide premium apartments and exceptional service for unforgettable stays.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className={`rounded-lg p-2 transition-colors ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Quick Links</h3>
            <ul className="space-y-4">
              {['Collection', 'Amenities', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to="#" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  123 Luxury Avenue, Business District<br />Kigali, Rwanda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600 shrink-0" />
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>+250 788 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>contact@inkindi.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Newsletter</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Subscribe to receive updates on new properties.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email address"
                className={`w-full rounded-xl border py-3 pl-4 pr-12 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-blue-500'}`}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-1.5 text-white">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/10' : 'border-neutral-100'}`}>
          <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            © {new Date().getFullYear()} Inkindi. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className={`text-xs transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}>Privacy Policy</Link>
            <Link to="#" className={`text-xs transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
