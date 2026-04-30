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
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
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
      className={`mx-auto max-w-7xl px-8 pt-48 pb-24 transition-colors duration-500`}
    >
      <header className="mb-20 flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
        <div>
          <span className="premium-label tracking-[0.4em] mb-4 block">Executive Portal</span>
          <h1 className={`text-4xl italic font-serif tracking-tight lg:text-6xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('admin.dashboard_title')}</h1>
          <p className="mt-4 text-neutral-500 font-light tracking-wide">
            Welcome, {user?.displayName || 'Administrator'} 
            <span className="ml-4 premium-label !text-[8px] !opacity-40">
              {profile?.role.replace('_', ' ')}
            </span>
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-4">
            <button 
              onClick={generateDemoData}
              disabled={isGenerating}
              className="luxury-button"
            >
              <Play className="h-3 w-3" />
              {isGenerating ? t('booking.processing') : 'Seed Portfolio'}
            </button>
            <button 
              onClick={clearAllData}
              className="luxury-button border-red-100 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-3 w-3" />
              Purge All
            </button>
          </div>
        )}
      </header>

      {/* Secondary Navbar */}
      <div className="mb-16 flex flex-wrap items-center justify-between gap-8 border-b border-neutral-100 pb-8">
        <div className="flex flex-wrap items-center gap-10">
          {[
            { icon: <LayoutDashboard className="h-3.5 w-3.5" />, label: "Overview", active: true },
            { icon: <CalendarCheck className="h-3.5 w-3.5" />, label: t('nav.bookings'), to: "/admin/bookings" },
            { icon: <Hotel className="h-3.5 w-3.5" />, label: t('common.apartment'), to: "/admin/apartments" },
            isSuperAdmin ? { icon: <Users className="h-3.5 w-3.5" />, label: "User Access", to: "/admin/users" } : null,
          ].map((item, i) => item && (
            <Link 
              key={i}
              to={item.to || '#'}
              className={`premium-label hover:text-gold-600 transition-colors relative group ${item.active ? 'text-gold-600' : 'text-neutral-400'}`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.active && <span className="absolute -bottom-8 left-0 h-[2px] w-full bg-gold-600" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Residences", value: stats.apartments, trend: "Stable" },
          { label: "Bookings", value: stats.bookings, trend: "Growth" },
          { label: "Revenue", value: `$${stats.bookings * 150}`, trend: "Projected" },
          { label: "Audience", value: "1.2k", trend: "Active" },
        ].map((stat, i) => (
          <div key={i} className="bento-card p-10">
            <div className="premium-label !opacity-40 mb-6">{stat.label}</div>
            <div className="text-5xl italic font-serif text-neutral-900 mb-4">{stat.value}</div>
            <div className="premium-label !text-[8px] text-emerald-600">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-12 md:grid-cols-2">
        <Link 
          to="/admin/apartments" 
          className="bento-card group p-12 hover:bg-gold-50"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <Hotel className="h-8 w-8 text-gold-600 mb-10 transition-transform group-hover:scale-110" />
              <h2 className="text-3xl italic font-serif text-neutral-900 mb-4">{t('admin.manage_apartments')}</h2>
              <p className="text-neutral-500 font-light tracking-wide">{t('admin.manage_apts_sub')}</p>
            </div>
            <div className="mt-12">
              <span className="luxury-button group-hover:bg-neutral-900 group-hover:text-white">Enter collection</span>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/bookings" 
          className="bento-card group p-12 hover:bg-gold-50"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <CalendarCheck className="h-8 w-8 text-gold-600 mb-10 transition-transform group-hover:scale-110" />
              <h2 className="text-3xl italic font-serif text-neutral-900 mb-4">{t('admin.review_bookings')}</h2>
              <p className="text-neutral-500 font-light tracking-wide">{t('admin.review_bookings_sub')}</p>
            </div>
            <div className="mt-12">
              <span className="luxury-button group-hover:bg-neutral-900 group-hover:text-white">Review requests</span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
