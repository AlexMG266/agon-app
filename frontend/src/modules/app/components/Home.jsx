import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import users from '../../users';
import teams from '../../teams';
import ProfileAvatar from '../../common/components/ProfileAvatar';
import Table from '../../common/components/Table';
import './Home.css';

const LandingPage = () => {
    return (
        <Container className="mt-5 py-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <Row className="align-items-center g-5">
                <Col lg={5}>
                    <h1 className="display-3 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.03em' }}>
                        Agón
                    </h1>
                    <p className="h4 text-secondary mb-4" style={{ fontWeight: '400', letterSpacing: '-0.01em' }}>
                        La plataforma para organizar y competir en torneos de futbolín
                    </p>
                    <p className="text-muted mb-5" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                        Crea competiciones fácilmente o únete con tu pareja de juego. 
                        Registra resultados al instante, sigue el calendario en tiempo real 
                        y mide tu nivel con el sistema de puntuación ELO.
                    </p>
                    <div className="d-flex gap-3">
                        <Button as={Link} to="/users/login" variant="dark" size="lg" className="rounded-pill px-4">
                            Iniciar Sesión
                        </Button>
                        <Button as={Link} to="/users/signup" variant="outline-dark" size="lg" className="rounded-pill px-4">
                            Registrarse
                        </Button>
                    </div>
                </Col>

                <Col lg={7}>
                    <Table />
                </Col>
            </Row>
        </Container>
    );
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(users.selectors.getUser);
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    const userTeams = useSelector(state => state.teams?.userTeams || []);
    const isLoading = useSelector(state => state.teams?.loading || false);

    useEffect(() => {
        if (loggedIn) {
            dispatch(teams.actions.getMyTeams());
        }
    }, [loggedIn, dispatch]);

    return (
        <div className="home-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-greeting">Hola, {user?.nombre || 'test'}</h1>
                    <p className="dashboard-subtitle">Bienvenido a tu panel de control</p>
                </div>
                <div className="dashboard-actions">
                    <Button as={Link} to="/tournaments" variant="outline-dark" size="sm" className="rounded-pill">
                        Explorar Torneos
                    </Button>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h5>Mis Equipos</h5>
                        <Link to="/teams/create" className="section-action">+ Crear equipo</Link>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="secondary" size="sm" />
                        </div>
                    ) : userTeams.length > 0 ? (
                        <div className="section-list">
                            {userTeams.map((team, index) => (
                                <div key={team.id || index} className="list-item">
                                    <div>
                                        <div className="list-item-title">{team.nombreEquipo || team.nombre}</div>
                                        <div className="list-item-meta">
                                            <span>{team.miembros?.length || 0} miembros</span>
                                            <Badge className="list-item-badge">Activo</Badge>
                                        </div>
                                    </div>
                                    <Link to={`/teams/view/${team.id}`} className="list-item-link">Ver →</Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-text">Aún no tienes equipos</div>
                            <div className="empty-state-help">Crea tu primer equipo para empezar a competir</div>
                            <Link to="/teams/create" className="empty-state-action">Crear equipo →</Link>
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <h5>Mis Torneos</h5>
                        <Link to="/tournaments/create" className="section-action">+ Crear torneo</Link>
                    </div>

                    <div className="empty-state">
                        <div className="empty-state-icon">🏆</div>
                        <div className="empty-state-text">Sin torneos activos</div>
                        <div className="empty-state-help">Únete a un torneo o crea uno nuevo</div>
                        <Link to="/tournaments" className="empty-state-action">Explorar torneos →</Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-footer">
                <div className="footer-card">
                    <div className="profile-summary">
                        <ProfileAvatar
                            imageUrl={user?.imagenPerfil}
                            name={user?.nombre}
                            size={42}
                        />
                        <div className="profile-info">
                            <div className="profile-name">{user?.nombre || 'test'}</div>
                            <div className="profile-email">{user?.email || 'test@domain.com'}</div>
                        </div>
                        <Link to="/users/profile" className="profile-link">Ver perfil →</Link>
                    </div>
                </div>

                <div className="footer-card">
                    <div className="matches-summary">
                        <div className="matches-header">
                            <span className="matches-title">Próximos Encuentros</span>
                            <Badge className="matches-badge">0</Badge>
                        </div>
                        <div className="matches-empty">
                            <div className="matches-empty-text">Sin partidos programados</div>
                            <div className="matches-empty-help">Los encuentros aparecerán aquí cuando tengas competiciones activas</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    return loggedIn ? <Dashboard /> : <LandingPage />;
};

export default Home;