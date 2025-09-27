import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Login } from './pages/authentication/Login'
import Home from './pages/Home'
import { Layout } from './components/common/layout/Layout'
import { 
  AdminRoute, 
  StaffRoute, 
  TechnicianRoute, 
  CustomerRoute
} from './components/auth/ProtectedRoute'
import { 
  AdminLayout, 
  StaffLayout, 
  TechnicianLayout, 
  CustomerLayout 
} from './components/layout'

// Placeholder components for different dashboards
const AdminDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1></div>;
const StaffDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Staff Dashboard</h1></div>;
const TechnicianDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Technician Dashboard</h1></div>;
const CustomerDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Customer Dashboard</h1></div>;
const Unauthorized = () => <div className="p-6"><h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1></div>;
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { Technicians } from './pages/admin/Technicians'

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />

        {/* Staff Routes */}
        <Route path="/staff/*" element={
          <StaffRoute>
            <StaffLayout>
              <Routes>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
              </Routes>
            </StaffLayout>
          </StaffRoute>
        } />

        {/* Technician Routes */}
        <Route path="/technician/*" element={
          <TechnicianRoute>
            <TechnicianLayout>
              <Routes>
                <Route path="dashboard" element={<TechnicianDashboard />} />
                <Route path="*" element={<Navigate to="/technician/dashboard" replace />} />
              </Routes>
            </TechnicianLayout>
          </TechnicianRoute>
        } />

        {/* Customer Routes */}
        <Route path="/customer/*" element={
          <CustomerRoute>
            <CustomerLayout>
              <Routes>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
              </Routes>
            </CustomerLayout>
          </CustomerRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/technicians" element={<Technicians />} />
      </Routes>
    </BrowserRouter>
  )
}