import React, { useState } from 'react'
import Vehicle from './Vehicle';
import { ProcessBar } from '../../components/ui/ProcessBar';
import type { AppointmentResponse, CreateAppointmentRequest } from '../../types/Appoitment';
import Service from './Service';
import type { VehicleCategory } from '../../types/Vehicle';
import DateTime from './DateTime';
import Confirmation from './Confirmation';
import { useAlert } from '../../hooks/useAlert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentApi } from '../../api/AppointmentApi';

const Booking: React.FC = () => {

    // =================================
    // useState & Variables
    // =================================

    const [step, setStep] = useState<number>(1);
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateAppointmentRequest>({
        userID: user?.id || '',
        vehicleID: '',
        bookingDate: '',
        serviceID: '',
        servicePackageID: '',
    });

    const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('CAR');

    const { showAlert, AlertComponent } = useAlert();
    const navigate = useNavigate();

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

    const handleBookingComplete = async () => {
        try {
            const response = await AppointmentApi.createAppointment(formData);
            const data: AppointmentResponse = response.data;
            console.log('Appointment created successfully:', data);
            // Show success message or redirect
            showAlert('success', 'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 3000, () => {
                navigate('/customer/appointments');
            });
        } catch (error) {
            showAlert('error', 'Đặt lịch thất bại. Vui lòng thử lại sau.');
            return;
        }
    };

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
                    />
                )
            case 2:
                return (
                    <Service
                        vehicleCategory={vehicleCategory || 'CAR'}
                        formData={handleServiceSelection}
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
                        onPrevious={() => setStep(3)}
                        onComplete={handleBookingComplete}
                    />
                )
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-22 mb-10">
            <ProcessBar currentStep={step} steps={steps} />
            {renderStep()}
            {AlertComponent}
        </div>
    )
}

export default Booking