import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
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
        console.log('Acción pendiente:', notification.tipo, notification.referenciaId);
    };

    if (loading) {
        return (
            <div className="notifications-wrapper text-center p-5 text-muted">
                <i className="fa-solid fa-spinner fa-spin fs-3 mb-3"></i>
                <p>Cargando notificación…</p>
            </div>
        );
    }

    if (notFound || !notification) {
        return (
            <div className="notifications-wrapper">
                <Link to="/users/notifications" className="detail-header-back">
                    <i className="fa-solid fa-arrow-left me-2"></i> Volver a notificaciones
                </Link>
                <div className="notification-card detail-view text-center p-5 text-muted">
                    <i className="fa-regular fa-bell-slash fs-1 mb-3"></i>
                    <p>Notificación no encontrada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-wrapper">
            <Link to="/users/notifications" className="detail-header-back">
                <i className="fa-solid fa-arrow-left me-2"></i> Volver a notificaciones
            </Link>

            <div className="notification-card detail-view">
                <div className="notification-meta">
                    {!notification.leido && <span className="unread-dot" />}
                    <span className="notification-type">{getTipoLabel(notification.tipo)}</span>
                    <span className="timestamp">{formatTimestamp(notification.fechaCreacion)}</span>
                </div>

                <div className="notification-content">
                    <h5 className="notification-subject">{notification.asunto}</h5>
                    <p className="notification-full-body">{notification.cuerpo}</p>
                </div>

                {notification.pendienteDeAccion && (
                    <div className="action-container">
                        <Button variant="primary" size="sm" onClick={handleAction}>
                            {getActionLabel(notification.tipo)}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDetail;