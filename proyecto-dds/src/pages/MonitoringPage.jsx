import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spinner, Badge, Button } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const MonitoringPage = () => {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
        // Actualización automática cada 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/monitoring/stats');
            setStats(res.data.stats);
            setLogs(res.data.logs);
        } catch (err) {
            console.error('Error fetching monitoring stats', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadLogs = () => {
        window.open('http://localhost:3000/monitoring/logs/access', '_blank');
    };

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Panel de Monitoreo</h2>
                <Button variant="outline-dark" size="sm" onClick={downloadLogs}>
                    ⬇ Descargar Logs
                </Button>
            </div>

            {/* Tarjetas de estadísticas */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="text-center shadow-sm h-100 border-success">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase mb-2">Tiempo Promedio</h6>
                            <h2 className="display-4 fw-bold text-success">
                                {stats ? Math.round(stats.avg_duration) : '-'} <small className="fs-6 text-muted">ms</small>
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="text-center shadow-sm h-100 border-danger">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase mb-2">Errores</h6>
                            <h2 className="display-4 fw-bold text-danger">
                                {stats ? stats.error_count : '-'}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabla de registros recientes */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom-0 py-3">
                    <h5 className="mb-0">Últimos Accesos</h5>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Método</th>
                            <th>Endpoint</th>
                            <th>Estado</th>
                            <th>Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !stats ? (
                            <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" /></td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">Sin registros aún.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td className="text-muted small">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td>
                                        <Badge bg={log.method === 'GET' ? 'info' : log.method === 'POST' ? 'success' : 'warning'}>
                                            {log.method}
                                        </Badge>
                                    </td>
                                    <td className="font-monospace small">{log.url}</td>
                                    <td>
                                        <Badge bg={log.status >= 400 ? 'danger' : 'success'} pill>
                                            {log.status}
                                        </Badge>
                                    </td>
                                    <td>{log.duration} ms</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </DashboardLayout>
    );
};

export default MonitoringPage;
