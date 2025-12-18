import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
    const baseStyle = "font-display font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group border cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-hextech-900 border-hextech-400 text-hextech-400 hover:bg-hextech-400 hover:text-dark-950 hover:shadow-[0_0_20px_rgba(10,200,185,0.4)]",
        secondary: "bg-dark-800 border-gold-500 text-gold-400 hover:border-gold-300 hover:text-gold-300 hover:shadow-[0_0_15px_rgba(200,170,110,0.3)]",
        danger: "bg-red-950/50 border-red-600 text-red-500 hover:bg-red-900 hover:text-red-300",
        ghost: "bg-transparent border-transparent text-gray-400 hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-3 text-base md:px-10" // Responsivo
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

            {/* Glow Effect on Hover */}
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-hextech-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            )}
        </button>
    );
}
