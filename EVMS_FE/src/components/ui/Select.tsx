interface SelectProps {
    // Define props for Select component here
    id?: string;
    name: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    width?: number;
    height?: number;
    label: string;
    option: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    id,
    name,
    value,
    onChange,
    width,
    height,
    label,
    option
}) => {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div
            className={`relative ${width ? `w-${width}` : ''} ${height ? `h-${height}` : ''}`}
        >
            <select
                name={name}
                id={id || name}
                onChange={handleChange}
                value={value}
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
            >
                {option.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <label
                htmlFor={id || name}
                className={`
                    absolute left-3 transition-all duration-200 ease-in-out cursor-text
                    top-1 text-xs text-orange-0 font-medium`}
            >
                {label}
            </label>
        </div>
    )
}
