import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Login } from './pages/authentication/Login'
import Home from './pages/Home'
import { Layout } from './components/common/layout/Layout'

export const Router: React.FC = () => {
  return (
    <BrowserRouter>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>

    </BrowserRouter>
  )
}