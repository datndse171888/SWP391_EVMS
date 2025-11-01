import { Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react'

interface InputProps {
    type: "text" | "password" | "email" | "tel" | "number" | "date";
    id?: string;
    name: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    width?: number;
    height?: number;
    label: string;
    value?: string | number;
    disabled?: boolean;
    required?: boolean;
    min?: string | number;
    max?: string | number;
}

export const Input: React.FC<InputProps> = ({
    type,
    id,
    name,
    onChange,
    placeholder,
    width,
    height,
    label,
    value,
    disabled = false,
    required = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const [showPassword, setShowPassword] = useState(false);

    // Update hasValue when value prop changes
    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    const handleFocus = () => {
        if (!disabled) setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) {
            setHasValue(!!e.target.value);
            if (onChange) {
                onChange(e);
            }
        }
    };

    // Check if label should be moved up
    const isLabelUp = isFocused || hasValue;

    return (
        <div
            className={`relative ${width ? `w-${width}` : ''} ${height ? `h-${height}` : ''}`}
        >
            <input
                type={showPassword ? 'text' : type}
                name={name}
                id={id || name}
                value={value || ''}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={isFocused ? placeholder : ''}
                disabled={disabled}
                required={required}
                className={`
                    w-full px-3 pt-5 pb-2 
                    border border-orange-1 
                    ${disabled
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                        : 'hover:border-orange-0 focus:border-yellow-0 bg-azure-1/70 hover:bg-azure-0/20 focus:bg-blue-1/80'
                    }
                    rounded-md
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-0
                    transition-all duration-200 ease-in-out
                    backdrop-blur-sm
                    text-gray-8
                    placeholder:text-gray-4
                `}
            />
            <label
                htmlFor={id || name}
                className={`
                    absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
                    ${disabled ? 'cursor-not-allowed' : 'cursor-text'}
                    ${isLabelUp
                        ? `top-1 text-xs font-medium ${disabled ? 'text-gray-400' : 'text-orange-0'}`
                        : `top-1/2 -translate-y-1/2 text-base ${disabled ? 'text-gray-400' : 'text-gray-5'}`
                    }
                `}
            >
                {label}
                {required && !disabled && <span className="text-red-500 ml-1">*</span>}
            </label>
            {type === 'password' && <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                style={{ marginTop: '2px' }} // Adjust based on your Input component's label height
            >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>}
        </div>
    )
}