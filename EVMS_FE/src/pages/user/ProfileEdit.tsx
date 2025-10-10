import { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import type { Profile } from '../../types/account/Account';

interface ProfileEditProps {
  profile: Profile;
  onSave: (updatedProfile: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileEdit({ profile, onSave, onCancel }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phoneNumber: profile.phoneNumber || '',
    photoURL: profile.photoURL || '',
    userName: profile.userName || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-orange-50 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 h-20"></div>

      <form onSubmit={handleSubmit} className="px-6 pb-6">
        <div className="relative -mt-16 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-blue-100 bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>

            <div className="flex-1 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 italic mt-1">You can't edit this field</p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đầy đủ
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                 Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatar_url"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex mx-80 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mx-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
