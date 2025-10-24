import React, { useState } from 'react'
import Vehicle from './Vehicle';


const Booking: React.FC = () => {

    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<any>({});

    switch (step) {
        case 1:
            return (
                <Vehicle
                    formData={setFormData}
                    onNext={() => {
                        setStep(2)
                        console.log('Form Data:', formData);
                    }} />
            )
        case 2:
            return (
                <div>
                    <button
                        type='submit'
                        onClick={e => setStep(1)}>
                        Previous
                    </button>
                    <div>BookingService Step 2</div>
                    <div>{formData.vehicleId}</div>
                    <button
                        type='submit'
                        onClick={e => setStep(3)}>
                        Next
                    </button>
                </div>
            )
        case 3:
            return (
                <div>
                    <button
                        type='submit'
                        onClick={e => setStep(1)}>
                        Previous
                    </button>
                    <div>BookingService Step 3</div>
                </div>
            )
    }
}

export default Booking