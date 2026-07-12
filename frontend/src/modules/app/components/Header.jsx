import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from "react-bootstrap/Container";
import Badge from 'react-bootstrap/Badge';

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

        <Navbar bg="light" expand="lg" className="border-bottom">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">Agón</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarSupportedContent" className="mb-3" />
                <Navbar.Collapse id="navbarSupportedContent">

                    {user ? (
                        <Nav className="ms-auto align-items-center">

                            <Nav.Link as={Link} to="/users/notifications" className="navbar-icon-btn me-3 position-relative">
                                <i className="fa-solid fa-inbox fs-4" style={{ color: 'var(--apple-text)' }}></i>
                                {unreadCount > 0 && (
                                    <span className="navbar-badge" title="Unread notifications"></span>
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
                                            <div className="profile-nav-placeholder">
                                                <i className="fa-solid fa-user"></i>
                                            </div>
                                        )}
                                        <span className="profile-username">{user.nombre}</span>
                                    </div>
                                }
                                align="end"
                                id="user-dropdown"
                            >
                                <NavDropdown.Item as={Link} to="/users/profile">
                                    <i className="fa-solid fa-user me-2"></i> <FormattedMessage id="project.users.Profile.title" />
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/users/notifications">
                                    <i className="fa-solid fa-bell me-2"></i> Consultar Notificaciones
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/users/logout">
                                    <i className="fa-solid fa-sign-out-alt me-2"></i> <FormattedMessage id="project.app.Header.logout" />
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    ) : (
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/users/login">
                                <FormattedMessage id="project.users.Login.title" />
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>

    );

};

export default Header;
