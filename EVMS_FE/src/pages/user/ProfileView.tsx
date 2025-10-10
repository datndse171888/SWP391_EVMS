// @ts-ignore
import { User, Mail, Phone, Calendar, CalendarDays, LogOut } from 'lucide-react';
import type { Profile } from '../../types/Account';

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
  onViewAppointments: () => void;
  onLogout: () => void;
}

export default function ProfileView({ profile, onEdit, onViewAppointments, onLogout }: ProfileViewProps) {
  return (
    <div className="bg-orange-50 rounded-lg shadow-md overflow-hidden ">
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 h-20"></div>

      <div className="px-6 pb-6"></div>
      <div className="flex gap-6 items-start -mt-16 px-10">
        <div className="w-60 h-60 rounded-full border-4 border-blue-100 bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.userName || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}

        </div>

        <div className="flex-1 mt-16 space-y-6">
            <div className="flex gap-6" >
            <div className="flex-1 space-y-2 pt-4 border-t ps-10">
              <h2 className="font-semibold text-gray-900 uppercase tracking-wide">Thông tin cá nhân</h2>

              <div className="flex items-center gap-3 text-gray-700 text-lg">
              <User className="w-5 h-5 text-gray-400" />
              <span>{profile.userName}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{profile.email}</span>
              </div>

              {profile.phoneNumber && (
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-center gap-3 text-gray-700 text-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{profile.gender}</span>
                </div>
              )}

              {profile.fullName && (
                <div className="flex items-center gap-3 text-gray-700 text-lg mb-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{profile.fullName}</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 pt-4 border-t">

              <button
                onClick={onEdit}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
               Chỉnh sửa hồ sơ
              </button>

              <button
                onClick={onViewAppointments}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CalendarDays className="w-5 h-5" />
                Xem lịch hẹn
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium mb-5"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
