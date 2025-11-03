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
import type { CheckingResponse } from '../../types/DataResponse';

interface AppointmentCardProps {
    appointment: AppointmentResponse;
    handleViewDetail: (appointment: AppointmentResponse) => void;
    handleApprove: (appointmentId: string) => void;
    handleReject: (appointmentId: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    handleViewDetail,
    handleApprove,
    handleReject
}) => {

    //===================================
    // States & Variables
    //===================================

    const [user, setUser] = useState<UserResponse>();
    const [service, setService] = useState<ServiceResponse>();
    const [servicePackage, setServicePackage] = useState<ServicePackageResponse>();
    const [vehicle, setVehicle] = useState<VehicleResponse>();


    //===================================
    // Effects
    //===================================

    useEffect(() => {
        fetchAppointmentDetails();
    }, []);

    const fetchAppointmentDetails = async () => {
        try {
            const userResponse = await UserApi.getById(appointment.userID);
            const userData: CheckingResponse<UserResponse> = userResponse.data;
            setUser(userData.data);

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

    const getStatusColor = (status: AppointmentStatus) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-green-100 text-green-800 border-green-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            no_show: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status: AppointmentStatus) => {
        const labels = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            in_progress: 'Đang thực hiện',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            no_show: 'Không đến'
        };
        return labels[status] || status;
    };

    const cardColors = [
        'bg-blue-50 border-blue-200',
        'bg-green-50 border-green-200',
        'bg-pink-50 border-pink-200',
        'bg-purple-50 border-purple-200',
        'bg-yellow-50 border-yellow-200',
        'bg-indigo-50 border-indigo-200'
    ];

    const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];


    return (
        <div key={appointment._id} className={`${randomColor} border-2 rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">User:</p>
                        <p className="text-xs text-gray-600">{user?.fullName}</p>
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
                        {servicePackage?.name && servicePackage.name.length > 25
                            ? `${servicePackage.name.substring(0, 30)}...`
                            : servicePackage?.name}
                    </div>
                )}

                {appointment.serviceID && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Dịch vụ: {service?.name}</span>
                    </div>
                )}


                {vehicle && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Xe: {vehicle?.brand}</span>
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

                {appointment.status === 'pending' && (
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(appointment._id)}
                        >
                            Duyệt
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(appointment._id)}
                        >
                            Từ chối
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

