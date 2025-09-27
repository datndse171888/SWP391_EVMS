import React from 'react';

interface ButtonProps {
    type: "button" | "submit" | "reset";
    variant: "primary" | "secondary" | "outline" | "ghost";
    size: "sm" | "md" | "lg";
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    children: React.ReactNode;
    width?: number;
    height?: number;
}

export const Button: React.FC<ButtonProps> = ({
    type,
    variant,
    size,
    onClick,
    disabled = false,
    children,
    width,
    height,
}) => {
    // Base styles
    const baseStyles = "font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 transform active:scale-95";

    // Size styles
    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-base",
        lg: "px-6 py-3 text-lg"
    };

    // Variant styles using color.css classes
    const variantStyles = {
        primary: `
            bg-orange-0 hover:bg-orange-6 active:bg-orange-7
            text-gray-1 hover:text-gray-0
            focus:ring-orange-1
            shadow-md hover:shadow-lg
            ${disabled ? 'bg-gray-2 text-gray-5 cursor-not-allowed' : ''}
        `,
        secondary: `
            bg-yellow-0 hover:bg-yellow-6 active:bg-yellow-7
            text-gray-10 
            focus:ring-yellow-1
            shadow-md hover:shadow-lg
            ${disabled ? 'bg-gray-2 text-gray-5 cursor-not-allowed' : ''}
        `,
        outline: `
            bg-yellow-1 hover:bg-yellow-0 active:bg-yellow-6
            border-2 border-orange-1 hover:border-orange-0
            text-orange-0 hover:text-gray-0
            focus:ring-orange-1
            ${disabled ? 'bg-gray-0 border-gray-3 text-gray-5 cursor-not-allowed' : ''}
        `,
        ghost: `
            bg-yellow-1 hover:bg-yellow-0 active:bg-yellow-6
            text-gray-2 hover:text-gray-0
            focus:ring-yellow-1
            ${disabled ? 'bg-transparent text-gray-5 cursor-not-allowed' : ''}
        `
    };

    // Width styles
    const widthStyles = width ? `w-${width}` : 'w-full';

    // Combine all styles
    const buttonClasses = `
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyles}
        ${disabled ? 'transform-none' : 'hover:scale-105'}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div
            className={`relative ${width ? `w-${width}` : ''} ${height ? `h-${height}` : ''}`}
        >
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={buttonClasses}
            >
                {children}
            </button>
        </div>
    );
};