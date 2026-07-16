import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from "react-bootstrap/Container";

import users from '../../users';
import backend from '../../../backend';
import { NOTIFICATIONS_UPDATED_EVENT } from '../../../backend/notificationService';
import './Header.css';

const Header = () => {
    const user = useSelector(users.selectors.getUser);
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        backend.notificationService.getNotifications().then(response => {
            if (response.ok && response.payload) {
                const unread = response.payload.filter(n => !n.leido).length;
                setUnreadCount(unread);
            }
        }).catch(() => { });
    }, [user]);

    useEffect(() => {
        fetchUnreadCount();
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, fetchUnreadCount);
        return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, fetchUnreadCount);
    }, [fetchUnreadCount, location.pathname]);

    const getProfileImageUrl = () => {
        if (user?.imagenPerfil) {
            return user.imagenPerfil;
        }
        return null;
    };

    return (
        <Navbar expand="lg" className="smart-topbar py-2">
            <Container fluid className="px-lg-5 d-flex justify-content-between align-items-center">
                
                <Navbar.Brand as={Link} to="/" className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
                    Agón
                </Navbar.Brand>

                <Navbar.Collapse id="navbarSupportedContent">
                    <Nav className="me-auto">
                    </Nav>
                </Navbar.Collapse>

                <div className="d-flex align-items-center gap-1">
                    {user ? (
                        <>
                            <Nav.Link as={Link} to="/users/notifications" className="navbar-icon-btn position-relative d-flex align-items-center justify-content-center">
                                <i className="fa-solid fa-inbox fs-5" style={{ color: '#1d1d1f' }}></i>
                                {unreadCount > 0 && (
                                    <span className="navbar-badge" title="Notificaciones pendientes"></span>
                                )}
                            </Nav.Link>

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
                            >
                                <div className="px-3 pt-2 pb-1 text-muted small fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Cuenta
                                </div>
                                <NavDropdown.Item as={Link} to="/users/profile" className="py-2">
                                    <i className="fa-solid fa-user-gear me-2 text-secondary" style={{ width: '18px', textAlign: 'center' }}></i> 
                                    <FormattedMessage id="project.users.Profile.title" defaultMessage="Editar Perfil" />
                                </NavDropdown.Item>

                                <NavDropdown.Divider className="my-1" />

                                <div className="px-3 pt-2 pb-1 text-muted small fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Competición
                                </div>
                                <NavDropdown.Item as={Link} to="/users/stats" className="py-2">
                                    <i className="fa-solid fa-chart-line me-2 text-secondary" style={{ width: '18px', textAlign: 'center' }}></i> 
                                    Mi Historial y ELO
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