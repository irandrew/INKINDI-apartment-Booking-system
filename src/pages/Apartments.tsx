import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment } from '../types';
import ApartmentCard from '../components/ApartmentCard';
import { useApp } from '../context/AppContext';
import MapComponent from '../components/MapComponent';
import { Skeleton } from '../components/LoadingComponents';

export default function Apartments({ id }: { id?: string }) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
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

          <div className={`flex items-center p-1 rounded-full border ${isDark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-white'}`}>
            <button 
             onClick={() => setViewMode('grid')}
             className={`p-3 rounded-full transition-all ${viewMode === 'grid' ? (isDark ? 'bg-gold-500 text-white' : 'bg-neutral-900 text-white') : 'text-neutral-400 hover:text-neutral-600'}`}
            >
               <List className="h-4 w-4" />
            </button>
            <button 
             onClick={() => setViewMode('map')}
             className={`p-3 rounded-full transition-all ${viewMode === 'map' ? (isDark ? 'bg-gold-500 text-white' : 'bg-neutral-900 text-white') : 'text-neutral-400 hover:text-neutral-600'}`}
            >
               <MapIcon className="h-4 w-4" />
            </button>
          </div>

          <button className="luxury-button !py-4 px-6 md:px-8">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col gap-6">
                <Skeleton className="aspect-[10/12] rounded-[3rem]" />
                <div className="space-y-3 px-4">
                  <Skeleton className="h-6 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredApartments.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredApartments.map(apt => (
                <motion.div
                  key={apt.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ApartmentCard apartment={apt} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <MapComponent apartments={filteredApartments} />
            </motion.div>
          )
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
              <Search className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className={`mb-2 text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('apartments.not_found')}</h3>
            <p className="text-neutral-500">{t('apartments.try_adjusting')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
