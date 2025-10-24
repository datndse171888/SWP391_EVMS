import React, { useState } from 'react'
import { ProcessBar } from './components/ui/ProcessBar';

const steps = [
    { step: 1, info: 'Select Service' },
    { step: 2, info: 'Choose Date & Time' },
    { step: 3, info: 'Confirm Booking' }
];

export const Test: React.FC = () => {

    const [step, setStep] = useState<number>(1);

    const stepRender = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <div>BookingService Step 1</div>
                        <button
                            type='submit'
                            onClick={e => setStep(2)}>
                            Next
                        </button>
                    </div>
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
                            onClick={e => setStep(2)}>
                            Previous
                        </button>
                        <div>BookingService Step 3</div>
                    </div>
                )
        }
    }

    return (
        <div>
            <ProcessBar currentStep={step} steps={steps} />
            {stepRender()}
        </div>
    )
}

