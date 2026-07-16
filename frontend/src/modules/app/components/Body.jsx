import { useSelector } from 'react-redux';
import { Route, Routes, NavLink, useLocation } from 'react-router';
import AppGlobalComponents from './AppGlobalComponents';
import Home from './Home';
import { Login, SignUp, Profile, Logout, Notifications, NotificationDetail } from '../../users';
import { CreateTeam } from '../../teams';
import users from '../../users';
import './Body.css';

const Body = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    const location = useLocation(); // obtener la ruta actual

    const isNotificationRoute = location.pathname.startsWith('/users/notifications');

    return (
        <div className="main-layout-wrapper">
            <AppGlobalComponents />

            {loggedIn && (
                <aside className="app-sidebar">
                    <div className="sidebar-group">
                        <span className="sidebar-title">Competición</span>
                        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                            <i className="fa-solid fa-chart-simple"></i>
                            <span>Panel Principal</span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group">
                        <span className="sidebar-title">Centro de Alertas</span>
                        <NavLink to="/users/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-bell"></i>
                            <span>Notificaciones</span>
                        </NavLink>
                    </div>

                    <div className="sidebar-group mt-auto">
                        <span className="sidebar-title">Cuenta</span>
                        <NavLink to="/users/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-user-gear"></i>
                            <span>Ajustes de Perfil</span>
                        </NavLink>
                        <NavLink to="/users/logout" className="sidebar-link text-danger-hover">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Cerrar Sesión</span>
                        </NavLink>
                    </div>
                </aside>
            )}

            <main
                key={location.pathname}
                className={`app-content-area animate-page-entry ${isNotificationRoute ? 'no-padding' : ''}`}
            >
                <Routes>
                    <Route path="/*" element={<Home />} />
                    {loggedIn && <Route path="/users/profile" element={<Profile />} />}
                    {loggedIn && <Route path="/users/notifications" element={<Notifications />} />}
                    {loggedIn && <Route path="/users/notifications/:notificationId" element={<NotificationDetail />} />}
                    {loggedIn && <Route path="/users/logout" element={<Logout />} />}

                    {loggedIn && <Route path="/teams/create" element={<CreateTeam />} />}

                    {!loggedIn && <Route path="/users/login" element={<Login />} />}
                    {!loggedIn && <Route path="/users/signup" element={<SignUp />} />}
                </Routes>
            </main>
        </div>
    );
};

export default Body;