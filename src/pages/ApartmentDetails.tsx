import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment, Review } from '../types';
import { MapPin, Users, ShieldCheck, ArrowLeft, CheckCircle2, Maximize2, X, ChevronLeft, ChevronRight, Star, ShieldAlert } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { FavoriteButton } from '../components/FavoriteButton';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const nextImage = useCallback(() => {
    if (!apartment) return;
    setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % apartment.images.length : null));
  }, [apartment]);

  const prevImage = useCallback(() => {
    if (!apartment) return;
    setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + apartment.images.length) % apartment.images.length : null));
  }, [apartment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, nextImage, prevImage]);

  useEffect(() => {
    if (activeImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeImageIndex]);

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

  useEffect(() => {
    if (!apartmentId) return;

    // Fetch reviews in real-time
    const q = query(
      collection(db, 'apartments', apartmentId, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `apartments/${apartmentId}/reviews`);
    });

    return () => unsubscribe();
  }, [apartmentId]);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !apartmentId) {
        setCanReview(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'bookings'),
          where('apartmentId', '==', apartmentId),
          where('guestUid', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const now = new Date();
        
        // Eligible if has at least one confirmed booking that has ended
        const hasCompletedStay = snapshot.docs.some(doc => {
          const booking = doc.data();
          const endDate = new Date(booking.endDate);
          return booking.status === 'confirmed' && endDate < now;
        });

        setCanReview(hasCompletedStay);
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    };

    checkEligibility();
  }, [user, apartmentId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !apartmentId || !canReview) return;

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'apartments', apartmentId, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
      });
      setReviewForm({ rating: 5, comment: '' });
      setCanReview(false); // Only one review for now or just hide form after success
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `apartments/${apartmentId}/reviews`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment || !apartmentId) return;

    if (days <= 0) {
      alert("End date must be after start date");
      return;
    }

    setIsBooking(true);
    try {
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        apartmentId,
        apartmentName: apartment.name,
        guestUid: user?.uid || null,
        ...formData,
        totalPrice: total,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
      });

      // Send confirmation email via backend
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.guestEmail,
            guestName: formData.guestName,
            apartmentName: apartment.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalPrice: total.toFixed(2),
          }),
        });
      } catch (emailError) {
        console.error("Failed to trigger confirmation email:", emailError);
      }

      // If card payment, redirect to Stripe
      if (formData.paymentMethod === 'card') {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId: bookingRef.id,
              apartmentName: apartment.name,
              totalPrice: total,
            }),
          });
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to create checkout session");
          }

          const session = await response.json();
          if (session.url) {
            window.location.href = session.url;
            return;
          }
        } catch (stripeError) {
          console.error("Stripe Checkout error:", stripeError);
          alert("Unable to initiate online payment. Your booking is saved as pending.");
        }
      }

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
          <div 
            className={`group relative mb-20 overflow-hidden rounded-[3rem] shadow-premium cursor-zoom-in ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}
            onClick={() => setActiveImageIndex(0)}
          >
            <img
              src={apartment.images[0] || 'https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=2000'}
              alt={apartment.name}
              className="h-[600px] w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-12 left-12 z-10 scale-125 origin-top-left">
              <FavoriteButton apartmentId={apartment.id} />
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-full text-white border border-white/30">
                <Maximize2 className="h-8 w-8" />
              </div>
            </div>
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

            {apartment.images.length > 1 && (
              <div className="mt-24">
                <h2 className={`premium-label mb-12`}>Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {apartment.images.slice(1).map((img, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      onClick={() => setActiveImageIndex(i + 1)}
                      className={`group relative overflow-hidden rounded-[3rem] shadow-premium cursor-zoom-in ${isDark ? 'bg-white/5' : 'bg-neutral-100'}`}
                    >
                      <img 
                        src={img} 
                        alt={`${apartment.name} gallery ${i + 1}`} 
                        className="h-80 w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white border border-white/20">
                          <Maximize2 className="h-5 w-5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Cancellation Policy Section */}
            <div className="mt-32">
              <h2 className={`premium-label mb-12`}>{t('details.cancellation_policy')}</h2>
              <div className={`rounded-[3rem] p-12 mb-12 border shadow-premium transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-neutral-50 border-neutral-100'}`}>
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <ShieldAlert className="h-5 w-5 text-gold-600" />
                      <h3 className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('details.cancellation_policy')}</h3>
                    </div>
                    <p className={`text-lg font-light leading-relaxed mb-10 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {t('details.cancellation_desc')}
                    </p>
                  </div>
                  
                  <div className={`w-px hidden md:block ${isDark ? 'bg-white/10' : 'bg-neutral-200'}`} />

                  <div className="flex-1">
                    <h4 className="premium-label !text-[10px] mb-8 !opacity-40">{t('details.cancellation_rules_title')}</h4>
                    <ul className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <li key={i} className="flex items-start gap-4">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {t(`details.cancellation_rule_${i}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-32">
              <h2 className={`premium-label mb-12`}>Guest Reviews</h2>
              
              {canReview && (
                <div className={`mb-16 rounded-[3rem] p-12 shadow-premium border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-neutral-50 border-neutral-100'}`}>
                  <h3 className={`text-2xl font-serif italic mb-8 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Share Your Experience</h3>
                  <form onSubmit={submitReview} className="space-y-8">
                    <div className="space-y-4">
                      <label className="premium-label !text-[10px] !opacity-40">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`p-2 transition-all ${reviewForm.rating >= star ? 'text-gold-500 scale-110' : 'text-neutral-300 opacity-30 hover:opacity-100'}`}
                          >
                            <Star className={`h-8 w-8 ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="premium-label !text-[10px] !opacity-40">Your Review</label>
                      <textarea
                        required
                        placeholder="TELL US ABOUT YOUR STAY..."
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className={`w-full bg-transparent border-b py-3 text-[10px] font-black tracking-widest outline-none transition-all ${isDark ? 'border-white/10 text-white focus:border-gold-500' : 'border-neutral-200 text-neutral-900 focus:border-gold-600'}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="luxury-button !py-4 px-12 bg-neutral-900 text-white border-none hover:bg-gold-600 disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-12">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`pb-12 border-b ${isDark ? 'border-white/5' : 'border-neutral-100'}`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-xs ${isDark ? 'bg-white/5 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-neutral-900'}`}>{review.userName}</h4>
                            <div className="flex gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-gold-500 fill-current' : 'text-neutral-300 opacity-30'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="premium-label !text-[9px] !opacity-30">
                          {review.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                        </span>
                      </div>
                      <p className={`text-lg font-light leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{review.comment}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className={`py-12 text-center rounded-[3rem] border border-dashed ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
                    <p className="premium-label !opacity-30">No reviews yet. Be the first to share your experience.</p>
                  </div>
                )}
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
                className="luxury-button w-full bg-neutral-900 text-white border-none hover:bg-gold-600 mb-10"
              >
                {t('booking.another')}
              </button>

              {apartment.lat && apartment.lng && (
                <div className="mt-6">
                  <p className="premium-label !text-[10px] !opacity-40 mb-6 text-left">Residence Location</p>
                  <MapComponent 
                    apartments={[apartment]} 
                    height="200px" 
                    zoom={15} 
                  />
                </div>
              )}
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
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
          >
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-gold-500 hover:text-black transition-all duration-300"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-10 z-[110] flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm text-white/50 hover:text-gold-500 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8 md:h-12 md:w-12" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-10 z-[110] flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm text-white/50 hover:text-gold-500 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8 md:h-12 md:w-12" />
            </button>

            <div 
              className="relative w-full max-w-6xl h-full md:h-[85vh] px-4 md:px-0 flex items-center justify-center"
              onClick={() => setActiveImageIndex(null)}
            >
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: "spring", damping: 30, stiffness: 100 }}
                src={apartment.images[activeImageIndex]}
                alt={apartment.name}
                className="max-w-full max-h-full object-contain rounded-2xl md:rounded-[2rem] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                <span className="premium-label text-gold-500 !text-xs font-black tracking-[0.2em]">
                  {activeImageIndex + 1} <span className="opacity-40 mx-2">/</span> {apartment.images.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
