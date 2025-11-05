// src/pages/staff/AppointmentDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Car, Wrench, Package, Calendar, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { AppointmentResponse } from '../../types/Appoitment';
import type { UserResponse } from '../../types/Account';
import type { ServiceResponse } from '../../types/Service';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import type { VehicleResponse } from '../../types/Vehicle';
import { ServiceApi } from '../../api/ServiceApi';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import { VehicleApi } from '../../api/VehicleApi';
import { formatDate, formatPrice, formatTime } from '../../utils/DataFormat';
import { Loading } from '../Loading';
import { UserApi } from '../../api/UserApi';

interface AppointmentDetailModalProps {
    appointment: AppointmentResponse;
    isOpen: boolean;
    onClose: () => void;
    varient: 'staff' | 'user';
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    appointment,
    isOpen,
    onClose,
    varient
}) => {
    // ================================
    // States
    // ================================

    const [user, setUser] = useState<UserResponse | null>(null);
    const [service, setService] = useState<ServiceResponse | null>(null);
    const [servicePackage, setServicePackage] = useState<ServicePackageResponse | null>(null);
    const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ================================
    // Effects
    // ================================

    useEffect(() => {
        if (isOpen && appointment) {
            fetchAppointmentDetails();
        }
    }, [isOpen, appointment]);

    // ================================
    // API Calls
    // ================================

    const fetchAppointmentDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (varient === 'staff') {
                const userResponse = await UserApi.getById(appointment.userID);
                const userData: UserResponse = userResponse.data;
                setUser(userData);
            }

            const vehicleResponse = await VehicleApi.getVehicleById(appointment.vehicleID);
            const vehicleData: VehicleResponse = vehicleResponse.data;
            setVehicle(vehicleData);

            if (appointment.servicePackageID) {
                const servicePackageResponse = await ServicePackageApi.getServicePackageById(appointment.servicePackageID);
                const servicePackageData: ServicePackageResponse = servicePackageResponse.data;
                setServicePackage(servicePackageData);
            } else if (appointment.serviceID) {
                const serviceResponse = await ServiceApi.getServiceById(appointment.serviceID);
                const serviceData: ServiceResponse = serviceResponse.data;
                setService(serviceData);
            }

        } catch (error) {
            console.error('Error fetching appointment details:', error);
            setError('Có lỗi xảy ra khi tải chi tiết lịch hẹn');
        } finally {
            setIsLoading(false);
        }
    };

    // ================================
    // Render Helpers
    // ================================

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-purple-100 text-purple-800'
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            in_progress: 'Đang thực hiện',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            no_show: 'Không đến'
        };
        return labels[status as keyof typeof labels] || status;
    };

    // ================================
    // Render
    // ================================

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Chi tiết lịch hẹn</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <Loading />
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-600 mb-4">{error}</div>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={fetchAppointmentDetails}
                            >
                                Thử lại
                            </Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Left Column */}
                            <div className="space-y-6">

                                {/* Appointment Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                                        Thông tin lịch hẹn
                                    </h3>

                                    <div className="space-y-3">

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Ngày & giờ hẹn</label>
                                            <p className="text-gray-900">
                                                {formatDate(appointment.bookingDate)} lúc {formatTime(appointment.bookingDate)}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                                            <div className="mt-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {getStatusLabel(appointment.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {appointment.createdAt && 
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                                            <p className="text-gray-900">{formatDate(appointment.createdAt)}</p>
                                        </div>}
                                    </div>
                                </div>

                                {/* User Information */}
                                {user && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-500" />
                                            Thông tin khách hàng
                                        </h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                                                <p className="text-gray-900">{user.fullName}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email</label>
                                                <p className="text-gray-900">{user.email}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                                <p className="text-gray-900">{user.phoneNumber}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Giới tính</label>
                                                <p className="text-gray-900">{user.gender}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Vehicle Information */}
                                {vehicle && (
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Car className="w-5 h-5 mr-2 text-green-500" />
                                            Thông tin xe
                                        </h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Thương hiệu</label>
                                                <p className="text-gray-900">{vehicle.brand}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Biển số</label>
                                                <p className="text-gray-900">{vehicle.plateNumber}</p>
                                            </div>

                                            {vehicle.VIN && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">VIN</label>
                                                    <p className="text-gray-900 font-mono">{vehicle.VIN}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Năm sản xuất</label>
                                                    <p className="text-gray-900">{vehicle.year}</p>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Số km</label>
                                                    <p className="text-gray-900">{vehicle.mileage.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Dung lượng pin</label>
                                                <p className="text-gray-900">{vehicle.batteryCapacity} kWh</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">

                                {/* Service Information */}
                                {service && (
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Wrench className="w-5 h-5 mr-2 text-orange-500" />
                                            Thông tin dịch vụ
                                        </h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Tên dịch vụ</label>
                                                <p className="text-gray-900 font-semibold">{service.name}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                                                <p className="text-gray-700">{service.description}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Giá dịch vụ</label>
                                                    <p className="text-gray-900 font-semibold">{formatPrice(service.price)}</p>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Thời gian</label>
                                                    <p className="text-gray-900">{service.duration} phút</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Loại xe áp dụng</label>
                                                <p className="text-gray-900">{
                                                    service.vehicleCategory === 'CAR' ? 'Ô tô điện' :
                                                        service.vehicleCategory === 'MOTOBIKE' ? 'Xe máy điện' :
                                                            'Xe đạp điện'
                                                }</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Service Package Information */}
                                {servicePackage && (
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-purple-500" />
                                            Thông tin gói dịch vụ
                                        </h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Tên gói dịch vụ</label>
                                                <p className="text-gray-900 font-semibold">{servicePackage.name}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                                                <p className="text-gray-700">{servicePackage.description}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Giá gói</label>
                                                    <p className="text-gray-900 font-semibold">{formatPrice(servicePackage.price)}</p>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Thời gian</label>
                                                    <p className="text-gray-900">{servicePackage.duration} phút</p>
                                                </div>
                                            </div>

                                            {servicePackage.discount && servicePackage.discount > 0 && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Giảm giá</label>
                                                    <p className="text-green-600 font-semibold">{servicePackage.discount}%</p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Loại xe áp dụng</label>
                                                <p className="text-gray-900">{servicePackage.vehicleCategory}</p>
                                            </div>

                                            {/* Services in Package */}
                                            {servicePackage.services && servicePackage.services.length > 0 && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Dịch vụ bao gồm</label>
                                                    <ul className="mt-2 space-y-1">
                                                        {servicePackage.services.map((svc, index) => (
                                                            <li key={index} className="text-sm text-gray-700 flex items-center">
                                                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                                                                {svc.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt</h3>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Loại dịch vụ:</span>
                                            <span className="text-gray-900">
                                                {service ? 'Dịch vụ đơn lẻ' : servicePackage ? 'Gói dịch vụ' : 'Chưa xác định'}
                                            </span>
                                        </div>

                                        {(service || servicePackage) && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Thời gian dự kiến:</span>
                                                <span className="text-gray-900">
                                                    {service ? service.duration : servicePackage?.duration} phút
                                                </span>
                                            </div>
                                        )}

                                        {(service || servicePackage) && (
                                            <div className="flex justify-between font-semibold">
                                                <span className="text-gray-600">Tổng chi phí:</span>
                                                <span className="text-gray-900">
                                                    {formatPrice(service ? service.price : servicePackage?.price || 0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailModal;