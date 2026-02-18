import { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const ListsPage = () => {
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState(null);
    const [listNews, setListNews] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [parentListId, setParentListId] = useState(''); // '' o ID
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        if (selectedList) {
            fetchNewsInList(selectedList.id);
        }
    }, [selectedList]);

    const fetchLists = async () => {
        try {
            const res = await api.get('/lists');
            setLists(res.data);
        } catch (err) {
            console.error('Error fetching lists', err);
        }
    };

    const fetchNewsInList = async (listId) => {
        setLoading(true);
        try {
            const res = await api.get(`/lists/${listId}/news`);
            setListNews(res.data);
        } catch (err) {
            console.error('Error fetching news', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lists', {
                nombre: newListName,
                parentId: parentListId || null
            });
            setShowCreateModal(false);
            setNewListName('');
            setParentListId('');
            fetchLists();
        } catch (err) {
            alert('Error creating list');
            console.error(err);
        }
    };

    const handleMarkAsRead = async (newsId) => {
        if (!selectedList) return;
        try {
            await api.put(`/lists/${selectedList.id}/news/${newsId}/read`);
            // Actualizar estado local
            setListNews(prev => prev.map(item =>
                item.id === newsId ? { ...item, leida: true } : item
            ));
        } catch (err) {
            console.error(err);
        }
    };

    // Ayudante para renderizar árbol
    const renderListTree = (parentId = null, level = 0) => {
        const filtered = lists.filter(l => l.parentid === parentId);
        if (filtered.length === 0) return null;

        return filtered.map(list => (
            <div key={list.id} style={{ marginLeft: `${level * 20}px` }}>
                <ListGroup.Item
                    action
                    active={selectedList?.id === list.id}
                    onClick={() => setSelectedList(list)}
                    className="border-0 rounded mb-1"
                >
                    {list.nombre}
                </ListGroup.Item>
                {renderListTree(list.id, level + 1)}
            </div>
        ));
    };

    return (
        <DashboardLayout>
            <Row className="h-100">
                {/* Barra lateral para listas */}
                <Col md={4} lg={3} className="bg-light p-3 rounded h-100" style={{ minHeight: '80vh' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Mis Listas</h5>
                        <Button size="sm" onClick={() => setShowCreateModal(true)}>+</Button>
                    </div>
                    <ListGroup variant="flush">
                        {renderListTree(null)}
                    </ListGroup>
                </Col>

                {/* Contenido principal para noticias */}
                <Col md={8} lg={9} className="p-3">
                    {selectedList ? (
                        <>
                            <h2 className="mb-4">{selectedList.nombre}</h2>
                            {loading ? <Spinner animation="border" /> : (
                                <Row>
                                    {listNews.length === 0 ? (
                                        <p className="text-muted">No hay noticias en esta lista.</p>
                                    ) : (
                                        listNews.map(news => (
                                            <Col md={12} key={news.id} className="mb-3">
                                                <Card className={news.leida ? 'opacity-50' : ''}>
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between">
                                                            <Card.Title>{news.titular}</Card.Title>
                                                            {news.leida && <Badge bg="secondary">Leída</Badge>}
                                                        </div>
                                                        <Card.Text>{news.cuerpo}</Card.Text>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <a href={news.url} target="_blank" rel="noopener noreferrer">Leer Original</a>
                                                            {!news.leida && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsRead(news.id)}
                                                                >
                                                                    Marcar Leída
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    )}
                                </Row>
                            )}
                        </>
                    ) : (
                        <div className="text-center mt-5 text-muted">
                            <h4>Selecciona una lista para ver sus noticias</h4>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal para crear lista */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Lista</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateList}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={newListName}
                                onChange={e => setNewListName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Lista Padre (Opcional)</Form.Label>
                            <Form.Select
                                value={parentListId}
                                onChange={e => setParentListId(e.target.value)}
                            >
                                <option value="">Ninguna (Raíz)</option>
                                {lists.map(l => (
                                    <option key={l.id} value={l.id}>{l.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button type="submit">Crear</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </DashboardLayout>
    );
};

export default ListsPage;
