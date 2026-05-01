import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const bookingId = searchParams.get('booking_id');

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center"
      >
        <div className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
          <XCircle className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif italic mb-6">Payment Cancelled</h1>
        <p className={`mb-12 text-lg font-light leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Your payment was not completed, and your reservation is not yet secured. You can try again or check your existing bookings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="luxury-button flex-1 flex items-center justify-center gap-3 bg-neutral-900 text-white border-none hover:bg-gold-600"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            to="/manage-bookings"
            className={`luxury-button flex-1 flex items-center justify-center gap-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-50 border-neutral-100 text-neutral-900'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            My Bookings
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
