import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Home, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingId) {
        setVerifying(false);
        setStatus('error');
        return;
      }

      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, bookingId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'paid') {
            setStatus('success');
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId]);

  if (verifying) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
        <div className="text-center">
          <div className="mb-8 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <h1 className="text-2xl font-serif italic mb-2 tracking-widest uppercase">Verifying Payment</h1>
          <p className="premium-label !opacity-40">Please wait while we confirm your reservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center"
      >
        {status === 'success' ? (
          <>
            <div className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-gold-500/10 text-gold-500' : 'bg-gold-50 text-gold-600'}`}>
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6">Payment Confirmed</h1>
            <p className={`mb-12 text-lg font-light leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Your reservation at Inkindi Residences has been secured. We've sent a confirmation email with all the details for your upcoming stay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="luxury-button flex-1 flex items-center justify-center gap-3 bg-neutral-900 text-white border-none hover:bg-gold-600"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Link>
              <Link
                to="/manage-bookings"
                className={`luxury-button flex-1 flex items-center justify-center gap-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-50 border-neutral-100 text-neutral-900'}`}
              >
                <Calendar className="h-4 w-4" />
                My Bookings
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
              <span className="text-4xl font-black">!</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6">Payment Verification Pending</h1>
            <p className={`mb-12 text-lg font-light leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              We're having trouble confirming your payment. Don't worry—if you've been charged, your booking will be updated automatically soon.
            </p>
            <Link
              to="/manage-bookings"
              className="luxury-button w-full flex items-center justify-center gap-3 bg-neutral-900 text-white border-none hover:bg-gold-600"
            >
              Check Booking Status
              <ArrowRight className="h-4 w-4 text-gold-500" />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
