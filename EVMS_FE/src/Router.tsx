import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Login } from './pages/authentication/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { Technicians } from './pages/admin/Technicians'

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/technicians" element={<Technicians />} />
      </Routes>
    </BrowserRouter>
  )
}