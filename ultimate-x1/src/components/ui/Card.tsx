import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    glow?: boolean;
}

export function Card({ children, className = "", glow = false }: CardProps) {
    return (
        <div className={`
      relative bg-dark-900/80 backdrop-blur-md border border-gold-600/30 
      p-4 md:p-6 shadow-xl overflow-hidden
      ${glow ? 'shadow-[0_0_30px_rgba(10,200,185,0.1)] border-hextech-400/50' : ''}
      ${className}
    `}>
            {/* Decorative Corners (Hextech Style) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold-400/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold-400/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold-400/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold-400/50" />

            {children}
        </div>
    );
}
