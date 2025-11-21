import React, { useState, useEffect } from 'react'
import Vehicle from './Vehicle';
import { ProcessBar } from '../../components/ui/ProcessBar';
import type { CreateAppointmentRequest } from '../../types/Appoitment';
import Service from './Service';
import type { VehicleCategory } from '../../types/Vehicle';
import DateTime from './DateTime';
import Confirmation from './Confirmation';
import { useAlert } from '../../hooks/useAlert';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Booking: React.FC = () => {

    // =================================
    // useState & Variables
    // =================================

    const [step, setStep] = useState<number>(1);
    const { user } = useAuth();
    const { showAlert, AlertComponent } = useAlert();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState<CreateAppointmentRequest>({
        userID: user?.id || '',
        vehicleID: '',
        bookingDate: '',
        serviceID: '',
        servicePackageID: '',
    });
    const [lockVehicle, setLockVehicle] = useState<boolean>(false);

    // Update userID when user is loaded
    useEffect(() => {
        if (user?.id) {
            setFormData(prev => ({
                ...prev,
                userID: user.id 
            }));
        }
    }, [user?.id]);

    // Check verification status when user tries to book
    useEffect(() => {
        if (user && !user.isVerified) {
            // Redirect to verify page if user is not verified
            navigate('/verify-otp');
        }
    }, [user, navigate]);

    const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('CAR');
    const [lockService, setLockService] = useState<boolean>(false);
    const [isPeriodic, setIsPeriodic] = useState<boolean>(false);
    const steps = [
        { step: 1, info: 'Chọn phương tiện' },
        { step: 2, info: 'Chọn dịch vụ' },
        { step: 3, info: 'Chọn ngày và giờ' },
        { step: 4, info: 'Xác nhận thông tin' }
    ]



    // =================================
    // Functions & Handlers
    // =================================

    const handleServiceSelection = (selectedId: string, selectedType: 'service' | 'package') => {
        setFormData(prev => ({
            ...prev,
            serviceID: selectedType === 'service' ? selectedId : '',
            servicePackageID: selectedType === 'package' ? selectedId : '',
        }));
    };

    const handleBookingComplete = () => {
        // Appointment đã được tạo thành công trong Confirmation component
        // Chỉ cần hiển thị thông báo và redirect
        showAlert('success', 'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 3000, () => {
            navigate('/appointment-history');
        });
    };

    // Handle deep link params: vehicleId, serviceId, servicePackageId, lockService
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const vehicleId = params.get('vehicleId') || '';
        const serviceId = params.get('serviceId') || '';
        const servicePackageId = params.get('servicePackageId') || '';
        const lock = params.get('lockService') === '1';
        const periodic = params.get('periodic') === '1';

        if (vehicleId) {
            setFormData(prev => ({
                ...prev,
                vehicleID: vehicleId,
                serviceID: serviceId || '',
                servicePackageID: servicePackageId || ''
            }));
        }
        if (lock && (serviceId || servicePackageId)) {
            setLockService(true);
        }
        if (params.get('lockVehicle') === '1') {
            setLockVehicle(true);
        }
        if (periodic) setIsPeriodic(true);

        // Nếu có preselect và KHÔNG phải luồng định kỳ, cho phép bỏ qua bước chọn dịch vụ để vào chọn giờ
        if (!periodic && vehicleId && (serviceId || servicePackageId)) {
            setStep(3);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Vehicle
                        formData={formData}
                        setFormData={setFormData}
                        setVehicleCategory={setVehicleCategory}
                        onNext={() => {
                            console.log(formData);
                            setStep(2);
                        }}
                        lockedVehicle={lockVehicle}
                    />
                )
            case 2:
                return (
                    <Service
                        vehicleCategory={vehicleCategory || 'CAR'}
                        formData={handleServiceSelection}
                        vehicleId={formData.vehicleID}
                        locked={lockService}
                        onNext={() => {
                            setStep(3);
                            console.log('Form Data after Service:', formData);
                        }}
                        onPrevious={() => setStep(1)}
                    />
                )
            case 3:
                return (
                    <DateTime
                        formData={formData}
                        setFormData={setFormData}
                        vehicleCategory={vehicleCategory}
                        onNext={() => {
                            setStep(4);
                            console.log('Form Data after DateTime:', formData);
                        }}
                        onPrevious={() => setStep(2)}
                    />
                )
            case 4:
                return (
                    <Confirmation
                        formData={formData}
                        isPeriodic={isPeriodic}
                        onPrevious={() => setStep(3)}
                        onComplete={handleBookingComplete}
                    />
                )
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-22 mb-10">
            <ProcessBar currentStep={step} steps={steps} />
            {renderStep()}
            {AlertComponent}
        </div>
    )
}

export default Booking