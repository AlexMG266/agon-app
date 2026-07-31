import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes, NavLink, useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import AppGlobalComponents from './AppGlobalComponents';
import Home from './Home';
import { Login, SignUp, Profile, Logout, Notifications } from '../../users';
import { CreateTeam, TeamDetail, TeamInfo, JoinTeam } from '../../teams';
import { CreateTournament, TournamentDetail, BrowseTournaments, MyMatches } from '../../tournaments';
import MyTournaments from '../../tournaments/components/MyTournaments';
import MyTeams from '../../teams/components/MyTeams';
import ForbiddenPage from '../../common/components/ForbiddenPage';
import NotFoundPage from '../../common/components/NotFoundPage';
import users from '../../users';
import './Body.css';

const SIDEBAR_STORAGE_KEY = 'agon_sidebar_collapsed';

const Body = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        return saved === 'true';
    });

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    const isNotificationRoute = location.pathname.startsWith('/users/notifications');

    return (
        <div className={`main-layout-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <AppGlobalComponents />

            {loggedIn && (
                <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.competition" defaultMessage="Competición" /></span>
                        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                            <i className="fa-solid fa-chart-simple"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.dashboard" defaultMessage="Panel Principal" /></span>
                        </NavLink>
                        <NavLink to="/matches/my" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-days"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.myMatches" defaultMessage="Mis Partidos" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.myTeams" defaultMessage="Equipos" /></span>
                        <NavLink to="/teams/my" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-users"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.myTeams" defaultMessage="Equipos" /></span>
                        </NavLink>
                        <NavLink to="/teams/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-plus"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.createTeam" defaultMessage="Crear equipo" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.myTournaments" defaultMessage="Torneos" /></span>
                        <NavLink to="/tournaments/browse" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-compass"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.browseTournaments" defaultMessage="Explorar" /></span>
                        </NavLink>
                        <NavLink to="/tournaments/my" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-trophy"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.myTournaments" defaultMessage="Mis Torneos" /></span>
                        </NavLink>
                        <NavLink to="/tournaments/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-plus"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.createTournament" defaultMessage="Crear torneo" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.alertCenter" defaultMessage="Centro de Alertas" /></span>
                        <NavLink to="/users/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-bell"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.notifications" defaultMessage="Notificaciones" /></span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group mt-auto">
                        <span className="sidebar-title"><FormattedMessage id="project.app.sidebar.account" defaultMessage="Cuenta" /></span>
                        <NavLink to="/users/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-user-gear"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.profileSettings" defaultMessage="Ajustes de Perfil" /></span>
                        </NavLink>
                        <NavLink to="/users/logout" className="sidebar-link text-danger-hover">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <span className="sidebar-label"><FormattedMessage id="project.app.sidebar.logout" defaultMessage="Cerrar Sesión" /></span>
                        </NavLink>
                    </div>

                    <button
                        className="sidebar-collapse-btn"
                        onClick={toggleSidebar}
                        title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                    >
                        <i className={`fa-solid fa-chevron-left ${collapsed ? 'rotated' : ''}`}></i>
                        <span className="sidebar-label">
                            <FormattedMessage id="project.app.sidebar.collapse" defaultMessage="Colapsar" />
                        </span>
                    </button>
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
                    {loggedIn && <Route path="/teams/my" element={<MyTeams />} />}
                    {loggedIn && <Route path="/teams/create" element={<CreateTeam />} />}
                    {loggedIn && <Route path="/teams/view/:id" element={<TeamDetail />} />}
                    {loggedIn && <Route path="/teams/info/:id" element={<TeamInfo />} />}
                    {loggedIn && <Route path="/teams/join" element={<JoinTeam />} />}
                    {loggedIn && <Route path="/tournaments/my" element={<MyTournaments />} />}
                    {loggedIn && <Route path="/tournaments/create" element={<CreateTournament />} />}
                    {loggedIn && <Route path="/matches/my" element={<MyMatches />} />}
                    {loggedIn && <Route path="/tournaments/browse" element={<BrowseTournaments />} />}
                    {loggedIn && <Route path="/tournaments/view/:id" element={<TournamentDetail />} />}
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
