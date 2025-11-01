// src/components/Alert.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

export type AlertType = 'warning' | 'error' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  duration?: number; // milliseconds, default 3000ms
  isVisible: boolean;
  onClose: () => void;
}

interface AlertConfig {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  textColor: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  duration = 5000, 
  isVisible, 
  onClose 
}) => {
  const [progress, setProgress] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  // Alert configurations
  const alertConfigs: Record<AlertType, AlertConfig> = {
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    error: {
      icon: <X className="w-12 h-12 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    success: {
      icon: <Check className="w-12 h-12 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    info: {
      icon: <Info className="w-12 h-12 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  };

  const config = alertConfigs[type];

  // Timer effect
  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setProgress(100);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50)); // Update every 50ms
        if (newProgress <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            onClose();
          }, 200); // Small delay for smooth closing
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, duration, onClose]);

  // Progress ring calculation
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 backdrop-blur-xs bg-opacity-30 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Alert Modal */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4`}>
          
          {/* Icon with Progress Ring */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Progress Ring */}
              <svg 
                className="w-24 h-24 transform -rotate-90 absolute inset-0"
                viewBox="0 0 100 100"
              >
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200"
                />
                
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={
                    type === 'warning' ? 'text-yellow-400' :
                    type === 'error' ? 'text-red-400' :
                    type === 'success' ? 'text-green-400' :
                    'text-blue-400'
                  }
                  style={{
                    transition: 'stroke-dashoffset 50ms linear'
                  }}
                />
              </svg>

              {/* Icon Container */}
              <div className={`${config.iconBgColor} w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                {config.icon}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p className={`${config.textColor} text-lg font-semibold leading-relaxed`}>
              {message}
            </p>
          </div>

          {/* Close button (optional) */}
          {/* <button
            onClick={onClose}
            className={`absolute top-3 right-3 ${config.textColor} hover:opacity-70 transition-opacity p-1`}
          >
            <X className="w-4 h-4" />
          </button> */}
        </div>
      </div>
    </>
  );
};