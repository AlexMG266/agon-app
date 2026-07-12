import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import backend from '../../../backend';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

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
        return true; // ALL
    });

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                            <div key={notification.id} className={`list-group-item notification-item px-4 py-3 ${!notification.leido ? 'unread' : 'read'}`}>
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div className="d-flex align-items-center mb-1">
                                        {!notification.leido && <span className="unread-dot me-2"></span>}
                                        <h6 className="mb-0">{notification.tipo === 'SYSTEM' ? 'Sistema' : 'Aviso'}</h6>
                                    </div>
                                    <small className="text-muted timestamp">{formatTimestamp(notification.fechaCreacion)}</small>
                                </div>
                                <p className="mb-0 mt-1 ms-3 text-secondary message-text">{notification.mensaje}</p>
                                {notification.pendienteDeAccion && (
                                    <div className="mt-2 ms-3">
                                        <button className="btn btn-sm btn-outline-primary action-btn">Revisar</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default Notifications;
