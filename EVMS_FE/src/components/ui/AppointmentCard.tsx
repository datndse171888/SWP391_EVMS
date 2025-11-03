// src/components/ui/AppointmentCard.tsx - Updated
import React, { useEffect, useState } from 'react'
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';
import { Calendar, Car, Clock, Package, User, Wrench } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/DataFormat';
import { Button } from './Button';
import type { UserResponse } from '../../types/Account';
import type { ServiceResponse } from '../../types/Service';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import type { VehicleResponse } from '../../types/Vehicle';
import { ServiceApi } from '../../api/ServiceApi';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import { VehicleApi } from '../../api/VehicleApi';
import { UserApi } from '../../api/UserApi';
import { getStatusColor, getStatusLabel, randomColor } from '../../utils/Appointment';

interface AppointmentCardProps {
    appointment: AppointmentResponse;
    handleViewDetail: (appointment: AppointmentResponse) => void;
    handleApprove?: (appointmentId: string) => void;
    handleReject?: (appointmentId: string) => void;
    handleCancel?: (appointmentId: string) => void;
    variant?: 'staff' | 'user'; // New prop to determine which variant to show
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    handleViewDetail,
    handleApprove,
    handleReject,
    handleCancel,
    variant
}) => {
    // ===================================
    // States & Variables
    // ===================================

    const [user, setUser] = useState<UserResponse>();
    const [service, setService] = useState<ServiceResponse>();
    const [servicePackage, setServicePackage] = useState<ServicePackageResponse>();
    const [vehicle, setVehicle] = useState<VehicleResponse>();

    // ===================================
    // Effects
    // ===================================

    useEffect(() => {
        fetchAppointmentDetails();
    }, []);

    const fetchAppointmentDetails = async () => {
        try {
            // For staff variant, fetch user details
            if (variant === 'staff') {
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
            console.error('Error fetching appointment details ', appointment._id, ':', error);
        }
    };

    // ===================================
    // Helper Functions
    // ===================================

    const canCancelAppointment = () => {
        return variant === 'user' &&
            appointment.status !== 'in_progress' &&
            appointment.status !== 'cancelled' &&
            appointment.status !== 'completed';
    };

    // ===================================
    // Render
    // ===================================

    return (
        <div key={appointment._id} className={`${randomColor} border-2 rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        {variant === 'staff' ? (
                            <>
                                <p className="text-xs text-gray-600">User:</p>
                                <p className="text-xs text-gray-600">{user?.fullName}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-gray-600">Mã:</p>
                                <p className="text-xs text-gray-600 font-mono">#{appointment._id.slice(-8)}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                </span>
            </div>

            {/* Booking Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(appointment.bookingDate)} lúc {formatTime(appointment.bookingDate)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Tạo: {formatDate(appointment.createdAt)}</span>
                </div>

                {/* Service/Package Info */}
                {appointment.servicePackageID && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">
                            {servicePackage?.name && servicePackage.name.length > 25
                                ? `${servicePackage.name.substring(0, 40)} ...`
                                : servicePackage?.name}
                        </span>
                    </div>
                )}

                {appointment.serviceID && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">Dịch vụ: {service?.name}</span>
                    </div>
                )}

                {vehicle && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Xe: {vehicle?.brand} - {vehicle?.plateNumber}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(appointment)}
                >
                    Chi tiết
                </Button>

                {/* Staff actions for pending appointments */}
                {variant === 'staff' && appointment.status === 'pending' && (
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove?.(appointment._id)}
                        >
                            Duyệt
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject?.(appointment._id)}
                        >
                            Từ chối
                        </Button>
                    </div>
                )}

                {/* User cancel action for specific statuses */}
                {variant === 'user' && canCancelAppointment()
                    && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel?.(appointment._id)}
                        >
                            Hủy hẹn
                        </Button>
                    )}
            </div>
        </div>
    );
};