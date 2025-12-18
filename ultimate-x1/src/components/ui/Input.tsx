import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          bg-dark-950/50 border border-gold-600/30 text-gold-300 
          px-4 py-2 outline-none focus:border-hextech-400 focus:shadow-[0_0_10px_rgba(10,200,185,0.2)]
          placeholder-gray-600 transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
        </div>
    );
}
