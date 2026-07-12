import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';
import { getTipoLabel, getActionLabel, formatTimestamp } from './notificationUtils';
import './Notifications.css';

const NotificationDetail = () => {
    const { notificationId } = useParams();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchNotification = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const response = await backend.notificationService.getNotification(notificationId);
                if (response.ok && response.payload) {
                    setNotification(response.payload);
                    if (!response.payload.leido) {
                        const readResponse = await backend.notificationService.markAsRead(notificationId);
                        if (readResponse.ok && readResponse.payload) {
                            setNotification(readResponse.payload);
                        }
                    }
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error(error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNotification();
    }, [notificationId]);

    const handleAction = () => {
        // Las acciones concretas se implementarán según el tipo y referenciaId
        console.log('Acción pendiente:', notification.tipo, notification.referenciaId);
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center text-muted p-5">
                    <i className="fa-solid fa-spinner fa-spin fs-3 mb-3"></i>
                    <p>Cargando notificación…</p>
                </div>
            </Container>
        );
    }

    if (notFound || !notification) {
        return (
            <Container className="py-4">
                <Card className="notifications-card border-0 shadow-sm">
                    <Card.Body className="text-center text-muted p-5">
                        <i className="fa-regular fa-bell-slash fs-1 mb-3"></i>
                        <p>Notificación no encontrada.</p>
                        <Link to="/users/notifications" className="btn btn-sm btn-outline-secondary mt-2">
                            <i className="fa-solid fa-arrow-left me-1"></i> Volver
                        </Link>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card className="notifications-card border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom py-3 px-4">
                    <Link to="/users/notifications" className="notification-back-link text-decoration-none">
                        <i className="fa-solid fa-arrow-left me-2"></i> Volver a notificaciones
                    </Link>
                </Card.Header>
                <Card.Body className="px-4 py-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                            {!notification.leido && <span className="unread-dot me-2"></span>}
                            <h5 className="mb-0 fw-semibold">{getTipoLabel(notification.tipo)}</h5>
                        </div>
                        <small className="text-muted timestamp">{formatTimestamp(notification.fechaCreacion)}</small>
                    </div>
                    <p className="notification-detail-message mb-0">{notification.mensaje}</p>
                    {notification.pendienteDeAccion && (
                        <div className="mt-4">
                            <Button variant="primary" className="action-btn-primary" onClick={handleAction}>
                                {getActionLabel(notification.tipo)}
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NotificationDetail;
