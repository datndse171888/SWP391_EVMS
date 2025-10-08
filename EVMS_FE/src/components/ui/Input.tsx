import React, { useState } from 'react'

interface InputProps {
    type: "text" | "password" | "email" | "tel";
    id?: string;
    name: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    width?: number;
    height?: number;
    label: string;
    value?: string;
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
    value 
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    // Check if label should be moved up
    const isLabelUp = isFocused || hasValue;

    return (
        <div 
            className={`relative ${width ? `w-${width}` : ''} ${height ? `h-${height}` : ''}`}
        >
            <input
                type={type}
                name={name}
                id={id || name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={isFocused ? placeholder : ''}
                className={`
                    w-full px-3 pt-5 pb-2 
                    border border-orange-1 
                    hover:border-orange-0 
                    focus:border-yellow-0 
                    rounded-md
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-0
                    transition-all duration-200 ease-in-out
                    bg-azure-1/70 
                    hover:bg-azure-0/20
                    focus:bg-blue-1/80
                    backdrop-blur-sm
                    text-gray-8
                    placeholder:text-gray-4
                `}
            />
            <label
                htmlFor={id || name}
                className={`
                    absolute left-3 transition-all duration-200 ease-in-out cursor-text
                    ${isLabelUp 
                        ? 'top-1 text-xs text-orange-0 font-medium' 
                        : 'top-1/2 -translate-y-1/2 text-base text-gray-5'
                    }
                `}
            >
                {label}
            </label>
        </div>
    )
}