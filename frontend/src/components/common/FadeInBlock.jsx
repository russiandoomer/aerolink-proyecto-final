import { motion } from 'framer-motion';

export default function FadeInBlock({
    children,
    delay = 0,
    className = '',
    y = 18,
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}
