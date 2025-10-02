import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from './Router'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
