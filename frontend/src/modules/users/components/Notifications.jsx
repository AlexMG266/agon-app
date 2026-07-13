import { useState, useEffect } from 'react';
import { Link } from 'react-router';
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
        <div className="notifications-wrapper">
            <header className="notifications-header">
                <h3>Notificaciones</h3>
                <select value={filter} onChange={handleFilterChange} className="custom-select">
                    <option value="ALL">Todas</option>
                    <option value="UNREAD">No leídas</option>
                    <option value="READ">Leídas</option>
                </select>
            </header>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-regular fa-bell-slash"></i>
                        <p>No tienes notificaciones en esta categoría.</p>
                    </div>
                ) : (
                    filteredNotifications.map(n => (
                        <Link key={n.id} to={`/users/notifications/${n.id}`} className="notification-card">
                            <div className="notification-meta">
                                {!n.leido && <span className="unread-indicator" />}
                                <span className="notification-type">{getTipoLabel(n.tipo)}</span>
                                <span className="timestamp">{formatTimestamp(n.fechaCreacion)}</span>
                            </div>
                            <div className="notification-content">
                                <h5 className="notification-subject">{n.asunto}</h5>
                                <p className="notification-body">{truncateMessage(n.cuerpo)}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;