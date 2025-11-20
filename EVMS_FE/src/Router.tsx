import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Login } from './pages/auth/Login'
import Home from './pages/Home'
import { Layout } from './components/layout/Layout'
import {
  AdminRoute,
  StaffRoute,
  TechnicianRoute,
  CustomerRoute,
  PrivateRoute
} from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { StaffLayout } from './components/layout/StaffLayout'
import { TechnicianLayout } from './components/layout/TechnicianLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Revenue } from './pages/admin/Revenue'
import { Users } from './pages/admin/Users'
import { Technicians } from './pages/admin/Technicians'
import { Services } from './pages/admin/Services'
import { Parts as AdminParts } from './pages/admin/Parts'
import About from './pages/About'
import { Register } from './pages/auth/Register'
import { Test } from './Test'
import Service from './pages/service/Service'
import { ResetPassword } from './pages/auth/ResetPassword'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import StaffDashboard from './pages/staff/StaffDashboard';
import { BikeService } from './pages/service/BikeService';
import { CarService } from './pages/service/CarService';
import { MotoService } from './pages/service/MotoService';
import ChatWithCustomer from './pages/staff/ChatWithCustomer';
import ManageAppointment from './pages/staff/ManageAppointment';
import ManagePart from './pages/staff/ManagePart';
import StaffProfile from './pages/staff/StaffProfile';

import BookingPage from './pages/staff/BookingPage';
import Booking from './pages/booking/Booking'
import PartsPage from './pages/Parts'
import PartDetail from './pages/PartDetail'
import TechniciansPage from './pages/Technicians'
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianSchedule from './pages/technician/TechnicianSchedule';
import AppointmentWorkspace from './pages/technician/AppointmentWorkspace';
import TechnicianProfile from './pages/technician/TechnicianProfile';
import Profile from './pages/user/Profile';
import AdminProfile from './pages/admin/AdminProfile';
import ServicePackages from './pages/admin/ServicePackages';
import Appointments from './pages/admin/Appointments';
import Staffs from './pages/admin/Staffs';
import FeedbackPage from './pages/user/FeedBack';
import AppointmentHistory from './pages/user/AppointmentHistory';
import Maintenance from './pages/user/Maintenance';
import MyVehicles from './pages/user/MyVehicles';
import AddVehicle from './pages/user/AddVehicle';
import PaymentCallback from './pages/payment/PaymentCallback';
import ButtonRegister from './components/ButtonRegister';
import ChatboxButton from './components/ui/ChatboxButton'
import Introduction from './pages/Introduction'
import Contact from './pages/Contact'
import AboutUs from './pages/AboutUs'
import PartsExplore from './pages/PartsExplore'
import ProcessGuide from './pages/ProcessGuide'

// Placeholder components for different dashboards
const CustomerDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Customer Dashboard</h1></div>;
const Unauthorized = () => <div className="p-6"><h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1></div>;


export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<><Home /> <ChatboxButton /> <ButtonRegister /> </>} />
          <Route path="/about" element={<><About /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/introduction" element={<><Introduction /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/contact" element={<><Contact /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/about-us" element={<><AboutUs /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/parts-explore" element={<><PartsExplore /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/process-guide" element={<><ProcessGuide /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/service" element={<><Service /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/carService" element={<><CarService /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/bikeService" element={<><BikeService /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/motoService" element={<><MotoService /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/parts" element={<><PartsPage /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/part/:id" element={<><PartDetail /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path="/technicians" element={<><TechniciansPage /> <ChatboxButton /> <ButtonRegister /></>} />
          <Route path='/booking' element={<><Booking /> <ChatboxButton /> </>} />
          <Route path="/feedback" element={<><FeedbackPage /> <ChatboxButton /> </>} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/test" element={<Test />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/maintenance" element={
          <PrivateRoute>
            <Maintenance />
          </PrivateRoute>
        } />
        <Route path="/appointment-history" element={
          <PrivateRoute>
            <AppointmentHistory />
          </PrivateRoute>
        } />
        <Route path="/my-vehicles" element={
          <PrivateRoute>
            <MyVehicles />
          </PrivateRoute>
        } />
        <Route path="/add-vehicle" element={
          <PrivateRoute>
            <AddVehicle />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/revenue" element={
          <AdminRoute>
            <AdminLayout>
              <Revenue />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/parts" element={
          <AdminRoute>
            <AdminLayout>
              <AdminParts />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/services" element={
          <AdminRoute>
            <AdminLayout>
              <Services />
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
        <Route path="/admin/profile" element={
          <AdminRoute>
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/service-packages" element={
          <AdminRoute>
            <AdminLayout>
              <ServicePackages />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/appointments" element={
          <AdminRoute>
            <AdminLayout>
              <Appointments />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/staffs" element={
          <AdminRoute>
            <AdminLayout>
              <Staffs />
            </AdminLayout>
          </AdminRoute>
        } />

        {/* Staff Routes */}
        <Route path="/staff/*" element={
          <StaffRoute>
            <StaffLayout>
              <Routes>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="customers" element={<ChatWithCustomer />} />
                <Route path="appointments" element={<ManageAppointment />} />
                <Route path="parts" element={<ManagePart />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="profile" element={<StaffProfile />} />
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
                <Route path="schedule" element={<TechnicianSchedule />} />
                <Route path="profile" element={<TechnicianProfile />} />
                <Route path="appointments/:appointmentId" element={<AppointmentWorkspace />} />
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