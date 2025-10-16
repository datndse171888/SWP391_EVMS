import React, { useState } from 'react'


const BookingService: React.FC = () => {

    const [step, setStep] = useState<number>(1);

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
                        onClick={e => setStep(1)}>
                        Previous
                    </button>
                    <div>BookingService Step 3</div>
                </div>
            )
    }
}

export default BookingService