// src/modules/app/components/Body.jsx
import { useSelector } from 'react-redux';
import { Route, Routes, NavLink, useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import AppGlobalComponents from './AppGlobalComponents';
import Home from './Home';
import { Login, SignUp, Profile, Logout, Notifications } from '../../users';
import { CreateTeam, TeamDetail, JoinTeam } from '../../teams';
import { CreateTournament } from '../../tournaments';
import ForbiddenPage from '../../common/components/ForbiddenPage';
import NotFoundPage from '../../common/components/NotFoundPage';
import users from '../../users';
import './Body.css';

const Body = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    const location = useLocation();

    const isNotificationRoute = location.pathname.startsWith('/users/notifications');

    return (
        <div className="main-layout-wrapper">
            <AppGlobalComponents />

            {loggedIn && (
                <aside className="app-sidebar">
                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.competition" defaultMessage="Competición" /></span>
                        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                            <i className="fa-solid fa-chart-simple"></i>
                            <span><FormattedMessage id="project.app.sidebar.dashboard" defaultMessage="Panel Principal" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.alertCenter" defaultMessage="Centro de Alertas" /></span>
                        <NavLink to="/users/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-bell"></i>
                            <span><FormattedMessage id="project.app.sidebar.notifications" defaultMessage="Notificaciones" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group mt-auto">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.account" defaultMessage="Cuenta" /></span>
                        <NavLink to="/users/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-user-gear"></i>
                            <span><FormattedMessage id="project.app.sidebar.profileSettings" defaultMessage="Ajustes de Perfil" /></span>
                        </NavLink>
                        <NavLink to="/users/logout" className="sidebar-link text-danger-hover">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <span><FormattedMessage id="project.app.sidebar.logout" defaultMessage="Cerrar Sesión" /></span>
                        </NavLink>
                    </div>
                </aside>
            )}

            <main
                key={location.pathname}
                className={`app-content-area animate-page-entry ${isNotificationRoute ? 'no-padding' : ''}`}
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    {loggedIn && <Route path="/users/profile" element={<Profile />} />}
                    {loggedIn && <Route path="/users/notifications" element={<Notifications />} />}
                    {loggedIn && <Route path="/users/logout" element={<Logout />} />}
                    {loggedIn && <Route path="/teams/create" element={<CreateTeam />} />}
                    {loggedIn && <Route path="/teams/view/:id" element={<TeamDetail />} />}
                    {loggedIn && <Route path="/teams/join" element={<JoinTeam />} />}
                    {loggedIn && <Route path="/tournaments/create" element={<CreateTournament />} />}
                    <Route path="/forbidden" element={<ForbiddenPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                    {!loggedIn && <Route path="/users/login" element={<Login />} />}
                    {!loggedIn && <Route path="/users/signup" element={<SignUp />} />}
                </Routes>
            </main>
        </div>
    );
};

export default Body;