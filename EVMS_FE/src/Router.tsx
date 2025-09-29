import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Login } from './pages/authentication/Login'
import Home from './pages/public/Home'
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
  TechnicianLayout
} from './components/common/layout'
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { Technicians } from './pages/admin/Technicians'
import Introduction from './pages/public/Introduction'
import { Register } from './pages/authentication/Register'
import { Test } from './Test'


// Placeholder components for different dashboards
const StaffDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Staff Dashboard</h1></div>;
const TechnicianDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Technician Dashboard</h1></div>;
const CustomerDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Customer Dashboard</h1></div>;
const Unauthorized = () => <div className="p-6"><h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1></div>;


export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/introduction" element={<Introduction />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/test" element={<Test />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/technicians" element={
          <AdminRoute>
            <AdminLayout>
              <Technicians />
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

        {/* Customer Routes - Using regular Layout */}
        <Route path="/customer" element={
          <CustomerRoute>
            <Layout />
          </CustomerRoute>
        }>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}