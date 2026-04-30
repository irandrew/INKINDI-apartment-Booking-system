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
    paymentMethod: 'card',
  });

  const calculatePrice = () => {
    if (!apartment || !formData.startDate || !formData.endDate) return { subtotal: 0, tax: 0, total: 0, days: 0 };
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.max(0, differenceInDays(end, start));
    const subtotal = days * apartment.pricePerNight;
    const tax = subtotal * 0.1; // 10% tax/service fee
    return { subtotal, tax, total: subtotal + tax, days };
  };

  const { subtotal, tax, total, days } = calculatePrice();

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
        totalPrice: total,
        status: 'pending',
        paymentStatus: 'unpaid',
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
      className={`mx-auto max-w-full px-8 lg:px-20 pt-48 pb-24 transition-colors duration-500`}
    >
      <button 
        onClick={() => navigate(-1)} 
        className={`premium-label hover:text-gold-600 transition-colors mb-20 flex items-center gap-4`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('details.back')}
      </button>

      <div className="grid gap-24 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className={`mb-20 overflow-hidden rounded-[3rem] shadow-premium ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}>
            <img
              src={apartment.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2000'}
              alt={apartment.name}
              className="h-[600px] w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mb-20">
            <div className={`flex items-center gap-4 premium-label text-gold-600 mb-6`}>
              <MapPin className="h-4 w-4" />
              {apartment.location}
            </div>
            <h1 className={`text-5xl lg:text-7xl italic font-serif tracking-tight mb-12 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{apartment.name}</h1>
            
            <div className={`flex flex-wrap gap-12 py-10 border-y ${isDark ? 'border-white/5' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-5">
                <div className={`rounded-full p-4 ${isDark ? 'bg-white/5 text-gold-500' : 'bg-gold-50 text-gold-600'}`}><Users className="h-6 w-6" /></div>
                <div>
                  <div className="premium-label !opacity-40">{t('details.capacity')}</div>
                  <div className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-neutral-900'}`}>{apartment.capacity} {t('apartment.guests')}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className={`rounded-full p-4 ${isDark ? 'bg-white/5 text-gold-500' : 'bg-gold-50 text-gold-600'}`}><ShieldCheck className="h-6 w-6" /></div>
                <div>
                  <div className="premium-label !opacity-40">{t('details.verified')}</div>
                  <div className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('details.verified_host')}</div>
                </div>
              </div>
            </div>

            <div className="mt-20">
              <h2 className={`premium-label mb-8`}>{t('details.description')}</h2>
              <p className={`text-xl font-light leading-relaxed tracking-wide ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{apartment.description}</p>
            </div>

            <div className="mt-20">
              <h2 className={`premium-label mb-12`}>{t('details.amenities')}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {apartment.amenities.map((amenity, i) => (
                  <div key={i} className={`flex items-center gap-4 rounded-[2rem] p-6 transition-all hover:bg-gold-50 group border border-transparent hover:border-gold-100 ${isDark ? 'bg-white/5 text-neutral-300' : 'bg-white shadow-sm text-neutral-700'}`}>
                    <CheckCircle2 className="h-5 w-5 text-gold-600 transition-transform group-hover:scale-110" />
                    <span className="premium-label !text-xs !opacity-100 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Booking Form */}
        <div className="lg:sticky lg:top-32 h-fit">
          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[3rem] p-12 text-center shadow-premium ${isDark ? 'bg-neutral-900 border border-white/5' : 'bg-white border border-gold-100'}`}
            >
              <div className={`mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-gold-500/10 text-gold-500' : 'bg-gold-50 text-gold-600'}`}>
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className={`text-3xl font-serif italic mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('booking.confirmed')}</h3>
              <p className={`mb-10 font-light tracking-wide ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{t('booking.success_msg')}</p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="luxury-button w-full bg-neutral-900 text-white border-none hover:bg-gold-600"
              >
                {t('booking.another')}
              </button>
            </motion.div>
          ) : (
            <div className={`rounded-[3rem] p-12 shadow-premium border transition-all duration-500 ${isDark ? 'bg-neutral-900 border-white/5 text-white' : 'bg-white border-gold-100 text-neutral-950'}`}>
              <div className="mb-12 flex items-baseline gap-2">
                <span className={`text-5xl italic font-serif ${isDark ? 'text-gold-500' : 'text-gold-600'}`}>${apartment.pricePerNight}</span>
                <span className="premium-label !opacity-40">/ {t('common.night')}</span>
              </div>

              <form onSubmit={handleBooking} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('search.checkin').split(' - ')[0]}</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('search.checkin').split(' - ')[1]}</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('booking.fullname')}</label>
                  <input
                    type="text"
                    required
                    placeholder="ENTER FULL NAME"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('booking.email')}</label>
                  <input
                    type="email"
                    required
                    placeholder="EMAIL@DOMAIN.COM"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('booking.phone')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="PHONE NUMBER"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <label className="premium-label !text-[10px] !opacity-40 leading-none">{t('booking.payment_method')}</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'card', label: t('booking.card') },
                      { id: 'bank', label: t('booking.bank') },
                      { id: 'momo', label: t('booking.momo') }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        className={`flex items-center justify-between rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.paymentMethod === method.id 
                            ? (isDark ? 'bg-gold-500 text-black' : 'bg-neutral-900 text-white')
                            : (isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100')
                        }`}
                      >
                        {method.label}
                        <div className={`h-2 w-2 rounded-full ${formData.paymentMethod === method.id ? 'bg-current' : 'border border-current opacity-20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {days > 0 && (
                  <div className={`mt-10 rounded-[2rem] p-8 space-y-4 ${isDark ? 'bg-white/5' : 'bg-neutral-50'}`}>
                    <h4 className="premium-label !text-[10px] !opacity-40 mb-6">{t('booking.details_title')}</h4>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                      <span className="opacity-40">{t('booking.price_per_night')}</span>
                      <span>${apartment.pricePerNight}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                      <span className="opacity-40">{t('booking.nights')}</span>
                      <span className="text-gold-600">{days}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                      <span className="opacity-40">{t('booking.tax')}</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className={`pt-4 border-t flex justify-between text-base font-serif italic ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
                      <span className={isDark ? 'text-white' : 'text-neutral-900'}>{t('booking.total')}</span>
                      <span className="text-gold-600 tracking-tight font-sans not-italic font-black">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking}
                  className={`luxury-button w-full !py-6 mt-12 bg-neutral-950 text-white border-none hover:bg-gold-600 disabled:opacity-50 transition-all duration-500`}
                >
                  {isBooking ? t('booking.processing') : t('booking.reserve')}
                </button>
              </form>
              
              <p className="mt-8 text-center premium-label !text-[9px] !opacity-30 leading-relaxed uppercase">
                {t('booking.notice')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
