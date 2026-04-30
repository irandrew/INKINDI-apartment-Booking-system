import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment } from '../types';
import { MapPin, Users, ShieldCheck, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function ApartmentDetails({ id }: { id?: string }) {
  const { id: apartmentId } = useParams();
  const navigate = useNavigate();
  const { t, theme } = useApp();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    guestName: user?.displayName || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guestName: prev.guestName || user.displayName || '',
        guestEmail: prev.guestEmail || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchApartment = async () => {
      if (!apartmentId) return;
      try {
        const docRef = doc(db, 'apartments', apartmentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApartment({ id: docSnap.id, ...docSnap.data() } as Apartment);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `apartments/${apartmentId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [apartmentId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment || !apartmentId) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = differenceInDays(end, start);

    if (days <= 0) {
      alert("End date must be after start date");
      return;
    }

    setIsBooking(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        apartmentId,
        apartmentName: apartment.name,
        guestUid: user?.uid || null,
        ...formData,
        totalPrice: days * apartment.pricePerNight,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setBookingSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (!apartment) return <div className="p-24 text-center">{t('details.not_found')}</div>;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mx-auto max-w-7xl px-4 pt-32 pb-8 sm:px-6 lg:px-8 transition-colors duration-500`}
    >
      <button 
        onClick={() => navigate(-1)} 
        className={`mb-8 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('details.back')}
      </button>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className={`mb-8 overflow-hidden rounded-3xl ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
            <img
              src={apartment.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2000'}
              alt={apartment.name}
              className="h-[500px] w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mb-12">
            <div className={`mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              <MapPin className="h-4 w-4" />
              {apartment.location}
            </div>
            <h1 className={`mb-6 text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>{apartment.name}</h1>
            
            <div className={`mb-8 flex flex-wrap gap-8 py-6 border-y ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}><Users className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} /></div>
                <div>
                  <div className="text-[10px] font-black tracking-widest text-neutral-500 uppercase">{t('details.capacity')}</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{apartment.capacity} {t('apartment.guests')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}><ShieldCheck className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} /></div>
                <div>
                  <div className="text-[10px] font-black tracking-widest text-neutral-500 uppercase">{t('details.verified')}</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t('details.verified_host')}</div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className={`mb-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('details.description')}</h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{apartment.description}</p>
            </div>

            <div>
              <h2 className={`mb-6 text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('details.amenities')}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {apartment.amenities.map((amenity, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium transition-colors ${isDark ? 'bg-white/5 text-neutral-300' : 'bg-neutral-50 text-neutral-700'}`}>
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span className="capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Booking Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl p-8 text-center ring-1 ${isDark ? 'bg-blue-900/20 ring-blue-500/30' : 'bg-emerald-50 ring-emerald-200'}`}
            >
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className={`mb-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-emerald-900'}`}>{t('booking.confirmed')}</h3>
              <p className={`mb-6 ${isDark ? 'text-neutral-400' : 'text-emerald-700'}`}>{t('booking.success_msg')}</p>
              <button
                onClick={() => setBookingSuccess(false)}
                className={`w-full rounded-2xl py-4 font-bold text-white transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {t('booking.another')}
              </button>
            </motion.div>
          ) : (
            <div className={`rounded-3xl p-8 shadow-xl ring-1 transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/10 ring-white/10 text-white' : 'bg-white border-neutral-200 ring-neutral-200 text-black'}`}>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-neutral-900'}`}>${apartment.pricePerNight}</span>
                  <span className="ml-1 text-sm text-neutral-500">/ {t('common.night')}</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('search.checkin').split(' - ')[0]}</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${isDark ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-neutral-200 focus:border-blue-500'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('search.checkin').split(' - ')[1]}</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${isDark ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-neutral-200 focus:border-blue-500'}`}
                  />
                </div>
                {/* Other fields similarly updated... */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('booking.fullname')}</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${isDark ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-neutral-200 focus:border-blue-500'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('booking.email')}</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${isDark ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-neutral-200 focus:border-blue-500'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('booking.phone')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${isDark ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-white border-neutral-200 focus:border-blue-500'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className={`mt-6 w-full rounded-2xl py-4 font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 shadow-xl ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-black hover:bg-neutral-800'}`}
                >
                  {isBooking ? t('booking.processing') : t('booking.reserve')}
                </button>
              </form>
              
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                {t('booking.notice')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
