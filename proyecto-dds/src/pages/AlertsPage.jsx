import { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Row, Col } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [alertsRes, subsRes] = await Promise.all([
                api.get('/alerts'),
                api.get('/alerts/subscriptions')
            ]);
            setAlerts(alertsRes.data);
            setSubscriptions(subsRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId) => {
        try {
            await api.put(`/alerts/${alertId}/read`);
            setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, leida: true } : a));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSubscription = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta alerta?')) return;
        try {
            await api.delete(`/alerts/subscriptions/${id}`);
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout>
            <h2 className="mb-4">Gestión de Alertas</h2>

            {loading ? <Spinner animation="border" /> : (
                <>
                    {/* Sección 1: Suscripciones activas */}
                    <Card className="mb-5 border-0 shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Mis Suscripciones Activas</h5>
                            <small className="text-muted">Recibirás notificaciones sobre estos temas</small>
                        </Card.Header>
                        <Card.Body>
                            {subscriptions.length === 0 ? (
                                <p className="text-muted text-center py-3">No tienes suscripciones activas.</p>
                            ) : (
                                <Row>
                                    {subscriptions.map(sub => (
                                        <Col md={6} lg={4} key={sub.id} className="mb-3">
                                            <Card className="h-100 border-light bg-light">
                                                <Card.Body className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="mb-1 text-primary">Tag: "{sub.cadena}"</h6>
                                                        <small className="text-muted">Creada: {new Date(sub.fechabusqueda).toLocaleDateString()}</small>
                                                    </div>
                                                    <Button variant="outline-danger" size="sm" onClick={() => deleteSubscription(sub.id)}>
                                                        Eliminar
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Sección 2: Notificaciones */}
                    <h4 className="mb-3">Notificaciones Recibidas</h4>
                    <Row>
                        {alerts.length === 0 ? (
                            <Col>
                                <Card className="text-center p-4 text-muted bg-transparent border-dashed">
                                    <p className="mb-0">No hay notificaciones nuevas.</p>
                                </Card>
                            </Col>
                        ) : (
                            alerts.map(alert => (
                                <Col md={12} key={alert.id} className="mb-2">
                                    <Card className={alert.leida ? 'bg-light opacity-75' : 'border-start border-4 border-primary shadow-sm'}>
                                        <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                            <div>
                                                {!alert.leida && <Badge bg="danger" className="me-2">Nueva</Badge>}
                                                <span className={alert.leida ? 'text-muted' : 'fw-bold'}>{alert.mensaje}</span>
                                                <span className="text-muted small ms-2">
                                                    - {new Date(alert.fecha).toLocaleString()}
                                                </span>
                                            </div>
                                            {!alert.leida && (
                                                <Button variant="link" size="sm" onClick={() => markAsRead(alert.id)}>
                                                    Marcar leída
                                                </Button>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </>
            )}
        </DashboardLayout>
    );
};

export default AlertsPage;
