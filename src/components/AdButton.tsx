import { motion } from 'framer-motion';
import { IoPlayCircle } from 'react-icons/io5';

interface AdButtonProps {
    onClick: () => void;
    variant?: 'default' | 'compact';
}

export function AdButton({ onClick, variant = 'default' }: AdButtonProps) {
    const isCompact = variant === 'compact';

    return (
        <motion.button
            className={`ad-floating-button${isCompact ? ' is-compact' : ''}`}
            onClick={onClick}
            aria-label="부스트"
            title="부스트"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <IoPlayCircle />
            {!isCompact && (
                <motion.div
                    className="ad-floating-pulse"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </motion.button>
    );
}
