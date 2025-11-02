import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AppointmentApi } from "../../api/AppointmentApi";
import type { Appointment } from "../../types/Account";
import whaleLogo from "../../assets/images/whale.png";

// Module-level variable to prevent duplicate API calls in React StrictMode
let isFetchingAppointments = false;

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prevent duplicate API calls in React StrictMode (development only)
    if (isFetchingAppointments || !authUser?.id) return;
    isFetchingAppointments = true;
    
    let isMounted = true;
    
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await AppointmentApi.getAppointmentByUserId(authUser.id);
        
        if (!isMounted) return;
        
        let appointmentsData: Appointment[] = [];
        
        const data = response.data as unknown;
        
        if (Array.isArray(data)) {
          appointmentsData = data;
        } else if (data && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>;
          if (Array.isArray(dataObj.data)) {
            appointmentsData = dataObj.data;
          } else if (Array.isArray(dataObj.appointment)) {
            appointmentsData = dataObj.appointment;
          } else if (Array.isArray(dataObj.appointments)) {
            appointmentsData = dataObj.appointments;
          }
        }
        
        if (isMounted) {
          setAppointments(appointmentsData);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching appointments:", error);
          setAppointments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        // Reset flag after a short delay to allow StrictMode remount
        setTimeout(() => {
          isFetchingAppointments = false;
        }, 100);
      }
    };
    
    fetchAppointments();
    
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: 'rgba(9, 145, 243, 0.1)', borderColor: '#0991f3', color: '#014091' };
      case "completed":
        return { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e', color: '#15803d' };
      case "cancelled":
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#dc2626' };
      default:
        return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã đặt lịch";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#DBE8FA] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Bóng tròn 2 màu chủ đạo */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>

      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-7xl overflow-visible relative min-h-[calc(100vh-2rem)]">
        {/* Main content container */}
        <div className="flex flex-row w-full">
          {/* Sidebar */}
          <div className="w-64 py-10 px-6 bg-[#f7fafd] min-h-full">
            {/* Nút quay về trang chủ */}
            <Link
              to="/"
              className="inline-flex items-center font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm mb-4 transition-colors"
              style={{ color: '#014091', border: '1px solid #e3f2fd' }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Trang chủ
            </Link>
            <nav className="flex flex-col gap-2">
              <Link
                to="/profile"
                className="text-left px-4 py-3 rounded-lg font-medium transition-colors text-gray-600 hover:bg-opacity-10"
                style={{ color: '#5f6777' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                Hồ sơ người dùng
              </Link>
              <button
                className="text-left px-4 py-3 rounded-lg font-medium transition-colors bg-white shadow-sm"
                style={{ color: '#014091' }}
              >
                Lịch hẹn
              </button>
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="w-full px-8 py-8">
              <div className="p-7 w-full">
                <div 
                  className="font-semibold mb-4 text-lg"
                  style={{ color: '#014091' }}
                >
                  Lịch hẹn của bạn
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div 
                      className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#014091' }}
                    ></div>
                    <p className="text-gray-500 mt-4">Đang tải...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">Bạn chưa có lịch hẹn nào</p>
                    <button
                      onClick={() => navigate("/booking")}
                      className="px-6 py-3 text-white rounded-lg transition-colors font-medium hover:opacity-90"
                      style={{ backgroundColor: '#f6ae2d', color: '#014091' }}
                    >
                      Đặt lịch ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white hover:bg-opacity-95 transition-all duration-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm cursor-pointer border"
                        style={{ 
                          borderColor: '#e3f2fd',
                          backgroundColor: 'rgba(219, 232, 250, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
                          e.currentTarget.style.borderColor = '#0991f3';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(219, 232, 250, 0.3)';
                          e.currentTarget.style.borderColor = '#e3f2fd';
                        }}
                      >
                        <div>
                          <div className="font-medium text-base text-gray-800 flex items-center gap-2 mb-1">
                            {appointment.title}
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full border"
                              style={getStatusColor(appointment.status)}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                          {appointment.description && (
                            <div className="text-sm text-gray-600 mb-2">
                              {appointment.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              style={{ color: '#0991f3' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDate(appointment.appointment_date)}
                          </div>
                          {appointment.location && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-sky-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {appointment.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
              src={whaleLogo}
              alt="Whale decoration"
              className="absolute right-16 bottom-4 w-32 h-auto opacity-80"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

