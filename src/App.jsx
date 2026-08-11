import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';

// Higher Order Component to protect admin routes
function RequireAuth({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Dashboard - No Admin privileges */}
        <Route path="/slides" element={<Dashboard isAdmin={false} />} />
        
        {/* Admin Login */}
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Protected Admin Dashboard - Has Admin privileges */}
        <Route 
          path="/admin" 
          element={
            <RequireAuth>
              <Dashboard isAdmin={true} />
            </RequireAuth>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
