// src/modules/users/components/Notifications.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';
import './Notifications.css';

const getTipoLabel = (tipo) => {
    const typeUpper = tipo?.toUpperCase() || '';
    if (typeUpper.includes('SISTEMA') || typeUpper.includes('SYSTEM')) return 'Sistema';
    if (typeUpper.includes('INVITACION') || typeUpper.includes('INVITATION') || typeUpper.includes('TEAM')) return 'Invitación';
    if (typeUpper.includes('PARTIDO') || typeUpper.includes('MATCH')) return 'Partido';
    if (typeUpper.includes('TORNEO') || typeUpper.includes('TOURNAMENT')) return 'Torneo';
    return 'Notificación';
};

const getActionLabel = (tipo) => {
    const typeUpper = tipo?.toUpperCase() || '';
    if (typeUpper.includes('INVITACION')) return 'Responder invitación';
    if (typeUpper.includes('PARTIDO')) return 'Ver partido';
    if (typeUpper.includes('TORNEO')) return 'Ver torneo';
    return 'Ver detalles';
};

const formatTimestamp = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    }) + ' ' + d.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

const truncateMessage = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const getNotificationIcon = (tipo) => {
    const typeUpper = tipo?.toUpperCase() || '';
    if (typeUpper.includes('SISTEMA') || typeUpper.includes('SYSTEM')) {
        return <i className="fa-solid fa-circle-info" style={{ color: '#0071e3' }}></i>;
    }
    if (typeUpper.includes('INVITACION') || typeUpper.includes('INVITATION') || typeUpper.includes('TEAM')) {
        return <i className="fa-solid fa-user-plus" style={{ color: '#34c759' }}></i>;
    }
    if (typeUpper.includes('PARTIDO') || typeUpper.includes('MATCH')) {
        return <i className="fa-solid fa-gamepad" style={{ color: '#ff9500' }}></i>;
    }
    if (typeUpper.includes('TORNEO') || typeUpper.includes('TOURNAMENT')) {
        return <i className="fa-solid fa-trophy" style={{ color: '#ff3b30' }}></i>;
    }
    return <i className="fa-solid fa-bell" style={{ color: '#8e8e93' }}></i>;
};

