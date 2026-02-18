import { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Card, Row, Col, Spinner, Badge, Modal } from 'react-bootstrap';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

function HomePage() {
    const [query, setQuery] = useState('');
    const [news, setNews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estado del modal de listas
    const [showListModal, setShowListModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [userLists, setUserLists] = useState([]);
    const [targetListId, setTargetListId] = useState('');

    useEffect(() => {
        // Obtener listas para el desplegable del modal
        const fetchLists = async () => {
            try {
                const res = await api.get('/lists');
                setUserLists(res.data);
            } catch (err) {
                console.error('Error loading lists', err);
            }
        };
        fetchLists();
    }, []);

    const searchNews = async (e) => {
        e?.preventDefault(); // Manejar envío del formulario
        if (!query) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/news/search?q=${query}`);
            setNews(response.data);
        } catch (err) {
            setError('No se encontraron noticias o hubo un error en la búsqueda.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlert = async () => {
        if (!query) return;
        try {
            await api.post('/alerts', { query });
            alert(`Alerta creada exitosamente para "${query}"`);
        } catch (err) {
            console.error(err);
            alert('Error al crear la alerta');
        }
    };

    const handleOpenListModal = (article) => {
        setSelectedArticle(article);
        setTargetListId(userLists.length > 0 ? userLists[0].id : '');
        setShowListModal(true);
    };

    const handleAddToList = async () => {
        if (!targetListId || !selectedArticle) return;

        try {
            await api.post(`/lists/${targetListId}/news`, {
                titular: selectedArticle.title || selectedArticle.titular,
                cuerpo: selectedArticle.description || selectedArticle.cuerpo || '',
                fecha: selectedArticle.publishedAt || selectedArticle.fecha,
                idioma: 'es', // ¿Por defecto o detectar? La API no siempre da un idioma limpio
                tema: 'General',
                url: selectedArticle.url,
                fuente: selectedArticle.source?.name || selectedArticle.fuente || 'Unknown'
            });
            setShowListModal(false);
            alert('Noticia guardada exitosamente!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la noticia');
        }
    };

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h2 mb-1">Explorar Noticias</h1>
                    <p className="text-muted">Busca y descubre las últimas novedades</p>
                </div>
            </div>

            <Card className="mb-5 p-4 border-0 shadow-sm bg-white">
                <Form onSubmit={searchNews}>
                    <InputGroup size="lg">
                        <Form.Control
                            placeholder="Ej: Tecnología, Deportes, Política..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="border-0 bg-light"
                            style={{ paddingLeft: '20px' }}
                        />
                        <Button variant="primary" type="submit" disabled={loading} className="px-5 fw-bold">
                            {loading ? <Spinner animation="border" size="sm" /> : 'Buscar'}
                        </Button>
                    </InputGroup>
                </Form>
            </Card>

            {error && (
                <div className="text-center py-5">
                    <p className="text-danger lead">{error}</p>
                </div>
            )}

            {!loading && !error && news.length === 0 && query && (
                <div className="text-center py-5">
                    <h4 className="text-muted mb-3">No se encontraron noticias para "{query}"</h4>
                    <p className="mb-4">¿Quieres recibir una notificación cuando aparezca algo nuevo?</p>
                    <Button variant="outline-primary" onClick={handleCreateAlert}>
                        Crear Alerta para "{query}"
                    </Button>
                </div>
            )}

            <Row>
                {news.map((article, index) => (
                    <Col md={6} lg={4} xl={4} key={index} className="mb-4">
                        <Card className="h-100">
                            {/* Marcador de posición para imagen si tuviéramos una, si no solo texto */}
                            <div style={{ height: '6px', backgroundColor: '#0d6efd' }}></div>
                            <Card.Body className="d-flex flex-column">
                                <div className="mb-2">
                                    <Badge bg="light" text="dark" className="me-2">{article.source?.name || article.fuente || 'Fuente desconocida'}</Badge>
                                    <small className="text-muted">{article.publishedAt || article.fecha ? new Date(article.publishedAt || article.fecha).toLocaleDateString() : 'Reciente'}</small>
                                </div>
                                <Card.Title className="mb-3">{article.title || article.titular}</Card.Title>
                                <Card.Text className="flex-grow-1">
                                    {(article.description || article.cuerpo || '').substring(0, 120) + '...'}
                                </Card.Text>
                                <div className="mt-3 d-flex gap-2">
                                    <Button href={article.url} target="_blank" variant="outline-primary" className="flex-grow-1">
                                        Leer completa
                                    </Button>
                                    <Button variant="outline-secondary" onClick={() => handleOpenListModal(article)}>
                                        + Lista
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal para agregar a lista */}
            <Modal show={showListModal} onHide={() => setShowListModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Guardar en Lista</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Selecciona una lista</Form.Label>
                            <Form.Select
                                value={targetListId}
                                onChange={(e) => setTargetListId(e.target.value)}
                            >
                                {userLists.map(l => (
                                    <option key={l.id} value={l.id}>{l.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowListModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAddToList}>Guardar</Button>
                </Modal.Footer>
            </Modal>
        </DashboardLayout>
    );
}

export default HomePage;
