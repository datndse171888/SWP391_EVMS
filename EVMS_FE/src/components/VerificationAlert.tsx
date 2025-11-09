import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const VerificationAlert: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 

  // Chỉ hiển thị nếu user đã login và chưa verify
  if (!user || user.isVerified) {
    return null; // Không hiển thị gì
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 fixed top-20 right-4 z-50 rounded-lg shadow-lg max-w-md animate-slide-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700 font-medium">
            Tài khoản của bạn chưa được xác thực. Vui lòng xác thực để sử dụng đầy đủ tính năng.
          </p>
          <div className="mt-3">
            <button
              onClick={() => navigate('/verify-otp')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
            >
              Xác thực ngay
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VerificationAlert;

