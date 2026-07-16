import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import backend from '../../../backend';
import { getTipoLabel, getActionLabel, formatTimestamp } from './notificationUtils';
import './Notifications.css';

const getNotificationIcon = (tipo) => {
    const typeUpper = tipo?.toUpperCase() || '';
    if (typeUpper.includes('SISTEMA') || typeUpper.includes('SYSTEM')) {
        return <i className="fa-solid fa-circle-info text-primary"></i>;
    }
    if (typeUpper.includes('INVITACION') || typeUpper.includes('INVITATION') || typeUpper.includes('TEAM')) {
        return <i className="fa-solid fa-user-plus text-success"></i>;
    }
    if (typeUpper.includes('PARTIDO') || typeUpper.includes('MATCH')) {
        return <i className="fa-solid fa-gamepad text-warning"></i>;
    }
    if (typeUpper.includes('TORNEO') || typeUpper.includes('TOURNAMENT')) {
        return <i className="fa-solid fa-trophy text-danger"></i>;
    }
    return <i className="fa-solid fa-bell text-secondary"></i>;
};

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
        console.log('Acción pendiente:', notification.tipo, notification.referenciaId);
    };

    if (loading) {
        return (
            <div className="profile-container d-flex justify-content-center">
                <Container className="mt-5 py-5 text-center text-muted" style={{ maxWidth: '700px' }}>
                    <Spinner animation="border" variant="secondary" className="mb-3" />
                    <p className="small">Cargando notificación…</p>
                </Container>
            </div>
        );
    }

    if (notFound || !notification) {
        return (
            <div className="profile-container d-flex justify-content-center">
                <Container className="mt-5 py-2" style={{ maxWidth: '700px' }}>
                    <Link to="/users/notifications" className="btn-back-apple mb-4">
                        <i className="fa-solid fa-arrow-left"></i> Volver a notificaciones
                    </Link>
                    <div className="text-center p-5 border rounded-4 bg-white shadow-sm">
                        <i className="fa-regular fa-bell-slash text-muted mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <p className="text-secondary m-0 fw-medium">Notificación no encontrada.</p>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="profile-container d-flex justify-content-center">
            <Container className="mt-5 py-2" style={{ maxWidth: '700px' }}>

                <Link to="/users/notifications" className="btn-back-apple mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Volver a notificaciones
                </Link>

                <Card className="border rounded-4 shadow-sm" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                    <Card.Body className="p-4 p-md-5">

                        {/* Cabecera del Detalle */}
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="notification-icon-container rounded-3 border bg-light d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                                    {getNotificationIcon(notification.tipo)}
                                </div>
                                <div>
                                    <span className="notification-type text-uppercase fw-bold text-muted d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                        {getTipoLabel(notification.tipo)}
                                    </span>
                                    <span className="timestamp text-muted small">{formatTimestamp(notification.fechaCreacion)}</span>
                                </div>
                            </div>
                            {!notification.leido && (
                                <span className="badge rounded-pill bg-primary px-3 py-1" style={{ fontSize: '0.7rem' }}>
                                    Nuevo
                                </span>
                            )}
                        </div>

                        <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em', fontWeight: '700' }}>
                            {notification.asunto}
                        </h4>

                        <p className="text-secondary mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                            {notification.cuerpo}
                        </p>

                        {notification.pendienteDeAccion && (
                            <div className="d-flex justify-content-end pt-4 border-top">
                                <Button
                                    onClick={handleAction}
                                    className="btn-apple-dark rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
                                    style={{ fontWeight: '500', fontSize: '0.9rem' }}
                                >
                                    <i className="fa-solid fa-bolt"></i>
                                    {getActionLabel(notification.tipo)}
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default NotificationDetail;