import { motion } from 'framer-motion';

export default function MetricCard({ label, value, detail }) {
    return (
        <motion.article
            className="metric-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
        >
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
        </motion.article>
    );
}
