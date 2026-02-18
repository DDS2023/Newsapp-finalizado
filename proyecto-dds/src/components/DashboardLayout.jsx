import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Dropdown, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../api/axios';

function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [recentAlerts, setRecentAlerts] = useState([]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Noticias', path: '/' },
        { label: 'Mis Listas', path: '/lists' },
        { label: 'Alertas', path: '/alerts' },
        { label: 'Monitoreo', path: '/monitoring' },
        { label: 'Configuración', path: '/settings' },
    ];

    useEffect(() => {
        if (user) {
            fetchRecentAlerts();
        }
    }, [user, location.pathname]); // Refrescar al cambiar de navegación

    const fetchRecentAlerts = async () => {
        try {
            const res = await api.get('/alerts');
            // Filtrar última semana
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const recent = res.data.filter(a => new Date(a.fecha) > oneWeekAgo && !a.leida);
            setRecentAlerts(recent);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Barra lateral */}
            <aside className="sidebar">
                <div className="mb-4 px-2 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold text-primary mb-0">NewsApp</h3>
                        {user && <small className="text-muted d-block mt-2">Hola, {user.nombre}</small>}
                    </div>
                </div>

                {/* Área de notificaciones (Desplegable simple) */}
                <div className="mb-4 px-2">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm" className="w-100 d-flex justify-content-between align-items-center">
                            🔔 Notificaciones
                            {recentAlerts.length > 0 && <Badge bg="danger" pill>{recentAlerts.length}</Badge>}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100 shadow">
                            <Dropdown.Header>Última Semana</Dropdown.Header>
                            {recentAlerts.length === 0 ? (
                                <Dropdown.Item disabled>Sin nuevas alertas</Dropdown.Item>
                            ) : (
                                recentAlerts.slice(0, 5).map(alert => (
                                    <Dropdown.Item key={alert.id} as={Link} to="/alerts" className="text-wrap small">
                                        {alert.mensaje.substring(0, 50)}...
                                    </Dropdown.Item>
                                ))
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item as={Link} to="/alerts" className="text-center small">Ver todas</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <nav className="flex-grow-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item-custom ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto">
                    {user ? (
                        <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    ) : (
                        <div className="d-grid gap-2">
                            <Button variant="primary" as={Link} to="/login">Iniciar Sesión</Button>
                            <Button variant="outline-primary" as={Link} to="/register">Registrarse</Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Área de contenido principal */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
