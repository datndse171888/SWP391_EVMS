import { useState, useEffect } from 'react';
import type { Appointment, Profile } from "../../types/Account";
import { User } from 'lucide-react';
import ProfileView from './ProfileView';
import ProfileEdit from './ProfileEdit';
import AppointmentsList from './AppoitmentList';
import { authApi } from '../../api/AuthApi';

type View = 'profile' | 'edit-profile' | 'appointments';

export default function UserProfile() {
     const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentView, setCurrentView] = useState<View>('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockProfile: Profile = {
      id: 'mock-user-id',
      email: 'user@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1 (555) 123-4567',
      photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
      userName: 'johndoe',
      gender: 'male',
    };

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        user_id: 'mock-user-id',
        title: 'Team Meeting',
        description: 'Quarterly planning and review session with the development team.',
        appointment_date: '2025-10-10T14:00:00Z',
        status: 'scheduled',
        location: 'Conference Room A',
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2025-10-01T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'mock-user-id',
        title: 'Doctor Appointment',
        description: 'Annual checkup and health screening.',
        appointment_date: '2025-10-12T09:30:00Z',
        status: 'scheduled',
        location: 'City Medical Center',
        created_at: '2025-10-02T08:00:00Z',
        updated_at: '2025-10-02T08:00:00Z',
      },
      {
        id: '3',
        user_id: 'mock-user-id',
        title: 'Client Presentation',
        description: 'Present new product features to key stakeholders.',
        appointment_date: '2025-10-08T15:00:00Z',
        status: 'completed',
        location: 'Client Office - Downtown',
        created_at: '2025-09-28T12:00:00Z',
        updated_at: '2025-10-08T16:00:00Z',
      },
    ];

    setProfile(mockProfile);
    setAppointments(mockAppointments);
    setLoading(false);
  };
  const fetchUserProfile = async () => {
    try {
      const response = await authApi.getProfile();

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = response.data;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchUserAppointments = async () => {
    try {
      const response = await fetch('/api/user/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const appointmentsData = await response.json();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    await Promise.all([fetchUserProfile(), fetchUserAppointments()]);
  };

  const handleSaveProfile = async (updatedProfile: Partial<Profile>) => {
    if (!profile) return;

    setProfile({
      ...profile,
      ...updatedProfile,
    });
    setCurrentView('profile');
  };


  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setProfile(null);
      setAppointments([]);
      setCurrentView('profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-orange-100 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back Home
              </button>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500">User Profile</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'profile' || currentView === 'edit-profile'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setCurrentView('appointments')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'appointments'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Appointments
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'profile' && (
          <ProfileView
            profile={profile}
            onEdit={() => setCurrentView('edit-profile')}
            onViewAppointments={() => setCurrentView('appointments')}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'edit-profile' && (
          <ProfileEdit
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setCurrentView('profile')}
          />
        )}

        {currentView === 'appointments' && (
          <AppointmentsList
            appointments={appointments}
          />
        )}
      </main>
    </div>
  );
}