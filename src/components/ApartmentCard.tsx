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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-[40px] transition-all ring-1 ${isDark ? 'bg-white/5 ring-white/10 hover:ring-white/30' : 'bg-black/5 ring-black/10 hover:ring-black/20'}`}
    >
      <div className="aspect-[11/14] overflow-hidden">
        <img
          src={apartment.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
          alt={apartment.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-6 left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black text-sm font-black shadow-2xl">
          ${apartment.pricePerNight}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
          <MapPin className="h-3 w-3 text-blue-500" />
          <span>{apartment.location}</span>
        </div>
        
        <h3 className="mb-6 text-2xl font-bold tracking-tight text-white font-display leading-tight">{apartment.name}</h3>
        
        <Link
          to={`/apartments/${apartment.id}`}
          className={`flex items-center justify-between w-full rounded-2xl backdrop-blur-md px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-black/10 text-black hover:bg-black hover:text-white'}`}
        >
          {t('apartment.discover')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ApartmentCard;
