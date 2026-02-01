import { motion } from 'framer-motion';
import { IoPlayCircle } from 'react-icons/io5';

interface AdButtonProps {
    onClick: () => void;
}

export function AdButton({ onClick }: AdButtonProps) {
    return (
        <motion.button
            className="ad-floating-button"
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <IoPlayCircle />
            <div className="ad-floating-label">{'\uBD80\uC2A4\uD2B8'}</div>
            {/* Pulse ring */}
            <motion.div
                className="ad-floating-pulse"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
        </motion.button>
    );
}
