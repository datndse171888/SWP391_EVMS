import React from 'react'
import { Link } from 'react-router-dom'
import { COLOR } from '../../../constants/color/Color'
import logo from '../../../assets/images/logo.png'

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: COLOR.gray[10] }}>
      <div className="max-w-7xl mx-auto">
        {/* Top Section - 4 Columns */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Services
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: COLOR.yellow[0] }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#ac">AC Charger Services</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#dc">DC Charger Services</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#home">Home Charger</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#drivers">EV Drivers Services</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#points">Charge Point Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Support
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: COLOR.yellow[0] }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#help">Help Center</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#ticket">Ticket Support</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#faq">FAQ</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/contact">Contact Us</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/community">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Company
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: COLOR.yellow[0] }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/about">About Us</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/leadership">Leadership</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/careers">Careers</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/news">News & Article</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/legal">Legal Notice</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Get In Touch
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: COLOR.yellow[0] }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li>Jl. Cempaka Wangi No 22 Jakarta - Indonesia</li>
              <li><a href="mailto:support@yourdomain.tld" className="hover:text-gray-300 transition-colors">support@yourdomain.tld</a></li>
              <li><a href="tel:+622120022012" className="hover:text-gray-300 transition-colors">+6221.2002.2012</a></li>
            </ul>
          </div>
        </div>

        {/* Middle Section - Logo & Newsletter */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="EVRepair Logo" className="w-12 h-12" />
              <span className="text-2xl font-bold text-white">EVRepair</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Signup our newsletter to get update information, news, insight or promotions.
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                className="px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: COLOR.yellow[0] }}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright & Legal */}
        <div className="border-t pt-8" style={{ borderColor: COLOR.gray[8] }}>
          <div className="flex flex-col md:flex-row justify-between items-center text-white text-sm">
            <div>
              Copyright © 2022 EVRepair, All Rights Reserved. Powered By MoxCreative
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Term of use</Link>
              <span>■</span>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <span>■</span>
              <Link to="/cookies" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


