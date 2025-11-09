// src/pages/user/MyVehicles.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { VehicleApi } from "../../api/VehicleApi";
import type { VehicleResponse } from "../../types/Vehicle";
import { UserProfileLayout } from "../../components/layout/UserProfileLayout";
import { UserProfileSidebar } from "../../components/layout/UserProfileSidebar";
import { UserProfileHeader } from "../../components/layout/UserProfileHeader";
import { Loading } from "../../components/Loading";
import { useAlert } from "../../hooks/useAlert";
import { Car, Plus, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";

const MyVehicles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await VehicleApi.getAllVehiclesByToken();
      const vehiclesData = response.data.data || [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showAlert('error', 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleCategoryName = (category: string) => {
    switch (category) {
      case 'CAR': return 'Ô tô điện';
      case 'MOTOBIKE': return 'Xe máy điện';
      case 'BICYCLE': return 'Xe đạp điện';
      default: return category;
    }
  };

  const getVehicleCategoryColor = (category: string) => {
    switch (category) {
      case 'CAR': return 'bg-blue-100 text-blue-800';
      case 'MOTOBIKE': return 'bg-green-100 text-green-800';
      case 'BICYCLE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <UserProfileLayout>
      {AlertComponent}

      <div className="flex flex-row w-full h-full">
        <UserProfileSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="w-full px-8 py-8 flex flex-col h-full">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <UserProfileHeader
                  title="Phương tiện của tôi"
                  description="Quản lý và theo dõi các phương tiện của bạn"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (user && !user.isVerified) {
                      navigate('/verify-otp');
                    } else {
                      navigate("/add-vehicle");
                    }
                  }}
                  disabled={user && !user.isVerified}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm phương tiện
                </Button>
              </div>

              {/* Verification Alert Banner */}
              {user && !user.isVerified && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-700 font-medium mb-2">
                        Tài khoản của bạn chưa được xác thực
                      </p>
                      <p className="text-xs text-yellow-600 mb-3">
                        Vui lòng xác thực email để quản lý phương tiện và đặt lịch dịch vụ.
                      </p>
                      <button
                        onClick={() => navigate('/verify-otp')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
                      >
                        Xác thực ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className={`flex-1 overflow-y-auto min-h-0 ${user && !user.isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading ? (
                <div className="py-12">
                  <Loading />
                  <p className="text-center text-gray-500 mt-4">Đang tải danh sách phương tiện...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Bạn chưa có phương tiện nào</p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (user && !user.isVerified) {
                        navigate('/verify-otp');
                      } else {
                        navigate("/add-vehicle");
                      }
                    }}
                    disabled={user && !user.isVerified}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm phương tiện đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="pb-96">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Car className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{vehicle.brand}</h3>
                              <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVehicleCategoryColor(vehicle.vehicleCategory)}`}>
                            {getVehicleCategoryName(vehicle.vehicleCategory)}
                          </span>
                        </div>

                        {/* Vehicle Details */}
                        <div className="space-y-2 mb-4">
                          {vehicle.VIN && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium mr-2">VIN:</span>
                              <span className="font-mono">{vehicle.VIN}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Năm sản xuất:</span>
                            <span>{vehicle.year}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Số km:</span>
                            <span>{vehicle.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Dung lượng pin:</span>
                            <span>{vehicle.batteryCapacity} kWh</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Trạng thái:</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              vehicle.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {vehicle.status === 'active' ? 'Đang sử dụng' : 'Không hoạt động'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (user && !user.isVerified) {
                                navigate('/verify-otp');
                              } else {
                                navigate(`/booking?vehicleId=${vehicle._id}`);
                              }
                            }}
                            className="flex-1"
                            disabled={user && !user.isVerified}
                          >
                            Đặt lịch
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/maintenance?vehicleId=${vehicle._id}`)}
                            className="flex-1"
                            disabled={user && !user.isVerified}
                          >
                            Bảo dưỡng
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default MyVehicles;

