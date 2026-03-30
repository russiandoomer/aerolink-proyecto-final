const COLORS = {
    blue: 'status-blue',
    cyan: 'status-cyan',
    indigo: 'status-indigo',
    amber: 'status-amber',
    emerald: 'status-emerald',
    red: 'status-red',
    slate: 'status-slate',
    success: 'status-emerald',
    warning: 'status-amber',
    danger: 'status-red',
};

export default function StatusBadge({ label, tone = 'slate' }) {
    const className = COLORS[tone] ?? COLORS.slate;

    return <span className={`status-badge ${className}`}>{label}</span>;
}
