// src/pages/user/AppointmentHistory.tsx - Updated with new layout and components
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentApi } from "../../api/AppointmentApi";
import type { FilteredDataResponse } from "../../types/DataResponse";
import type { AppointmentResponse } from "../../types/Appoitment";
import { AppointmentCard } from "../../components/ui/AppointmentCard";
import AppointmentDetailModal from "../../components/ui/AppointmentDetailModal";
import { Loading } from "../../components/Loading";
import { useAlert } from "../../hooks/useAlert";
import { UserProfileLayout } from "../../components/layout/UserProfileLayout";
import { UserProfileSidebar } from "../../components/layout/UserProfileSidebar";
import { UserProfileHeader } from "../../components/layout/UserProfileHeader";

const AppointmentHistory = () => {
  // ===================================
  // States & Variables
  // ===================================

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  // ===================================
  // Effects
  // ===================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appointmentResponse = await AppointmentApi.getAppointmentByMe();
      const appointmentData: FilteredDataResponse<AppointmentResponse> = appointmentResponse.data;
      setAppointments(appointmentData.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showAlert('error', 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // Handlers
  // ===================================

  const handleViewDetail = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await AppointmentApi.cancelAppointment(appointmentId);
      showAlert('success', 'Hủy lịch hẹn thành công');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error canceling appointment:', error);
      showAlert('error', 'Không thể hủy lịch hẹn');
    }
  };

  // ===================================
  // Render
  // ===================================

  return (
    <UserProfileLayout>
      {AlertComponent}

      <div className="flex flex-row w-full">
        <UserProfileSidebar />

        <div className="flex-1">
          <div className="w-full px-8 py-8">
            <UserProfileHeader
              title="Lịch hẹn của bạn"
              description="Quản lý và theo dõi các lịch hẹn dịch vụ"
            />

            {loading ? (
              <div className="py-12">
                <Loading />
                <p className="text-center text-gray-500 mt-4">Đang tải danh sách lịch hẹn...</p>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    handleViewDetail={handleViewDetail}
                    handleCancel={handleCancelAppointment}
                    variant="user"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          varient="user"
        />
      )}
    </UserProfileLayout>
  );
};

export default AppointmentHistory;