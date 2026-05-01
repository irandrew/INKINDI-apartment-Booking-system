import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Apartments from './pages/Apartments';
import ApartmentDetails from './pages/ApartmentDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageApartments from './pages/ManageApartments';
import ManageBookings from './pages/ManageBookings';
import ManageUsers from './pages/ManageUsers';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { theme } = useApp();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900'}`}>
      {!isAdminRoute && <Navbar id="main-navbar" />}
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home id="home-page" />} />
          <Route path="/apartments" element={<Apartments id="apartments-page" />} />
          <Route path="/apartments/:id" element={<ApartmentDetails id="apartment-details-page" />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin id="admin-login-page" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard id="admin-dashboard-page" />} />
          <Route path="/admin/apartments" element={<ManageApartments id="manage-apartments-page" />} />
          <Route path="/admin/bookings" element={<ManageBookings id="manage-bookings-page" />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Routes>
      </AnimatePresence>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </Router>
  );
}
