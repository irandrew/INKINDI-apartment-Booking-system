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
      className={`mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8 transition-colors duration-500`}
    >
      <header className="mb-12">
        <h1 className={`mb-4 text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('apartments.title')}</h1>
        <p className={`text-lg ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{t('apartments.sub')}</p>
      </header>

      {/* Search and Filters */}
      <div className="mb-12 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t('apartments.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl border py-3 pr-4 pl-12 text-sm outline-none transition-all focus:ring-2 ${isDark ? 'border-white/10 bg-white/5 text-white focus:border-blue-500 focus:ring-blue-900' : 'border-neutral-200 bg-white text-black focus:border-blue-500 focus:ring-blue-100'}`}
          />
        </div>
        <button className={`flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition-colors ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'}`}>
          <SlidersHorizontal className="h-4 w-4" />
          {t('apartments.filters')}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`h-[400px] animate-pulse rounded-2xl ${isDark ? 'bg-white/5' : 'bg-neutral-200'}`}></div>
          ))}
        </div>
      ) : filteredApartments.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
