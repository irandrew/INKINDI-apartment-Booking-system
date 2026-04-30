import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Hotel, CalendarCheck, Users, TrendingUp, Settings, Plus, Play, Trash2,
  RefreshCw, MessageSquare, Wallet, Calendar, Key, CheckCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AdminDashboard({ id }: { id?: string }) {
  const { user, profile, loading, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useApp();
  const [stats, setStats] = useState({ apartments: 0, bookings: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apts = await getDocs(collection(db, 'apartments'));
        const bks = await getDocs(collection(db, 'bookings'));
        setStats({ apartments: apts.size, bookings: bks.size });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const generateDemoData = async () => {
    setIsGenerating(true);
    try {
      const apartments = [
        {
          name: "Luxury Penthouse with City View",
          description: "Stunning penthouse in the heart of the city featuring floor-to-ceiling windows, modern kitchen, and a private balcony with panoramic views.",
          pricePerNight: 250,
          location: "Downtown District",
          capacity: 4,
          amenities: ["Wifi", "Kitchen", "Air conditioning", "Pool", "Gym"],
          images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"]
        },
        {
          name: "Cozy Studio near Central Park",
          description: "Elegant and quiet studio perfect for solo travelers or couples. Steps away from the park and best coffee shops.",
          pricePerNight: 120,
          location: "Parksite North",
          capacity: 2,
          amenities: ["Wifi", "Dedicated workspace", "Washer", "Dryer"],
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"]
        },
        {
          name: "Modern Loft with Industrial Vibe",
          description: "High ceilings, brick walls, and industrial-chic decor. This loft offers a unique stay in the trending arts district.",
          pricePerNight: 180,
          location: "Arts District",
          capacity: 3,
          amenities: ["Wifi", "Kitchen", "Self check-in", "Iron"],
          images: ["https://images.unsplash.com/photo-1536376074432-bf63fa47048c?auto=format&fit=crop&q=80&w=800"]
        }
      ];

      const batch = writeBatch(db);
      for (const apt of apartments) {
        const newDoc = doc(collection(db, 'apartments'));
        batch.set(newDoc, apt);
      }
      await batch.commit();
      window.location.reload();
    } catch (error) {
      console.error("Error generating data:", error);
      alert("Failed to generate data.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm(t('admin.confirm_delete'))) return;
    try {
      const apts = await getDocs(collection(db, 'apartments'));
      const bks = await getDocs(collection(db, 'bookings'));
      const batch = writeBatch(db);
      apts.forEach(d => batch.delete(d.ref));
      bks.forEach(d => batch.delete(d.ref));
      await batch.commit();
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  if (loading) return null;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8"
    >
      <header className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 font-display flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            {t('admin.dashboard_title')}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 font-medium">
            Welcome back, {user?.displayName || 'Admin'} 
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
              {profile?.role.replace('_', ' ')}
            </span>
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-3">
            <button 
              onClick={generateDemoData}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              {isGenerating ? t('booking.processing') : 'Generate Demo Data'}
            </button>
            <button 
              onClick={clearAllData}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')} All
            </button>
          </div>
        )}
      </header>

      {/* Secondary Navbar */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex flex-wrap items-center gap-1 sm:gap-6">
          {[
            { icon: <CheckCircle className="h-4 w-4" />, label: "Check-in/out", active: true },
            { icon: <Calendar className="h-4 w-4" />, label: "Calendar", to: "#" },
            { icon: <CalendarCheck className="h-4 w-4" />, label: t('nav.bookings'), to: "/admin/bookings" },
            { icon: <Hotel className="h-4 w-4" />, label: t('common.apartment'), to: "/admin/apartments" },
            isSuperAdmin ? { icon: <Users className="h-4 w-4" />, label: "User Access", to: "/admin/users" } : null,
            { icon: <MessageSquare className="h-4 w-4" />, label: "Messages", to: "#" },
            { icon: <Wallet className="h-4 w-4" />, label: "Expenses", to: "#" },
          ].map((item, i) => item && (
            <Link 
              key={i}
              to={item.to || '#'}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${item.active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'}`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
          <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-neutral-600 hover:bg-neutral-50">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Hotel className="h-6 w-6 text-blue-600" />, label: "Total Apartments", value: stats.apartments, trend: "+2 this month" },
          { icon: <CalendarCheck className="h-6 w-6 text-emerald-600" />, label: "Active Bookings", value: stats.bookings, trend: "+15% from last week" },
          { icon: <TrendingUp className="h-6 w-6 text-purple-600" />, label: "Revenue Est.", value: `$${stats.bookings * 150}`, trend: "Growing" },
          { icon: <Users className="h-6 w-6 text-orange-600" />, label: "Visitors", value: "1.2k", trend: "Normal" },
        ].map((stat, i) => (
          <div key={i} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-neutral-50 p-3">{stat.icon}</div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{stat.trend}</span>
            </div>
            <div className="text-sm font-medium text-neutral-500">{stat.label}</div>
            <div className="text-3xl font-extrabold text-neutral-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        <Link 
          to="/admin/apartments" 
          className="group flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-xl"
        >
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100 transition-transform group-hover:scale-110">
              <Hotel className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900">{t('admin.manage_apartments')}</h2>
            <p className="text-neutral-600 leading-relaxed">{t('admin.manage_apts_sub')}</p>
          </div>
          <div className="mt-8 flex items-center gap-2 font-bold text-blue-600">
            {t('common.view')} <Plus className="h-5 w-5" />
          </div>
        </Link>

        <Link 
          to="/admin/bookings" 
          className="group flex flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-8 transition-all hover:border-emerald-500 hover:shadow-xl"
        >
          <div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">
              <CalendarCheck className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900">{t('admin.review_bookings')}</h2>
            <p className="text-neutral-600 leading-relaxed">{t('admin.review_bookings_sub')}</p>
          </div>
          <div className="mt-8 flex items-center gap-2 font-bold text-emerald-600">
            {t('common.view')} <Plus className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
