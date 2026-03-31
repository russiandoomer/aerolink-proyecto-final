import { Bell, Menu, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { navigationItems } from '../data/navigation';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const currentSection = useMemo(() => {
        return (
            navigationItems.find((item) => item.to === location.pathname) ??
            navigationItems[0]
        );
    }, [location.pathname]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="app-shell">
            <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
                <div className="brand-block">
                    <div className="brand-mark">AL</div>
                    <div>
                        <h1>AeroLink</h1>
                        <p>Centro logistico aereo</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={18} />
                                <span>
                                    <strong>{item.label}</strong>
                                    <small>{item.description}</small>
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footnote">
                    <span>Panel academico</span>
                    <strong>Laravel + React</strong>
                </div>
            </aside>

            {sidebarOpen ? (
                <button
                    type="button"
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Cerrar menu"
                />
            ) : null}

            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-primary">
                        <button
                            type="button"
                            className="icon-button mobile-only"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menu"
                        >
                            <Menu size={18} />
                        </button>

                        <div>
                            <span className="eyebrow">Panel operativo</span>
                            <h2>{currentSection.label}</h2>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <div className="topbar-search">
                            <Search size={16} />
                            <span>Simulacion y control de vuelos</span>
                        </div>

                        <button
                            type="button"
                            className="icon-button"
                            aria-label="Notificaciones"
                        >
                            <Bell size={18} />
                        </button>
                    </div>
                </header>

                <motion.div
                    key={location.pathname}
                    className="page-body"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
