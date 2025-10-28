import React, { useState } from 'react'
import Vehicle from './Vehicle';
import { ProcessBar } from '../../components/ui/ProcessBar';
import type { CreateAppointmentRequest } from '../../types/Appoitment';
import Service from './Service';
import type { VehicleCategory } from '../../types/Vehicle';
import DateTime from './DateTime';
import Confirmation from './Confirmation';

const Booking: React.FC = () => {

    // =================================
    // useState & Variables
    // =================================

    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<CreateAppointmentRequest>({
        userID: '',
        vehicleID: '',
        bookingDate: '',
        serviceID: '',
        servicePackageID: '',
    });

    const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('CAR');

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
        // Reset form and redirect to success page or dashboard
        setFormData({
            userID: '',
            vehicleID: '',
            bookingDate: '',
            serviceID: '',
            servicePackageID: '',
        });
        setStep(1);

        // Show success message or redirect
        alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');

        // Optional: redirect to appointments list
        // navigate('/customer/appointments');
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
                            setStep(2);
                            console.log('Form Data after Vehicle:', formData);
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
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <ProcessBar currentStep={step} steps={steps} />
            {renderStep()}
        </div>
    )
}

export default Booking