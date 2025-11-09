// src/pages/user/AddVehicle.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { VehicleApi } from "../../api/VehicleApi";
import type { VehicleRequest } from "../../types/Vehicle";
import { UserProfileLayout } from "../../components/layout/UserProfileLayout";
import { UserProfileSidebar } from "../../components/layout/UserProfileSidebar";
import { UserProfileHeader } from "../../components/layout/UserProfileHeader";
import { useAlert } from "../../hooks/useAlert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { validVIN } from "../../utils/Validation";

const AddVehicle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useAlert();

  const [formData, setFormData] = useState<VehicleRequest>({
    VIN: '',
    vehicleCategory: 'CAR',
    plateNumber: '',
    brand: '',
    year: new Date().getFullYear(),
    mileage: 0,
    batteryCapacity: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check verification status
  useEffect(() => {
    if (user && !user.isVerified) {
      showAlert('error', 'Vui lòng xác thực tài khoản trước khi thêm phương tiện');
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);
    }
  }, [user, navigate, showAlert]);

  const vehicleCategoryOptions = [
    { value: 'CAR', label: 'Ô tô điện' },
    { value: 'MOTOBIKE', label: 'Xe máy điện' },
    { value: 'BICYCLE', label: 'Xe đạp điện' }
  ];

  const handleChange = (field: keyof VehicleRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // VIN validation (required for CAR)
    if (formData.vehicleCategory === 'CAR') {
      if (!formData.VIN || formData.VIN.trim() === '') {
        newErrors.VIN = 'VIN là bắt buộc đối với xe ô tô';
      } else if (!validVIN(formData.VIN)) {
        newErrors.VIN = 'VIN không hợp lệ (phải có 17 ký tự)';
      }
    }

    // Plate number validation
    if (!formData.plateNumber || formData.plateNumber.trim() === '') {
      newErrors.plateNumber = 'Biển số xe là bắt buộc';
    }

    // Brand validation
    if (!formData.brand || formData.brand.trim() === '') {
      newErrors.brand = 'Thương hiệu là bắt buộc';
    }

    // Year validation
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Năm sản xuất không hợp lệ';
    }

    // Mileage validation
    if (formData.mileage < 0 || formData.mileage > 9999999) {
      newErrors.mileage = 'Số km không hợp lệ';
    }

    // Battery capacity validation
    if (formData.batteryCapacity <= 0 || formData.batteryCapacity > 1000) {
      newErrors.batteryCapacity = 'Dung lượng pin không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check verification before submit
    if (user && !user.isVerified) {
      showAlert('error', 'Vui lòng xác thực tài khoản trước khi thêm phương tiện');
      navigate('/verify-otp');
      return;
    }

    if (!validate()) {
      showAlert('error', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await VehicleApi.createVehicle(formData);
      if (response.data.success) {
        showAlert('success', 'Thêm phương tiện thành công!');
        setTimeout(() => {
          navigate('/my-vehicles');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      const errorMessage = error.response?.data?.message || 'Không thể thêm phương tiện. Vui lòng thử lại.';
      showAlert('error', errorMessage);
    } finally {
      setIsSubmitting(false);
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
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => navigate('/my-vehicles')}
                  className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
                <UserProfileHeader
                  title="Thêm phương tiện mới"
                  description="Nhập thông tin phương tiện của bạn"
                />
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
                        Vui lòng xác thực email để thêm phương tiện mới.
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
            <div className={`flex-1 overflow-y-auto min-h-0 pb-96 ${user && !user.isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 max-w-3xl">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* VIN */}
                  <div>
                    <Input
                      id="VIN"
                      name="VIN"
                      type="text"
                      label="Số VIN"
                      value={formData.VIN}
                      onChange={(e) => handleChange('VIN', e.target.value.toUpperCase())}
                      required={formData.vehicleCategory === 'CAR'}
                      placeholder="Nhập số VIN (17 ký tự)"
                      error={errors.VIN}
                    />
                    {formData.vehicleCategory === 'CAR' && (
                      <p className="text-xs text-gray-500 mt-1">VIN là bắt buộc đối với xe ô tô</p>
                    )}
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <Select
                      name="vehicleCategory"
                      label="Loại xe"
                      value={formData.vehicleCategory}
                      onChange={(e) => handleChange('vehicleCategory', e.target.value)}
                      option={vehicleCategoryOptions}
                    />
                  </div>

                  {/* Plate Number */}
                  <div>
                    <Input
                      id="plateNumber"
                      name="plateNumber"
                      type="text"
                      label="Biển số xe"
                      value={formData.plateNumber}
                      onChange={(e) => handleChange('plateNumber', e.target.value.toUpperCase())}
                      required
                      placeholder="VD: 30A-12345"
                      error={errors.plateNumber}
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <Input
                      id="brand"
                      name="brand"
                      type="text"
                      label="Thương hiệu"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      required
                      placeholder="VD: VinFast, Tesla"
                      error={errors.brand}
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      label="Năm sản xuất"
                      value={formData.year.toString()}
                      onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
                      required
                      placeholder={`VD: ${new Date().getFullYear()}`}
                      error={errors.year}
                    />
                  </div>

                  {/* Mileage */}
                  <div>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      label="Số km"
                      value={formData.mileage.toString()}
                      onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
                      required
                      placeholder="VD: 10000"
                      error={errors.mileage}
                    />
                  </div>

                  {/* Battery Capacity */}
                  <div>
                    <Input
                      id="batteryCapacity"
                      name="batteryCapacity"
                      type="number"
                      label="Dung lượng pin (kWh)"
                      value={formData.batteryCapacity.toString()}
                      onChange={(e) => handleChange('batteryCapacity', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="VD: 50"
                      error={errors.batteryCapacity}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/my-vehicles')}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang thêm...' : 'Thêm phương tiện'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default AddVehicle;

