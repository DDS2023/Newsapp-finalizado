import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        idiomaPreferido: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                dni: user.dni || '',
                idiomaPreferido: user.idiomaPreferido || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.put('/auth/profile', formData);
            updateUser(response.data.user);
            setStatus({ type: 'success', message: 'Perfil actualizado correctamente' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'danger', message: 'Error al actualizar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-4">
                <h1 className="h2">Configuración de Usuario</h1>
                <p className="text-muted">Gestiona tus datos personales y preferencias</p>
            </div>

            <Card className="border-0 shadow-sm p-4" style={{ maxWidth: '800px' }}>
                {status.message && (
                    <Alert variant={status.type} onClose={() => setStatus({ type: '', message: '' })} dismissible>
                        {status.message}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group controlId="nombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group controlId="apellido">
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled // A menudo el email no es editable o requiere validación especial
                        />
                        <Form.Text className="text-muted">
                            El email no se puede cambiar directamente.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="dni">
                        <Form.Label>DNI</Form.Label>
                        <Form.Control
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="idiomaPreferido">
                        <Form.Label>Idiomas Preferidos de Noticias</Form.Label>
                        <div className="d-flex gap-3 flex-wrap">
                            {['es', 'en', 'fr', 'pt'].map((lang) => (
                                <Form.Check
                                    key={lang}
                                    type="checkbox"
                                    label={lang === 'es' ? 'Español' : lang === 'en' ? 'Inglés' : lang === 'fr' ? 'Francés' : 'Portugués'}
                                    value={lang}
                                    checked={formData.idiomaPreferido.split(',').includes(lang)}
                                    onChange={(e) => {
                                        const currentLangs = formData.idiomaPreferido ? formData.idiomaPreferido.split(',').filter(l => l) : [];
                                        let newLangs;
                                        if (e.target.checked) {
                                            newLangs = [...currentLangs, lang];
                                        } else {
                                            newLangs = currentLangs.filter(l => l !== lang);
                                        }
                                        setFormData({ ...formData, idiomaPreferido: newLangs.join(',') });
                                    }}
                                />
                            ))}
                        </div>
                        <Form.Text className="text-muted">
                            Selecciona uno o más idiomas para filtrar tus búsquedas.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" disabled={loading} className="px-4">
                            {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </DashboardLayout>
    );
}

export default SettingsPage;
