import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
// import DashLayout from './Components/DashLayout';
import DashLayout from './Pages/DashLayout';
import LandingPage from './Pages/Landing';
import AuthPage from './Pages/AuthPage';
import ForgotPassword from './Pages/ForgotPAssword';
import UserDashboard from './Pages/UserDashboard';
import PlaceOrder from './Pages/PlaceOrder';
import { OrdersList, OrderDetail } from './Pages/Order';
import TrackOrder from './Pages/TrackOrder';
import DriverDashboard from './Pages/DriverDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import AdminRevenue from './Pages/AdminRevenue';


function Guard({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--navy)',flexDirection:'column',gap:16 }}>
      <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold),#a07830)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontSize:18 }}>🚛</span>
      </div>
      <div className="spinner" style={{ width:28,height:28 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={user ? <Navigate to={user.role==='admin'?'/admin':user.role==='driver'?'/driver':'/dashboard'} /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="register" />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
       


      {/* User */}
      <Route path="/dashboard" element={<Guard role="user"><DashLayout><UserDashboard /></DashLayout></Guard>} />
      <Route path="/place-order" element={<Guard role="user"><DashLayout><PlaceOrder /></DashLayout></Guard>} />
      <Route path="/orders" element={<Guard role="user"><DashLayout><OrdersList /></DashLayout></Guard>} />
      <Route path="/orders/:id" element={<Guard role="user"><DashLayout><OrderDetail /></DashLayout></Guard>} />
      <Route path="/track" element={<Guard role="user"><DashLayout><TrackOrder /></DashLayout></Guard>} />

      {/* Driver */}
      <Route path="/driver" element={<Guard role="driver"><DashLayout><DriverDashboard /></DashLayout></Guard>} />
      <Route path="/driver/orders" element={<Guard role="driver"><DashLayout><DriverDashboard /></DashLayout></Guard>} />
      <Route path="/driver/map" element={<Guard role="driver"><DashLayout><DriverDashboard /></DashLayout></Guard>} />

      {/* Admin */}
      <Route path="/admin" element={<Guard role="admin"><DashLayout><AdminDashboard /></DashLayout></Guard>} />
      <Route path="/admin/orders" element={<Guard role="admin"><DashLayout><AdminDashboard /></DashLayout></Guard>} />
      <Route path="/admin/drivers" element={<Guard role="admin"><DashLayout><AdminDashboard /></DashLayout></Guard>} />
      <Route path="/admin/users" element={<Guard role="admin"><DashLayout><AdminDashboard /></DashLayout></Guard>} />
      <Route path="/admin/map" element={<Guard role="admin"><DashLayout><AdminDashboard /></DashLayout></Guard>} />
      <Route path="/admin/revenue" element={<Guard role="admin"><DashLayout><AdminRevenue/></DashLayout></Guard>} />



      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration:4500 }} />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}