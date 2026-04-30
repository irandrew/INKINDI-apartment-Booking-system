import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Booking } from '../types';
import { Check, X, Mail, Phone, Calendar, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ManageBookings({ id }: { id?: string }) {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/admin');
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      fetchBookings();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
      fetchBookings();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: 'paid' | 'unpaid') => {
    try {
      await updateDoc(doc(db, 'bookings', id), { paymentStatus });
      fetchBookings();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'refunded': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (authLoading || loading) return null;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8"
    >
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900">{t('admin.bookings_title')}</h1>
        <p className="text-neutral-500">{t('admin.bookings_sub')}</p>
      </div>

      <div className="space-y-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-6 md:flex-row">
                <div className="flex-1">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-neutral-900">{booking.guestName}</h3>
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getPaymentColor(booking.paymentStatus || 'unpaid')}`}>
                      {t(`booking.${booking.paymentStatus || 'unpaid'}`)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                      {booking.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-neutral-400" />
                      {booking.guestEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      {booking.guestPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      {booking.startDate} {t('details.back').split(' ')[1]} {booking.endDate}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-neutral-900">
                      {t('common.apartment')}: {booking.apartmentName || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('admin.total_price')}</div>
                    <div className="text-2xl font-extrabold text-neutral-900">${booking.totalPrice?.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex flex-wrap justify-end gap-2">
                    {booking.paymentStatus !== 'paid' && (
                      <button 
                        onClick={() => updatePaymentStatus(booking.id, 'paid')}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-gold-600 text-white hover:bg-gold-500 shadow-lg shadow-gold-100"
                        title="Mark as Paid"
                      >
                        Mark Paid
                      </button>
                    )}
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-500"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-100 hover:bg-red-500"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {isSuperAdmin && (
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 py-24 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
            <h3 className="text-lg font-bold text-neutral-900">{t('admin.no_bookings')}</h3>
            <p className="text-neutral-500">{t('admin.no_bookings_msg')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
