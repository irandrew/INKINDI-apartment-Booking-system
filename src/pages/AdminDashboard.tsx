import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Hotel, CalendarCheck, Users, TrendingUp, Trash2,
  Play, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, MapPin, Clock, ArrowRight,
  PieChart as PieChartIcon, BarChart3
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameDay, isToday, addMonths, subMonths,
  parseISO, isWithinInterval, subDays
} from 'date-fns';
import { Booking } from '../types';
import { Skeleton } from '../components/LoadingComponents';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function AdminDashboard({ id }: { id?: string }) {
  const { user, profile, loading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  
  const [stats, setStats] = useState({ apartments: 0, bookings: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Chart Data Processing
  const chartData = useMemo(() => {
    if (!bookings.length) return [];
    
    // Last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM'),
        monthFull: format(date, 'yyyy-MM'),
        bookings: 0,
        revenue: 0
      };
    }).reverse();

    bookings.forEach(b => {
      const bDate = parseISO(b.startDate);
      const bMonth = format(bDate, 'yyyy-MM');
      const monthObj = last6Months.find(m => m.monthFull === bMonth);
      if (monthObj) {
        monthObj.bookings += 1;
        monthObj.revenue += b.totalPrice || 0;
      }
    });

    return last6Months;
  }, [bookings]);

  const statusData = useMemo(() => {
    const statuses = {
      confirmed: { name: 'Confirmed', value: 0, color: '#10b981' },
      pending: { name: 'Pending', value: 0, color: '#f59e0b' },
      cancelled: { name: 'Cancelled', value: 0, color: '#ef4444' }
    };

    bookings.forEach(b => {
      if (statuses[b.status as keyof typeof statuses]) {
        statuses[b.status as keyof typeof statuses].value += 1;
      }
    });

    return Object.values(statuses);
  }, [bookings]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const [aptsSnapshot, bksSnapshot] = await Promise.all([
        getDocs(collection(db, 'apartments')),
        getDocs(collection(db, 'bookings'))
      ]);
      
      const bksData = bksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
      setBookings(bksData);
      setStats({ apartments: aptsSnapshot.size, bookings: bksSnapshot.size });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const selectedDayBookings = useMemo(() => {
    return getBookingsForDate(selectedDate);
  }, [selectedDate, bookings]);

  const generateDemoData = async () => {
    setIsGenerating(true);
    try {
      const apartments = [
        {
          name: "The Gilded Crown Penthouse",
          description: "An architectural masterpiece perched above the city. Featuring 20-foot ceilings, a private glass-bottom pool, and 360-degree views of the skyline. Curated with bespoke Italian furniture and rare marble finishes.",
          pricePerNight: 1250,
          location: "Kigali Heights",
          capacity: 6,
          amenities: ["Private Pool", "Butler Service", "Wine Cellar", "Helipad Access", "Smart Home System"],
          images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000"],
          lat: -1.9485,
          lng: 30.0910,
          cancellationPolicy: "Full refund if cancelled up to 5 days before check-in."
        },
        {
          name: "Emerald Valley Villa",
          description: "Nestled within the lush greenery, this villa offers absolute privacy and serenity. A seamless blend of indoor and outdoor living with a private infinity garden and outdoor rain showers.",
          pricePerNight: 850,
          location: "Nyaba District",
          capacity: 4,
          amenities: ["Private Garden", "Infinity Pool", "Yoga Shala", "Chef on Demand"],
          images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000"],
          lat: -1.9750,
          lng: 30.0450,
          cancellationPolicy: "Strict: No refunds, but guests may reschedule once with 14 days notice."
        },
        {
          name: "Onyx Modernist Studio",
          description: "A sanctuary for the modern minimalist. This dark-themed studio features architectural concrete walls, integrated lighting, and a curated selection of avant-garde art.",
          pricePerNight: 450,
          location: "Kacyiru North",
          capacity: 2,
          amenities: ["Design Concierge", "Integrated Tech", "Bespoke Gym", "Private Gallery"],
          images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=2000"],
          lat: -1.9400,
          lng: 30.0750,
          cancellationPolicy: "Flexible: Full refund if cancelled 24 hours before check-in."
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
      className={`mx-auto max-w-7xl px-8 pt-12 pb-24 transition-colors duration-500`}
    >
      <header className="mb-20 flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
        <div>
          <span className="premium-label tracking-[0.4em] mb-4 block">Executive Portal</span>
          <h1 className={`text-5xl italic font-serif tracking-tight lg:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t('admin.dashboard_title')}</h1>
          <p className="mt-4 text-neutral-500 font-light tracking-wide lg:text-lg">
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
              className="luxury-button border-red-100 text-red-600 hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
            >
              <Trash2 className="h-3 w-3" />
              Purge All
            </button>
          </div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="mb-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Residences", value: stats.apartments, trend: "Stable" },
          { label: "Bookings", value: stats.bookings, trend: "Growth" },
          { label: "Revenue", value: `$${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}`, trend: "Projected" },
          { label: "Audience", value: "1.2k", trend: "Active" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bento-card p-10 group hover:border-gold-500/30 transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-neutral-100'}`}
          >
            {dashboardLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/2 rounded-full" />
                <Skeleton className="h-12 w-3/4 rounded-xl" />
                <Skeleton className="h-3 w-1/4 rounded-full" />
              </div>
            ) : (
              <>
                <div className={`premium-label !opacity-40 mb-6 group-hover:!opacity-100 group-hover:text-gold-600 transition-all ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>{stat.label}</div>
                <div className={`text-6xl italic font-serif mb-4 group-hover:scale-110 origin-left transition-transform duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{stat.value}</div>
                <div className="premium-label !text-[8px] text-emerald-600 flex items-center gap-2">
                  <TrendingUp className="h-2 w-2" />
                  {stat.trend}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="mb-32 grid gap-12 lg:grid-cols-3">
        <div className={`lg:col-span-2 bento-card p-10 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-neutral-100'}`}>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-serif italic mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Revenue Performance</h2>
              <p className="premium-label !text-[8px] !opacity-40">Monthly Earnings Overview</p>
            </div>
            <BarChart3 className="h-5 w-5 text-gold-600 opacity-30" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#666' : '#999' }} 
                  dy={10}
                />
                <YAxis 
                  hide={true} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#000' : '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}
                  cursor={{ stroke: '#d4af37', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`bento-card p-10 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-neutral-100'}`}>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-serif italic mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Status mix</h2>
              <p className="premium-label !text-[8px] !opacity-40">Booking Distribution</p>
            </div>
            <PieChartIcon className="h-5 w-5 text-gold-600 opacity-30" />
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#000' : '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    padding: '12px 16px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{item.name}</span>
                </div>
                <span className={`text-sm font-serif italic ${isDark ? 'text-white' : 'text-neutral-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-20 lg:grid-cols-3">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl italic font-serif text-neutral-900 mb-2">Booking Calendar</h2>
              <p className="premium-label !text-[8px] !opacity-40">Interactive Availability Schedule</p>
            </div>
            <div className="flex items-center gap-4 bg-neutral-100 p-2 rounded-full ring-1 ring-neutral-200">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-full transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-black uppercase tracking-widest px-4">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-full transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bento-card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dayBookings = getBookingsForDate(day);
                const hasBookings = dayBookings.length > 0;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSel = isSameDay(day, selectedDate);

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDate(day)}
                    className={`relative min-h-[120px] p-4 text-left border-r border-b border-neutral-50 transition-all
                      ${!isCurrentMonth ? 'bg-neutral-50/20 text-neutral-300' : 'text-neutral-900'}
                      ${isSel ? 'bg-gold-50/50 ring-2 ring-inset ring-gold-200 z-10' : 'hover:bg-neutral-50'}
                    `}
                  >
                    <span className={`text-xs font-black tracking-widest ${isToday(day) ? 'bg-neutral-900 text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {hasBookings && (
                      <div className="mt-4 space-y-1">
                        {dayBookings.slice(0, 2).map((b, bi) => (
                           <div 
                            key={bi} 
                            className={`h-1.5 rounded-full w-full ${b.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            title={b.apartmentName}
                          />
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[8px] font-bold text-neutral-400">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl italic font-serif text-neutral-900 mb-8">Schedule Details</h2>
            <div className="bento-card p-10 bg-neutral-950 text-white border-none shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-gold-500" />
                </div>
                <div>
                  <span className="premium-label !text-[10px] text-white/40 block">Agenda for</span>
                  <span className="text-xl font-serif italic">{format(selectedDate, 'MMMM d, yyyy')}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {dashboardLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-3 w-1/3 rounded-full opacity-20" />
                        <Skeleton className="h-6 w-full rounded-xl opacity-20" />
                      </div>
                    ))}
                  </div>
                ) : selectedDayBookings.length > 0 ? (
                  selectedDayBookings.map((booking) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-white/10 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{booking.guestName}</span>
                        <div className={`h-2 w-2 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'}`} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                          <Hotel className="h-3 w-3" />
                          {booking.apartmentName}
                        </div>
                        <div className="flex items-center gap-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                          <Clock className="h-3 w-3" />
                          {booking.startDate} to {booking.endDate}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-30">
                    <Clock className="h-10 w-10 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Engagements</p>
                  </div>
                )}
              </div>

              {selectedDayBookings.length > 0 && (
                <Link 
                  to="/admin/bookings"
                  className="mt-12 group flex items-center justify-between w-full p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">View in Bookings</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <Link 
              to="/admin/apartments"
              className="bento-card p-8 group hover:bg-gold-50"
             >
                <Hotel className="h-6 w-6 text-gold-600 mb-6" />
                <div className="text-sm font-serif italic mb-2">Portfolio</div>
                <div className="premium-label !text-[8px] !opacity-40">Manage Units</div>
             </Link>
             <Link 
              to="/admin/users"
              className="bento-card p-8 group hover:bg-gold-50"
             >
                <Users className="h-6 w-6 text-gold-600 mb-6" />
                <div className="text-sm font-serif italic mb-2">Accounts</div>
                <div className="premium-label !text-[8px] !opacity-40">Access Control</div>
             </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
