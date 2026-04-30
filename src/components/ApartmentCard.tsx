import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Wifi, Wind, ArrowRight } from 'lucide-react';
import { Apartment } from '../types';
import React from 'react';
import { useApp } from '../context/AppContext';

interface ApartmentCardProps {
  apartment: Apartment;
  id?: string;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, id }) => {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="group block"
    >
      <Link to={`/apartments/${apartment.id}`} className="space-y-6">
        <div className={`relative overflow-hidden rounded-[3rem] aspect-[10/12] shadow-premium ${isDark ? 'bg-neutral-900 ring-1 ring-white/5' : 'bg-neutral-100'}`}>
          <img
            src={apartment.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
            alt={apartment.name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-black/20 group-hover:bg-black/0' : 'bg-black/10 group-hover:bg-black/0'}`} />
          
          <div className="absolute top-8 right-8 overflow-hidden rounded-full backdrop-blur-xl border border-white/20 bg-white/10 px-6 py-2">
            <span className="text-sm font-bold text-white tracking-widest leading-none">
              ${apartment.pricePerNight} <span className="opacity-60 text-[10px] uppercase">/ night</span>
            </span>
          </div>
        </div>
        
        <div className="space-y-2 px-2">
          <div className="flex items-center gap-3">
            <span className="premium-label tracking-[0.4em]">{apartment.location}</span>
            <div className={`h-[1px] flex-grow opacity-10 ${isDark ? 'bg-white' : 'bg-black'}`} />
          </div>
          
          <h3 className={`text-4xl italic font-serif leading-tight transition-colors duration-300 group-hover:text-gold-600 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {apartment.name}
          </h3>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50">
              <Users className="h-3 w-3" />
              <span>{apartment.capacity} Guests</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-600" />
              <span>Luxury amenities</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ApartmentCard;
