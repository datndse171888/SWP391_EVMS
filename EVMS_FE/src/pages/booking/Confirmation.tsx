// src/pages/booking/Confirmation.tsx
import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Car, Wrench, Package, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Loading } from '../../components/Loading'
import type { CreateAppointmentRequest } from '../../types/Appoitment'
import type { VehicleResponse } from '../../types/Vehicle'
import type { ServiceResponse } from '../../types/Service'
import type { ServicePackageResponse } from '../../types/ServicePackage'
import { ConfirmationModal } from '../../components/ui/ConfirmationModal'
import { formatDateTime, formatDuration, formatPrice } from '../../utils/DataFormat'
import { VehicleApi } from '../../api/VehicleApi'
import { useAlert } from '../../hooks/useAlert'
import { ServiceApi } from '../../api/ServiceApi'
import { ServicePackageApi } from '../../api/ServicePackageApi'

interface ConfirmationProps {
  formData: CreateAppointmentRequest;
  onPrevious: () => void;
  onComplete: () => void;
}

// Main Confirmation Component
const Confirmation: React.FC<ConfirmationProps> = ({
  formData,
  onPrevious,
  onComplete
}) => {

  // ================================
  // UseStates & Variables
  // ================================

  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [service, setService] = useState<ServiceResponse | null>(null);
  const [servicePackage, setServicePackage] = useState<ServicePackageResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showAlert, AlertComponent } = useAlert();


  // ================================
  // UseEffects & API Calls
  // ================================

  useEffect(() => {
    fetchBookingDetails();
  }, [formData]);

  const fetchBookingDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch vehicle details
      if (formData.vehicleID) {
        try {
          const vehiclePromise = await VehicleApi.getVehicleById(formData.vehicleID);
          const vehicleResponse: VehicleResponse = vehiclePromise.data;
          setVehicle(vehicleResponse);
        } catch (error) {
          showAlert('error', 'Không thể tải thông tin phương tiện');
        }
      }

      // Fetch service details
        if (formData.serviceID) {
          try {
            const servicePromise = await ServiceApi.getServiceById(formData.serviceID);
            const serviceResponse: ServiceResponse = servicePromise.data;
            setService(serviceResponse);
          } catch (error) {
            showAlert('error', 'Không thể tải thông tin dịch vụ');
          }
        }

      // Fetch service package details
        if (formData.servicePackageID) {
          try {
            const servicePackagePromise = await ServicePackageApi.getServicePackageById(formData.servicePackageID);
            const servicePackageResponse: ServicePackageResponse = servicePackagePromise.data;
            setServicePackage(servicePackageResponse);
          } catch (error) {
            showAlert('error', 'Không thể tải thông tin gói dịch vụ');
          }
        }

      //   await Promise.all();

    } catch (error: any) {
      console.error('Error fetching booking details:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải thông tin đặt lịch');
    } finally {
      setIsLoading(false);
    }
  };


  // ================================
  // Handlers & Functions
  // ================================

  const getTotalDuration = () => {
    return service?.duration || servicePackage?.duration || 0;
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // const response = await AppointmentApi.createAppointment(formData);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Booking confirmed with data:', formData);

      // Close modal and complete booking
      setShowConfirmModal(false);
      onComplete();

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // ================================
  // Render
  // ================================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={fetchBookingDetails}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const { date, time } = formatDateTime(formData.bookingDate);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Xác nhận thông tin</h2>
        <p className="text-gray-600">
          Vui lòng kiểm tra lại thông tin đặt lịch trước khi xác nhận
        </p>
      </div>

      {/* Booking Summary */}
      <div className="space-y-6">
        {/* Vehicle Information */}
        {vehicle && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-500" />
              Thông tin xe
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Thương hiệu</p>
                <p className="font-medium text-gray-800">{vehicle.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Biển số</p>
                <p className="font-medium text-gray-800">{vehicle.plateNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Năm sản xuất</p>
                <p className="font-medium text-gray-800">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loại xe</p>
                <p className="font-medium text-gray-800">
                  {vehicle.vehicleCategory === 'CAR' ? 'Ô tô điện' :
                    vehicle.vehicleCategory === 'MOTOBIKE' ? 'Xe máy điện' :
                      'Xe đạp điện'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số km đã đi</p>
                <p className="font-medium text-gray-800">{vehicle.mileage} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dung lượng pin</p>
                <p className="font-medium text-gray-800">{vehicle.batteryCapacity} kWh</p>
              </div>
            </div>
          </div>
        )}

        {/* Service Information */}
        {(service || servicePackage) && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              {service ? (
                <Wrench className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <Package className="w-5 h-5 mr-2 text-orange-500" />
              )}
              {service ? 'Dịch vụ đã chọn' : 'Gói dịch vụ đã chọn'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tên dịch vụ</p>
                <p className="font-medium text-gray-800 text-lg">
                  {service?.name || servicePackage?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <p className="text-gray-700">
                  {service?.description || servicePackage?.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Thời gian thực hiện</p>
                  <p className="font-medium text-gray-800">
                    {formatDuration(getTotalDuration())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá dịch vụ</p>
                  <p className="font-medium text-orange-600 text-lg">
                    {formatPrice(service?.price || servicePackage?.price || 0)}
                  </p>
                </div>
              </div>

              {/* Service Package Details */}
              {servicePackage && servicePackage.services && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dịch vụ bao gồm</p>
                  <ul className="space-y-1">
                    {servicePackage.services.map((svc, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {svc.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DateTime Information */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Thời gian hẹn
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ngày hẹn</p>
              <p className="font-medium text-gray-800 text-lg">{date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Giờ hẹn</p>
              <p className="font-medium text-gray-800 text-lg flex items-center">
                <Clock className="w-4 h-4 mr-1 text-purple-500" />
                {time}
              </p>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-orange-800 mb-4">Tổng kết</h3>

          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-700">Tổng thời gian dự kiến:</span>
            <span className="font-semibold text-gray-800">
              {formatDuration(getTotalDuration())}
            </span>
          </div>

          <div className="flex justify-between items-center text-xl border-t border-orange-200 pt-4 mt-4">
            <span className="text-gray-700 font-medium">Tổng chi phí:</span>
            <span className="font-bold text-orange-600">
              {formatPrice(service?.price || servicePackage?.price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onPrevious}
        >
          Quay lại
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={() => setShowConfirmModal(true)}
        >
          Xác nhận đặt lịch
        </Button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        isLoading={isSubmitting}
      />

      {AlertComponent}
    </>
  );
};

export default Confirmation;