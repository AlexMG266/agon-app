import { useState, useEffect, useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import TeamInfoModal from '../../teams/components/TeamInfoModal';
import './Notifications.css';

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

const Notifications = () => {
    const intl = useIntl();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const [respondiendoId, setRespondiendoId] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingConfirmAction, setPendingConfirmAction] = useState(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [modalEquipoId, setModalEquipoId] = useState(null);

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

    const handleSelectNotification = useCallback(async (id) => {
        setLoadingDetail(true);
        setActionFeedback(null);
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

    const handleResponderSolicitud = async (solicitudId, aceptar) => {
        setRespondiendoId(solicitudId);
        setActionFeedback(null);
        try {
            const response = await backend.teamService.respondToRequest(solicitudId, aceptar);

            if (response.ok) {
                setActionFeedback({
                    type: 'success',
                    message: aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.accepted', defaultMessage: 'Solicitud aceptada correctamente' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.rejected', defaultMessage: 'Solicitud rechazada correctamente' })
                });

                // Marcar la notificación como sin acción pendiente localmente
                setSelectedNotification(prev => prev ? { ...prev, pendienteDeAccion: false } : prev);

                // Recargar notificaciones para reflejar el cambio
                const notifResponse = await backend.notificationService.getNotifications();
                if (notifResponse.ok) {
                    setNotifications(notifResponse.payload);
                    // Actualizar la notificación seleccionada si sigue visible
                    const updatedNotif = notifResponse.payload.find(n => n.id === selectedNotification?.id);
                    if (updatedNotif) {
                        setSelectedNotification(prev => ({ ...prev, ...updatedNotif, pendienteDeAccion: false }));
                    } else {
                        setSelectedNotification(null);
                    }
                }
            } else {
                const errorMsg = response.payload?.message || response.payload?.error ||
                    (aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.acceptError', defaultMessage: 'No se pudo aceptar la solicitud' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.rejectError', defaultMessage: 'No se pudo rechazar la solicitud' }));
                setActionFeedback({
                    type: 'error',
                    message: errorMsg
                });
            }
        } catch (error) {
            console.error('Error respondiendo solicitud:', error);
            setActionFeedback({
                type: 'error',
                message: intl.formatMessage({ id: 'project.notifications.feedback.connectionError', defaultMessage: 'Error de conexión al responder la solicitud' })
            });
        } finally {
            setRespondiendoId(null);
        }
    };

    const isTipoInvitacion = (tipo) => {
        const typeUpper = tipo?.toUpperCase() || '';
        return typeUpper.includes('INVITACION') || typeUpper.includes('INVITATION');
    };

    const isTipoInscripcion = (tipo) => {
        const typeUpper = tipo?.toUpperCase() || '';
        return typeUpper.includes('SOLICITUD_INSCRIPCION');
    };

    const isTipoAplazamiento = (tipo) => {
        const typeUpper = tipo?.toUpperCase() || '';
        return typeUpper.includes('SOLICITUD_APLAZAMIENTO');
    };

    const handleResponderInscripcion = async (solicitudId, aceptar) => {
        setRespondiendoId(solicitudId);
        setActionFeedback(null);
        try {
            // Primero obtenemos la solicitud para saber el torneoId
            const solicitudResp = await backend.tournamentService.getSolicitud(solicitudId);
            if (!solicitudResp.ok || !solicitudResp.payload) {
                setActionFeedback({
                    type: 'error',
                    message: intl.formatMessage({ id: 'project.notifications.feedback.loadError', defaultMessage: 'No se pudo cargar la solicitud' })
                });
                setRespondiendoId(null);
                return;
            }
            const torneoId = solicitudResp.payload.torneoId;
            if (!torneoId) {
                setActionFeedback({
                    type: 'error',
                    message: intl.formatMessage({ id: 'project.notifications.feedback.torneoError', defaultMessage: 'No se pudo identificar el torneo' })
                });
                setRespondiendoId(null);
                return;
            }

            const response = aceptar
                ? await backend.tournamentService.approveEnrollment(torneoId, solicitudId)
                : await backend.tournamentService.rejectEnrollment(torneoId, solicitudId);

            if (response.ok) {
                setActionFeedback({
                    type: 'success',
                    message: aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.inscripcionAccepted', defaultMessage: 'Inscripción aceptada correctamente' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.inscripcionRejected', defaultMessage: 'Inscripción rechazada correctamente' })
                });

                // Marcar la notificación como sin acción pendiente localmente
                setSelectedNotification(prev => prev ? { ...prev, pendienteDeAccion: false } : prev);

                // Recargar notificaciones
                const notifResponse = await backend.notificationService.getNotifications();
                if (notifResponse.ok) {
                    setNotifications(notifResponse.payload);
                    const updatedNotif = notifResponse.payload.find(n => n.id === selectedNotification?.id);
                    if (updatedNotif) {
                        setSelectedNotification(prev => ({ ...prev, ...updatedNotif, pendienteDeAccion: false }));
                    } else {
                        setSelectedNotification(null);
                    }
                }
            } else {
                const errorMsg = response.payload?.message || response.payload?.error ||
                    (aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.acceptError', defaultMessage: 'No se pudo aceptar la solicitud' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.rejectError', defaultMessage: 'No se pudo rechazar la solicitud' }));
                setActionFeedback({
                    type: 'error',
                    message: errorMsg
                });
            }
        } catch (error) {
            console.error('Error respondiendo solicitud de inscripción:', error);
            setActionFeedback({
                type: 'error',
                message: intl.formatMessage({ id: 'project.notifications.feedback.connectionError', defaultMessage: 'Error de conexión al responder la solicitud' })
            });
        } finally {
            setRespondiendoId(null);
        }
    };

    const handleResponderAplazamiento = async (solicitudId, aceptar) => {
        setRespondiendoId(solicitudId);
        setActionFeedback(null);
        try {
            const response = await backend.tournamentService.responderAplazamiento(solicitudId, aceptar);

            if (response.ok) {
                setActionFeedback({
                    type: 'success',
                    message: aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.aplazamientoAccepted', defaultMessage: 'Aplazamiento aceptado correctamente' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.aplazamientoRejected', defaultMessage: 'Aplazamiento rechazado correctamente' })
                });

                // Marcar la notificación como sin acción pendiente localmente
                setSelectedNotification(prev => prev ? { ...prev, pendienteDeAccion: false } : prev);

                // Recargar notificaciones para reflejar el cambio
                const notifResponse = await backend.notificationService.getNotifications();
                if (notifResponse.ok) {
                    setNotifications(notifResponse.payload);
                    const updatedNotif = notifResponse.payload.find(n => n.id === selectedNotification?.id);
                    if (updatedNotif) {
                        setSelectedNotification(prev => ({ ...prev, ...updatedNotif, pendienteDeAccion: false }));
                    } else {
                        setSelectedNotification(null);
                    }
                }
            } else {
                const errorMsg = response.payload?.message || response.payload?.error ||
                    (aceptar
                        ? intl.formatMessage({ id: 'project.notifications.feedback.acceptError', defaultMessage: 'No se pudo aceptar la solicitud' })
                        : intl.formatMessage({ id: 'project.notifications.feedback.rejectError', defaultMessage: 'No se pudo rechazar la solicitud' }));
                setActionFeedback({
                    type: 'error',
                    message: errorMsg
                });
            }
        } catch (error) {
            console.error('Error respondiendo solicitud de aplazamiento:', error);
            setActionFeedback({
                type: 'error',
                message: intl.formatMessage({ id: 'project.notifications.feedback.connectionError', defaultMessage: 'Error de conexión al responder la solicitud' })
            });
        } finally {
            setRespondiendoId(null);
        }
    };

    const handleVerEquipo = async (solicitudId) => {
        try {
            const solicitudResp = await backend.tournamentService.getSolicitud(solicitudId);
            if (solicitudResp.ok && solicitudResp.payload?.equipoId) {
                setModalEquipoId(solicitudResp.payload.equipoId);
                setShowTeamModal(true);
            } else {
                setActionFeedback({
                    type: 'error',
                    message: intl.formatMessage({ id: 'project.notifications.feedback.loadError', defaultMessage: 'No se pudo cargar la información del equipo' })
                });
            }
        } catch (error) {
            console.error('Error cargando solicitud:', error);
            setActionFeedback({
                type: 'error',
                message: intl.formatMessage({ id: 'project.notifications.feedback.connectionError', defaultMessage: 'Error de conexión' })
            });
        }
    };

    // === Modal de confirmación ===
    const handleShowConfirm = (solicitudId, aceptar, type) => {
        setPendingConfirmAction({ solicitudId, aceptar, type });
        setShowConfirmModal(true);
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setPendingConfirmAction(null);
    };

    const handleConfirmAction = () => {
        if (!pendingConfirmAction) return;
        const { solicitudId, aceptar, type } = pendingConfirmAction;
        setShowConfirmModal(false);
        setPendingConfirmAction(null);

        if (type === 'invitacion') {
            handleResponderSolicitud(solicitudId, aceptar);
        } else if (type === 'inscripcion') {
            handleResponderInscripcion(solicitudId, aceptar);
        } else if (type === 'aplazamiento') {
            handleResponderAplazamiento(solicitudId, aceptar);
        }
    };

    const getConfirmModalConfig = () => {
        if (!pendingConfirmAction) return { title: '', description: '', confirmText: '', variant: 'primary' };
        const { aceptar, type } = pendingConfirmAction;

        if (type === 'invitacion') {
            return {
                title: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptInvitationTitle', defaultMessage: '¿Aceptar invitación?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectInvitationTitle', defaultMessage: '¿Rechazar invitación?' }),
                description: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptInvitationDesc', defaultMessage: 'Vas a aceptar la invitación al equipo. ¿Estás seguro?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectInvitationDesc', defaultMessage: 'Vas a rechazar la invitación al equipo. ¿Estás seguro?' }),
                confirmText: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.accept', defaultMessage: 'Aceptar' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.reject', defaultMessage: 'Rechazar' }),
                variant: aceptar ? 'primary' : 'danger'
            };
        } else if (type === 'inscripcion') {
            return {
                title: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptInscripcionTitle', defaultMessage: '¿Aceptar inscripción?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectInscripcionTitle', defaultMessage: '¿Rechazar inscripción?' }),
                description: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptInscripcionDesc', defaultMessage: 'Vas a aceptar la inscripción del equipo en el torneo. ¿Estás seguro?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectInscripcionDesc', defaultMessage: 'Vas a rechazar la inscripción del equipo en el torneo. ¿Estás seguro?' }),
                confirmText: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.accept', defaultMessage: 'Aceptar' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.reject', defaultMessage: 'Rechazar' }),
                variant: aceptar ? 'primary' : 'danger'
            };
        } else if (type === 'aplazamiento') {
            return {
                title: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptAplazamientoTitle', defaultMessage: '¿Aceptar el aplazamiento?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectAplazamientoTitle', defaultMessage: '¿Rechazar el aplazamiento?' }),
                description: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.acceptAplazamientoDesc', defaultMessage: 'Vas a aceptar el aplazamiento del encuentro. ¿Estás seguro?' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.rejectAplazamientoDesc', defaultMessage: 'Vas a rechazar el aplazamiento del encuentro. ¿Estás seguro?' }),
                confirmText: aceptar
                    ? intl.formatMessage({ id: 'project.notifications.confirm.accept', defaultMessage: 'Aceptar' })
                    : intl.formatMessage({ id: 'project.notifications.confirm.reject', defaultMessage: 'Rechazar' }),
                variant: aceptar ? 'primary' : 'danger'
            };
        }
        return { title: '', description: '', confirmText: '', variant: 'primary' };
    };

    const confirmModalConfig = useMemo(() => getConfirmModalConfig(), [pendingConfirmAction, intl]);

    const getTipoLabel = (tipo) => {
        const typeUpper = tipo?.toUpperCase() || '';
        if (typeUpper.includes('SISTEMA') || typeUpper.includes('SYSTEM')) return intl.formatMessage({ id: 'project.notifications.types.system', defaultMessage: 'Sistema' });
        if (typeUpper.includes('INVITACION') || typeUpper.includes('INVITATION') || typeUpper.includes('TEAM')) return intl.formatMessage({ id: 'project.notifications.types.invitation', defaultMessage: 'Invitación' });
        if (typeUpper.includes('SOLICITUD_INSCRIPCION')) return intl.formatMessage({ id: 'project.notifications.types.inscripcion', defaultMessage: 'Inscripción' });
        if (typeUpper.includes('SOLICITUD_APLAZAMIENTO')) return intl.formatMessage({ id: 'project.notifications.types.aplazamiento', defaultMessage: 'Aplazamiento' });
        if (typeUpper.includes('PARTIDO') || typeUpper.includes('MATCH')) return intl.formatMessage({ id: 'project.notifications.types.match', defaultMessage: 'Partido' });
        if (typeUpper.includes('TORNEO') || typeUpper.includes('TOURNAMENT')) return intl.formatMessage({ id: 'project.notifications.types.tournament', defaultMessage: 'Torneo' });
        return intl.formatMessage({ id: 'project.notifications.types.generic', defaultMessage: 'Notificación' });
    };

    const getActionLabel = (tipo) => {
        const typeUpper = tipo?.toUpperCase() || '';
        if (typeUpper.includes('INVITACION')) return intl.formatMessage({ id: 'project.notifications.actions.respondInvitation', defaultMessage: 'Responder invitación' });
        if (typeUpper.includes('SOLICITUD_APLAZAMIENTO')) return intl.formatMessage({ id: 'project.notifications.actions.respondAplazamiento', defaultMessage: 'Responder aplazamiento' });
        if (typeUpper.includes('PARTIDO')) return intl.formatMessage({ id: 'project.notifications.actions.viewMatch', defaultMessage: 'Ver partido' });
        if (typeUpper.includes('TORNEO')) return intl.formatMessage({ id: 'project.notifications.actions.viewTournament', defaultMessage: 'Ver torneo' });
        return intl.formatMessage({ id: 'project.notifications.actions.viewDetails', defaultMessage: 'Ver detalles' });
    };

    const getFilterLabel = (filter) => {
        const labels = {
            ALL: intl.formatMessage({ id: 'project.notifications.filter.all', defaultMessage: 'Todas' }),
            UNREAD: intl.formatMessage({ id: 'project.notifications.filter.unread', defaultMessage: 'No leídas' }),
            READ: intl.formatMessage({ id: 'project.notifications.filter.read', defaultMessage: 'Leídas' })
        };
        return labels[filter] || filter;
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
                    <p className="small m-0"><FormattedMessage id="project.notifications.loading" defaultMessage="Cargando notificaciones…" /></p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <div className="notifications-master-panel">
                <header className="master-header">
                    <div className="master-header-top">
                        <h2 className="master-title"><FormattedMessage id="project.notifications.listTitle" defaultMessage="Notificaciones" /></h2>
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
                            <p className="m-0"><FormattedMessage id="project.notifications.empty.noNotifications" defaultMessage="No hay notificaciones" /></p>
                            <small className="text-muted">
                                {filter === 'ALL' ? (
                                    <FormattedMessage id="project.notifications.empty.all" defaultMessage="Todavía no has recibido ninguna notificación" />
                                ) : filter === 'UNREAD' ? (
                                    <FormattedMessage id="project.notifications.empty.unread" defaultMessage="Todas tus notificaciones están leídas" />
                                ) : (
                                    <FormattedMessage id="project.notifications.empty.read" defaultMessage="No tienes notificaciones leídas" />
                                )}
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
                            {markingAsRead ? (
                                <FormattedMessage id="project.notifications.detail.markingAsRead" defaultMessage="Marcando como leída..." />
                            ) : (
                                <FormattedMessage id="project.notifications.detail.loading" defaultMessage="Cargando contenido..." />
                            )}
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
                                <span className="detail-unread-badge"><FormattedMessage id="project.notifications.detail.new" defaultMessage="Nueva" /></span>
                            )}
                        </div>

                        <h3 className="detail-title">{selectedNotification.asunto}</h3>

                        <div className="detail-body">
                            {selectedNotification.cuerpo}
                        </div>

                        {/* Feedback de la acción */}
                        {actionFeedback && (
                            <div className={`detail-feedback ${actionFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'}`}>
                                <i className={`fa-solid ${actionFeedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2`}></i>
                                {actionFeedback.message}
                            </div>
                        )}

                        {/* Botones de acción para inscripciones en torneo */}
                        {selectedNotification.pendienteDeAccion && isTipoInscripcion(selectedNotification.tipo) && (
                            <div className="detail-actions-buttons">
                                <Button
                                    onClick={() => handleVerEquipo(selectedNotification.referenciaId)}
                                    variant="outline-secondary"
                                    className="btn-action-details me-2"
                                    disabled={respondiendoId !== null}
                                >
                                    <i className="fa-solid fa-eye me-2"></i>
                                    <FormattedMessage id="project.notifications.detail.viewTeam" defaultMessage="Ver detalles" />
                                </Button>
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, true, 'inscripcion')}
                                    className="btn-action-accept"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.accept" defaultMessage="Aceptar" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, false, 'inscripcion')}
                                    variant="outline-danger"
                                    className="btn-action-reject"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-xmark me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.reject" defaultMessage="Rechazar" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Botones de acción para invitaciones (PROPUESTA/PETICION) */}
                        {selectedNotification.pendienteDeAccion && isTipoInvitacion(selectedNotification.tipo) && (
                            <div className="detail-actions-buttons">
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, true, 'invitacion')}
                                    className="btn-action-accept"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.accept" defaultMessage="Aceptar" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, false, 'invitacion')}
                                    variant="outline-danger"
                                    className="btn-action-reject"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-xmark me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.reject" defaultMessage="Rechazar" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Botones de acción para solicitudes de aplazamiento */}
                        {selectedNotification.pendienteDeAccion && isTipoAplazamiento(selectedNotification.tipo) && (
                            <div className="detail-actions-buttons">
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, true, 'aplazamiento')}
                                    className="btn-action-accept"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.accept" defaultMessage="Aceptar" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleShowConfirm(selectedNotification.referenciaId, false, 'aplazamiento')}
                                    variant="outline-danger"
                                    className="btn-action-reject"
                                    disabled={respondiendoId !== null}
                                >
                                    {respondiendoId === selectedNotification.referenciaId ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-xmark me-2"></i>
                                            <FormattedMessage id="project.notifications.detail.reject" defaultMessage="Rechazar" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Botón de acción genérico para otros tipos */}
                        {selectedNotification.pendienteDeAccion && !isTipoInvitacion(selectedNotification.tipo) && !isTipoInscripcion(selectedNotification.tipo) && !isTipoAplazamiento(selectedNotification.tipo) && (
                            <div className="detail-actions">
                                <Button
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
                        <p className="m-0"><FormattedMessage id="project.notifications.empty.select" defaultMessage="Selecciona una notificación" /></p>
                        <small className="text-muted"><FormattedMessage id="project.notifications.empty.selectHelp" defaultMessage="para leer su contenido" /></small>
                    </div>
                )}
            </div>
                {/* Modal de confirmación para aceptar/rechazar */}
                <ConfirmationModal
                    show={showConfirmModal}
                    onHide={handleCancelConfirm}
                    onConfirm={handleConfirmAction}
                    title={confirmModalConfig.title}
                    description={confirmModalConfig.description}
                    confirmText={confirmModalConfig.confirmText}
                    variant={confirmModalConfig.variant}
                    isSubmitting={respondiendoId !== null}
                />

                {/* Modal de información del equipo (popup) */}
                <TeamInfoModal
                    show={showTeamModal}
                    equipoId={modalEquipoId}
                    onHide={() => {
                        setShowTeamModal(false);
                        setModalEquipoId(null);
                    }}
                />
            </div>
        );
    };

    export default Notifications;
