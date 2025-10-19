import { Check } from 'lucide-react'
import React from 'react'

interface ProgressStep {
    step: number;
    info: string;
}

interface ProcessBarProps {
    currentStep: number;
    steps: ProgressStep[];
}

export const ProcessBar: React.FC<ProcessBarProps> = ({ currentStep, steps }) => {
    return (
        <div className="mb-8">
            {/* Progress Line and Circles */}
            <div className="flex items-center">
                {steps.map((stepInfo, index) => (
                    <React.Fragment key={index}>
                        {/* Step Circle with Tooltip */}
                        <div className="relative group">
                            <div
                                className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 cursor-pointer hover:scale-110 ${
                                    currentStep > stepInfo.step
                                        ? 'text-white shadow-md'
                                        : currentStep === stepInfo.step
                                        ? 'text-white shadow-lg ring-4 ring-orange-200 scale-110'
                                        : 'bg-gray-300 text-gray-500 hover:bg-gray-400'
                                }`}
                                style={{
                                    backgroundColor: currentStep >= stepInfo.step ? '#f78b0f' : undefined
                                }}
                                title={stepInfo.info}
                            >
                                {currentStep > stepInfo.step ? (
                                    <Check className="h-6 w-6" />
                                ) : (
                                    stepInfo.step
                                )}
                            </div>
                            
                            {/* Custom Themed Tooltip */}
                            <div 
                                className="absolute left-1/2 transform -translate-x-1/2 top-full mt-3 px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 z-20 pointer-events-none"
                                style={{
                                    backgroundColor: '#1f2227', // gray-10
                                    color: '#ffffff',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}
                            >
                                {stepInfo.info}
                                {/* Custom Arrow */}
                                <div 
                                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent"
                                    style={{ borderBottomColor: '#1f2227' }}
                                ></div>
                            </div>
                        </div>

                        {/* Progress Line (not after last step) */}
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-3 mx-4 rounded-full transition-all duration-500 ${
                                    currentStep > stepInfo.step
                                        ? ''
                                        : 'bg-gray-300'
                                }`}
                                style={{
                                    backgroundColor: currentStep > stepInfo.step ? '#f78b0f' : undefined
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}