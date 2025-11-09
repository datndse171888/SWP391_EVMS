import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import VerificationAlert from '../VerificationAlert'

export const Layout = () => {
  return (
    <>
        <Header />
        <VerificationAlert />
        <Outlet />
        <Footer />
    </>
  )
}
