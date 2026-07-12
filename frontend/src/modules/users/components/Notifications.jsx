import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import backend from '../../../backend';
import { getTipoLabel, formatTimestamp, truncateMessage } from './notificationUtils';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await backend.notificationService.getNotifications();
            if (response.ok && response.payload) {
                setNotifications(response.payload);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'UNREAD') return !n.leido;
        if (filter === 'READ') return n.leido;
        return true;
    });

    return (
        <Container className="py-4">
            <Card className="notifications-card border-0 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 fw-semibold">Consultar Notificaciones</h5>
                    <Form.Group className="mb-0">
                        <Form.Select size="sm" value={filter} onChange={handleFilterChange} className="notification-filter bg-light border-0">
                            <option value="ALL">Todo</option>
                            <option value="UNREAD">No leídas</option>
                            <option value="READ">Leídas</option>
                        </Form.Select>
                    </Form.Group>
                </Card.Header>
                <div className="list-group list-group-flush">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center text-muted p-5">
                            <i className="fa-regular fa-bell-slash fs-1 mb-3"></i>
                            <p>No tienes notificaciones en esta categoría.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <Link
                                key={notification.id}
                                to={`/users/notifications/${notification.id}`}
                                className={`list-group-item notification-item notification-link px-4 py-3 ${!notification.leido ? 'unread' : 'read'}`}
                            >
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div className="d-flex align-items-center mb-1">
                                        {!notification.leido && <span className="unread-dot me-2"></span>}
                                        <h6 className="mb-0">{getTipoLabel(notification.tipo)}</h6>
                                        {notification.pendienteDeAccion && (
                                            <span className="badge bg-warning text-dark ms-2 action-badge">Acción pendiente</span>
                                        )}
                                    </div>
                                    <small className="text-muted timestamp">{formatTimestamp(notification.fechaCreacion)}</small>
                                </div>
                                <p className="mb-0 mt-1 ms-3 text-secondary message-preview">{truncateMessage(notification.mensaje)}</p>
                                <div className="mt-1 ms-3">
                                    <small className="text-muted">
                                        <i className="fa-solid fa-chevron-right me-1"></i> Ver detalle
                                    </small>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default Notifications;
