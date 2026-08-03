import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from "react-bootstrap/Container";

import app from '..';
import users from '../../users';
import backend from '../../../backend';
import { NOTIFICATIONS_UPDATED_EVENT } from '../../../backend/notificationService';
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '../../../i18n';
import './Header.css';

const Header = ({ mobileDrawerOpen, onToggleMobileDrawer, onCloseMobileDrawer }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const user = useSelector(users.selectors.getUser);
    const locale = useSelector(app.selectors.getLocale);
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const prevUnreadRef = useRef(0);
    const [popupData, setPopupData] = useState(null);
    const popupRef = useRef(null);
    const iconRef = useRef(null);
    const hideTimerRef = useRef(null);

    const clearPopup = useCallback(() => {
        setPopupData(null);
    }, []);

    useEffect(() => {
        if (!popupData) return;
        const handleClickOutside = (e) => {
            if (
                popupRef.current && !popupRef.current.contains(e.target) &&
                iconRef.current && !iconRef.current.contains(e.target)
            ) {
                clearPopup();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popupData, clearPopup]);

    // Auto-hide popup after 5 seconds
    useEffect(() => {
        if (!popupData) return;
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(clearPopup, 5000);
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [popupData, clearPopup]);

    const fetchUnreadCount = useCallback(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        backend.notificationService.getUnreadCount().then(response => {
            if (response.ok && typeof response.payload === 'number') {
                const unread = response.payload;
                const prev = prevUnreadRef.current;
                prevUnreadRef.current = unread;

                if (unread > prev) {
                    // carga la primera pagina para obtener la notificacion mas reciente sin leer
                    backend.notificationService.getNotifications(0, 1).then(notifResponse => {
                        if (notifResponse.ok && notifResponse.payload) {
                            const latestUnread = (notifResponse.payload.items || [])
                                .filter(n => !n.leido)[0];
                            setPopupData({
                                key: Date.now(),
                                subject: latestUnread?.asunto || intl.formatMessage({
                                    id: 'project.app.Header.newNotification',
                                    defaultMessage: 'Tienes una nueva notificación'
                                }),
                                body: latestUnread?.cuerpo || ''
                            });
                        }
                    }).catch(() => { });
                }
                setUnreadCount(unread);
            }
        }).catch(() => { });
    }, [user, intl]);

    useEffect(() => {
        fetchUnreadCount();
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, fetchUnreadCount);

        // Polling: comprobar cada 30 segundos si hay nuevas notificaciones
        const intervalId = setInterval(fetchUnreadCount, 30000);

        return () => {
            window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, fetchUnreadCount);
            clearInterval(intervalId);
        };
    }, [fetchUnreadCount, location.pathname]);

    const getProfileImageUrl = () => {
        if (user?.imagenPerfil) {
            return user.imagenPerfil;
        }
        return null;
    };

    const truncate = (text, max = 60) => {
        if (!text || text.length <= max) return text;
        return text.substring(0, max) + '...';
    };

    const handleLocaleChange = (selectedLocale) => {
        if (SUPPORTED_LOCALES.includes(selectedLocale)) {
            localStorage.setItem(LOCALE_STORAGE_KEY, selectedLocale);
            dispatch(app.actions.setLocale(selectedLocale));
        }
    };

    const localeLabels = {
        es: 'Español',
        gl: 'Galego',
        en: 'English'
    };

    // En móvil, si el drawer lateral está desplegado, al abrir los menús
    // de idioma o perfil se colapsa automáticamente para que se vean.
    const handleDropdownToggle = useCallback((isOpen) => {
        if (isOpen && mobileDrawerOpen) {
            onCloseMobileDrawer?.();
        }
    }, [mobileDrawerOpen, onCloseMobileDrawer]);

    return (
        <Navbar expand="lg" className="smart-topbar py-2">
            <Container fluid className="px-lg-5 d-flex justify-content-between align-items-center">
                
                <div className="d-flex align-items-center gap-2">
                    {user && (
                        <button
                            type="button"
                            className="mobile-menu-btn"
                            onClick={onToggleMobileDrawer}
                            aria-label="Abrir menú de navegación"
                            aria-expanded={mobileDrawerOpen}
                        >
                            <i className={`fa-solid ${mobileDrawerOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                        </button>
                    )}
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
                        Agón
                    </Navbar.Brand>
                </div>

                <Navbar.Collapse id="navbarSupportedContent">
                    <Nav className="me-auto">
                    </Nav>
                </Navbar.Collapse>

                <div className="d-flex align-items-center gap-1">
                    <NavDropdown
                        title={
                            <span className="navbar-icon-btn d-flex align-items-center justify-content-center">
                                <i className="fa-solid fa-bars fs-5" style={{ color: '#1d1d1f' }}></i>
                            </span>
                        }
                        align="end"
                        id="language-dropdown"
                        onSelect={handleLocaleChange}
                        onToggle={handleDropdownToggle}
                    >
                        <div className="px-3 pt-2 pb-1 text-muted small fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <FormattedMessage id="project.app.Header.language" defaultMessage="Idioma" />
                        </div>
                        {SUPPORTED_LOCALES.map(code => (
                            <NavDropdown.Item
                                key={code}
                                eventKey={code}
                                active={locale === code}
                                className="py-2"
                            >
                                <i className="fa-solid fa-language me-2 text-secondary" style={{ width: '18px', textAlign: 'center' }}></i> {localeLabels[code]}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>

                    {user ? (
                        <>
                            <div className="position-relative" ref={iconRef}>
                                <Nav.Link as={Link} to="/users/notifications" className="navbar-icon-btn position-relative d-flex align-items-center justify-content-center">
                                    <i className={`fa-solid fa-inbox fs-5 ${popupData ? 'inbox-bounce' : ''}`} style={{ color: '#1d1d1f' }}></i>
                                    {unreadCount > 0 && (
                                        <span className="navbar-badge" title="Notificaciones pendientes"></span>
                                    )}
                                </Nav.Link>

                                {/* Popup anclado al icono de notificaciones */}
                                {popupData && (
                                    <div className="notification-popup" ref={popupRef}>
                                        <div className="notification-popup-arrow"></div>
                                        <div className="notification-popup-body">
                                            <div className="notification-popup-header">
                                                <i className="fa-solid fa-bell" style={{ color: '#ff9500' }}></i>
                                                <span className="notification-popup-title">
                                                    <FormattedMessage id="project.app.Header.newNotification" defaultMessage="Nueva notificación" />
                                                </span>
                                            </div>
                                            <div className="notification-popup-subject">{truncate(popupData.subject, 50)}</div>
                                            {popupData.body && (
                                                <div className="notification-popup-preview">{truncate(popupData.body, 80)}</div>
                                            )}
                                            <Link to="/users/notifications" className="notification-popup-link" onClick={clearPopup}>
                                                <FormattedMessage id="project.app.Header.viewNotifications" defaultMessage="Ver notificaciones" />
                                                <i className="fa-solid fa-arrow-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <NavDropdown
                                title={
                                    <div className="profile-nav-container">
                                        {getProfileImageUrl() ? (
                                            <img
                                                src={getProfileImageUrl()}
                                                alt="Profile"
                                                className="profile-nav-image"
                                            />
                                        ) : (
                                            <div 
                                                className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" 
                                                style={{ 
                                                    width: '32px', 
                                                    height: '32px', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.85rem' 
                                                }}
                                            >
                                                {user?.nombre?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}
                                        <span className="profile-username d-none d-sm-inline">{user.nombre}</span>
                                    </div>
                                }
                                align="end"
                                id="user-dropdown"
                                onToggle={handleDropdownToggle}
                            >
                                <div className="px-3 pt-2 pb-1 text-muted small fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <FormattedMessage id="project.app.Header.account" defaultMessage="Cuenta" />
                                </div>
                                <NavDropdown.Item as={Link} to="/users/profile" className="py-2">
                                    <i className="fa-solid fa-user-gear me-2 text-secondary" style={{ width: '18px', textAlign: 'center' }}></i> 
                                    <FormattedMessage id="project.users.Profile.title" defaultMessage="Editar Perfil" />
                                </NavDropdown.Item>

                                <NavDropdown.Divider className="my-1" />

                                <NavDropdown.Item as={Link} to="/users/logout" className="text-danger py-2">
                                    <i className="fa-solid fa-sign-out-alt me-2" style={{ width: '18px', textAlign: 'center' }}></i> 
                                    <FormattedMessage id="project.app.Header.logout" defaultMessage="Cerrar Sesión" />
                                </NavDropdown.Item>
                            </NavDropdown>
                        </>
                    ) : (
                        <Link to="/users/login" className="btn btn-dark btn-sm rounded-pill text-white px-3 py-1" style={{ fontSize: '0.85rem' }}>
                            <FormattedMessage id="project.users.Login.title" defaultMessage="Iniciar Sesión" />
                        </Link>
                    )}
                </div>

            </Container>
        </Navbar>
    );
};

export default Header;
