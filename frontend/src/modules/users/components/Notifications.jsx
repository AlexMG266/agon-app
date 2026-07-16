import { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';
import { getTipoLabel, getActionLabel, formatTimestamp, truncateMessage } from './notificationUtils';
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

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        const initNotifications = async () => {
            setLoadingList(true);
            try {
                const response = await backend.notificationService.getNotifications();
                if (response.ok && response.payload) {
                    setNotifications(response.payload);
                    if (response.payload.length > 0) {
                        await handleSelectNotification(response.payload[0].id, response.payload);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingList(false);
            }
        };
        initNotifications();
    }, []);

    const handleSelectNotification = async (id) => {
        setLoadingDetail(true);
        try {
            const response = await backend.notificationService.getNotification(id);
            if (response.ok && response.payload) {
                let updatedNotification = response.payload;
                setSelectedNotification(updatedNotification);

                if (!updatedNotification.leido) {
                    const readResponse = await backend.notificationService.markAsRead(id);
                    if (readResponse.ok && readResponse.payload) {
                        updatedNotification = readResponse.payload;
                        setSelectedNotification(updatedNotification);
                    }
                    setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, leido: true } : n)
                    );
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleAction = () => {
        if (selectedNotification) {
            console.log('Acción pendiente:', selectedNotification.tipo, selectedNotification.referenciaId);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'UNREAD') return !n.leido;
        if (filter === 'READ') return n.leido;
        return true;
    });

    if (loadingList) {
        return (
            <div className="notifications-loading-container d-flex justify-content-center align-items-center">
                <div className="text-center text-muted">
                    <Spinner animation="border" variant="secondary" className="mb-3" />
                    <p className="small m-0">Cargando notificaciones…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-master-detail">
            <div className="notifications-master-panel">
                <header className="master-header">
                    <h2 className="master-title">Notificaciones</h2>

                    <div className="filter-pill-container">
                        <button
                            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            Todas
                        </button>
                        <button
                            className={`filter-pill ${filter === 'UNREAD' ? 'active' : ''}`}
                            onClick={() => setFilter('UNREAD')}
                        >
                            No leídas
                        </button>
                        <button
                            className={`filter-pill ${filter === 'READ' ? 'active' : ''}`}
                            onClick={() => setFilter('READ')}
                        >
                            Leídas
                        </button>
                    </div>
                </header>

                <div className="master-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-state-master">
                            <i className="fa-regular fa-bell-slash mb-3"></i>
                            <p className="m-0">No tienes notificaciones en esta categoría.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(n => {
                            const isSelected = selectedNotification?.id === n.id;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleSelectNotification(n.id)}
                                    className={`master-notification-card ${isSelected ? 'selected' : ''} ${!n.leido ? 'unread' : ''}`}
                                >
                                    {!n.leido && <span className="unread-pulse-dot" />}

                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(n.tipo)}
                                    </div>

                                    <div className="notification-card-content">
                                        <div className="notification-card-meta">
                                            <span className="card-type-label">
                                                {getTipoLabel(n.tipo)}
                                            </span>
                                            <span className="card-timestamp">
                                                {formatTimestamp(n.fechaCreacion)}
                                            </span>
                                        </div>
                                        <h5 className="card-subject">{n.asunto}</h5>
                                        <p className="card-body-text">
                                            {truncateMessage(n.cuerpo)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="notifications-detail-panel">
                {loadingDetail ? (
                    <div className="detail-loading-state">
                        <Spinner animation="border" variant="secondary" size="sm" className="mb-2" />
                        <p className="small text-muted m-0">Cargando contenido...</p>
                    </div>
                ) : selectedNotification ? (
                    <div className="detail-view-wrapper">
                        <div className="detail-header">
                            <div className="detail-header-left">
                                <div className="detail-icon-wrapper">
                                    {getNotificationIcon(selectedNotification.tipo)}
                                </div>
                                <div>
                                    <span className="detail-type-label">
                                        {getTipoLabel(selectedNotification.tipo)}
                                    </span>
                                    <span className="detail-timestamp">
                                        {formatTimestamp(selectedNotification.fechaCreacion)}
                                    </span>
                                </div>
                            </div>
                            {!selectedNotification.leido && (
                                <span className="badge rounded-pill bg-primary px-3 py-1 text-white">
                                    Nuevo
                                </span>
                            )}
                        </div>

                        <h3 className="detail-title">{selectedNotification.asunto}</h3>

                        <p className="detail-body">
                            {selectedNotification.cuerpo}
                        </p>

                        {selectedNotification.pendienteDeAccion && (
                            <div className="detail-action-container">
                                <Button
                                    onClick={handleAction}
                                    className="btn-action-primary"
                                >
                                    <i className="fa-solid fa-bolt me-2"></i>
                                    {getActionLabel(selectedNotification.tipo)}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="detail-empty-state">
                        <i className="fa-regular fa-envelope-open mb-3"></i>
                        <p className="m-0">Selecciona una notificación para leer su contenido.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;