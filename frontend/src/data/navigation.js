import {
    Building2,
    LayoutDashboard,
    Map,
    Plane,
    PlaneTakeoff,
    Route,
    Ticket,
    Users,
} from 'lucide-react';

export const navigationItems = [
    {
        label: 'Dashboard',
        to: '/',
        icon: LayoutDashboard,
        description: 'Resumen operativo',
    },
    {
        label: 'Vuelos',
        to: '/vuelos',
        icon: PlaneTakeoff,
        description: 'Programacion y estados',
    },
    {
        label: 'Reservas',
        to: '/reservas',
        icon: Ticket,
        description: 'Control comercial',
    },
    {
        label: 'Pasajeros',
        to: '/pasajeros',
        icon: Users,
        description: 'Manifiesto y registros',
    },
    {
        label: 'Rutas',
        to: '/rutas',
        icon: Route,
        description: 'Trayectos disponibles',
    },
    {
        label: 'Aeropuertos',
        to: '/aeropuertos',
        icon: Map,
        description: 'Puntos de operacion',
    },
    {
        label: 'Flota',
        to: '/flota',
        icon: Plane,
        description: 'Aviones y capacidad',
    },
    {
        label: 'Aerolineas',
        to: '/aerolineas',
        icon: Building2,
        description: 'Operadores del sistema',
    },
];
