// src/components/layout/UserLayout.tsx
import React from 'react';
import carImage from '../../assets/images/car.png';

interface UserProfileLayoutProps {
  children: React.ReactNode;
}

export const UserProfileLayout: React.FC<UserProfileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#DBE8FA] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>

      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-7xl overflow-visible relative min-h-[calc(100vh-2rem)]">
        {children}

        {/* Bottom wave decoration */}
        <div className="w-full h-40 mt-auto relative -mb-0">
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#DBE8FA"
                fillOpacity="1"
                d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            <img
              src={carImage}
              alt="Electric car decoration"
              className="absolute right-6 -bottom-8 w-64 md:w-80 lg:w-96 h-auto opacity-95"
            />
          </div>
        </div>
      </div>
    </div>
  );
};