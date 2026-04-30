import { motion } from 'motion/react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment } from '../types';
import ApartmentCard from '../components/ApartmentCard';
import { useApp } from '../context/AppContext';

export default function Apartments({ id }: { id?: string }) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'apartments'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Apartment[];
        setApartments(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'apartments');
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  const filteredApartments = apartments.filter(apt => 
    apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mx-auto max-w-7xl px-8 pt-48 pb-24 transition-colors duration-500`}
    >
      <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-2xl">
          <span className={`premium-label tracking-[0.4em] mb-4 block ${isDark ? 'text-gold-500' : 'text-gold-600'}`}>{t('nav.collection')}</span>
          <h1 className={`text-5xl italic font-serif tracking-tight lg:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('apartments.title')}</h1>
          <p className={`mt-6 text-xl font-light tracking-wide ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{t('apartments.sub')}</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
            <Search className="absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-64 lg:w-80 rounded-full border py-4 pr-6 pl-14 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${isDark ? 'border-white/10 bg-white/5 text-white focus:border-gold-500' : 'border-neutral-200 bg-white text-neutral-900 focus:border-gold-600'}`}
            />
          </div>
          <button className="luxury-button !py-4 px-6 md:px-8">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`aspect-[10/12] animate-pulse rounded-[3rem] ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}></div>
          ))}
        </div>
      ) : filteredApartments.length > 0 ? (
        <div className="grid gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApartments.map(apt => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
            <Search className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className={`mb-2 text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('apartments.not_found')}</h3>
          <p className="text-neutral-500">{t('apartments.try_adjusting')}</p>
        </div>
      )}
    </motion.div>
  );
}
