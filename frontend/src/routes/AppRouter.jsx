import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';
import DashboardLayout from '../layouts/DashboardLayout';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VuelosPage = lazy(() => import('../pages/VuelosPage'));
const ReservasPage = lazy(() => import('../pages/ReservasPage'));
const PasajerosPage = lazy(() => import('../pages/PasajerosPage'));
const RutasPage = lazy(() => import('../pages/RutasPage'));
const AeropuertosPage = lazy(() => import('../pages/AeropuertosPage'));
const SimulacionPage = lazy(() => import('../pages/SimulacionPage'));
const FlotaPage = lazy(() => import('../pages/FlotaPage'));
const AerolineasPage = lazy(() => import('../pages/AerolineasPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export default function AppRouter() {
    return (
        <Suspense fallback={<LoadingState label="Cargando modulo..." />}>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/vuelos" element={<VuelosPage />} />
                    <Route path="/reservas" element={<ReservasPage />} />
                    <Route path="/pasajeros" element={<PasajerosPage />} />
                    <Route path="/rutas" element={<RutasPage />} />
                    <Route path="/aeropuertos" element={<AeropuertosPage />} />
                    <Route path="/simulacion" element={<SimulacionPage />} />
                    <Route path="/flota" element={<FlotaPage />} />
                    <Route path="/aerolineas" element={<AerolineasPage />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