const getFilterLabel = (filter) => {
    const labels = {
        ALL: 'Todas',
        UNREAD: 'No leídas',
        READ: 'Leídas'
    };
    return labels[filter] || filter;
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(false);

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
                console.error('Error cargando notificaciones:', error);
            } finally {
                setLoadingList(false);
            }
        };
        initNotifications();
    }, []);

    const handleSelectNotification = useCallback(async (id, notificationList = notifications) => {
        setLoadingDetail(true);
        try {
            const response = await backend.notificationService.getNotification(id);
            if (response.ok && response.payload) {
                let updatedNotification = response.payload;
                setSelectedNotification(updatedNotification);

                if (!updatedNotification.leido) {
                    setMarkingAsRead(true);
                    try {
                        const readResponse = await backend.notificationService.markAsRead(id);
                        if (readResponse.ok && readResponse.payload) {
                            updatedNotification = readResponse.payload;
                            setSelectedNotification(updatedNotification);
                            setNotifications(prev =>
                                prev.map(n => n.id === id ? { ...n, leido: true } : n)
                            );
                        }
                    } finally {
                        setMarkingAsRead(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error seleccionando notificación:', error);
        } finally {
            setLoadingDetail(false);
        }
    }, [notifications]);

    const handleAction = () => {
        if (selectedNotification) {
            console.log('Acción pendiente:', selectedNotification.tipo, selectedNotification.referenciaId);
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (filter === 'UNREAD') return !n.leido;
            if (filter === 'READ') return n.leido;
            return true;
        });
    }, [notifications, filter]);

    const counts = useMemo(() => ({
        total: notifications.length,
        unread: notifications.filter(n => !n.leido).length,
        read: notifications.filter(n => n.leido).length
    }), [notifications]);

    if (loadingList) {
        return (
            <div className="notifications-loading-container">
                <div className="text-center text-muted">
                    <Spinner animation="border" variant="secondary" className="mb-3" style={{ width: '2rem', height: '2rem' }} />
                    <p className="small m-0">Cargando notificaciones…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <div className="notifications-master-panel">
                <header className="master-header">
                    <div className="master-header-top">
                        <h2 className="master-title">Notificaciones</h2>
                        {counts.unread > 0 && (
                            <span className="unread-count-badge">{counts.unread}</span>
                        )}
                    </div>

                    <div className="filter-container">
                        {['ALL', 'UNREAD', 'READ'].map((key) => (
                            <button
                                key={key}
                                className={`filter-pill ${filter === key ? 'active' : ''}`}
                                onClick={() => setFilter(key)}
                            >
                                {getFilterLabel(key)}
                                {key === 'UNREAD' && counts.unread > 0 && (
                                    <span className="filter-count">{counts.unread}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="master-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-state-master">
                            <i className="fa-regular fa-bell-slash mb-3"></i>
                            <p className="m-0">No hay notificaciones</p>
                            <small className="text-muted">
                                {filter === 'ALL' ? 'Todavía no has recibido ninguna notificación' :
                                 filter === 'UNREAD' ? 'Todas tus notificaciones están leídas' :
                                 'No tienes notificaciones leídas'}
                            </small>
                        </div>
                    ) : (
                        filteredNotifications.map(n => {
                            const isSelected = selectedNotification?.id === n.id;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleSelectNotification(n.id)}
                                    className={`notification-card ${isSelected ? 'selected' : ''} ${!n.leido ? 'unread' : ''}`}
                                >
                                    <div className="notification-card-icon">
                                        {getNotificationIcon(n.tipo)}
                                    </div>

                                    <div className="notification-card-content">
                                        <div className="notification-card-header">
                                            <span className="notification-card-type">
                                                {getTipoLabel(n.tipo)}
                                            </span>
                                            <span className="notification-card-time">
                                                {formatTimestamp(n.fechaCreacion)}
                                            </span>
                                        </div>
                                        <div className="notification-card-subject">{n.asunto}</div>
                                        <div className="notification-card-body">
                                            {truncateMessage(n.cuerpo)}
                                        </div>
                                    </div>

                                    {!n.leido && <span className="unread-dot" />}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="notifications-detail-panel">
                {loadingDetail || markingAsRead ? (
                    <div className="detail-loading">
                        <Spinner animation="border" variant="secondary" size="sm" className="mb-2" />
                        <p className="small text-muted m-0">
                            {markingAsRead ? 'Marcando como leída...' : 'Cargando contenido...'}
                        </p>
                    </div>
                ) : selectedNotification ? (
                    <div className="detail-content">
                        <div className="detail-header">
                            <div className="detail-header-left">
                                <div className="detail-icon">
                                    {getNotificationIcon(selectedNotification.tipo)}
                                </div>
                                <div>
                                    <div className="detail-type">
                                        {getTipoLabel(selectedNotification.tipo)}
                                    </div>
                                    <div className="detail-time">
                                        {formatTimestamp(selectedNotification.fechaCreacion)}
                                    </div>
                                </div>
                            </div>
                            {!selectedNotification.leido && (
                                <span className="detail-unread-badge">Nueva</span>
                            )}
                        </div>

                        <h3 className="detail-title">{selectedNotification.asunto}</h3>

                        <div className="detail-body">
                            {selectedNotification.cuerpo}
                        </div>

                        {selectedNotification.pendienteDeAccion && (
                            <div className="detail-actions">
                                <Button
                                    onClick={handleAction}
                                    className="btn-action-primary"
                                >
                                    <i className="fa-solid fa-arrow-right me-2"></i>
                                    {getActionLabel(selectedNotification.tipo)}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="detail-empty">
                        <i className="fa-regular fa-envelope-open mb-3"></i>
                        <p className="m-0">Selecciona una notificación</p>
                        <small className="text-muted">para leer su contenido</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;