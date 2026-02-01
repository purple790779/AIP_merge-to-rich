import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GameButtonProps {
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    className?: string;
}

export function GameButton({
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'md',
    children,
    className = ''
}: GameButtonProps) {
    const baseStyles = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
        secondary: 'bg-white/10 text-white border border-white/20',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    };

    const sizeStyles = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileTap={disabled ? {} : { scale: 0.95 }}
            whileHover={disabled ? {} : { scale: 1.02 }}
            onClick={onClick}
            disabled={disabled}
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
        >
            {children}
        </motion.button>
    );
}
