import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import users from '../../users';
import teams from '../../teams';
import tournaments from '../../tournaments';
import MyMatches from '../../tournaments/components/MyMatches';
import Table from '../../common/components/Table';
import JoinTeamModal from './JoinTeamModal';
import CodeSearchModal from './CodeSearchModal';
import CreateTeamModal from '../../teams/components/CreateTeam';
import EloStats from './EloStats';
import './Home.css';

const LandingPage = () => {
    return (
        <Container className="home-landing mt-5 py-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <Row className="align-items-center g-5">
                <Col lg={5}>
                    <h1 className="display-3 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.03em' }}>
                        Agón
                    </h1>
                    <p className="h4 text-secondary mb-4" style={{ fontWeight: '400', letterSpacing: '-0.01em' }}>
                        <FormattedMessage id="project.app.Home.landingHero.title" defaultMessage="La plataforma para organizar y competir en torneos de futbolín" />
                    </p>
                    <p className="text-muted mb-5" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                        <FormattedMessage id="project.app.Home.landingHero.description" defaultMessage="Crea competiciones fácilmente o únete con tu pareja de juego. Registra resultados al instante, sigue el calendario en tiempo real y mide tu nivel con el sistema de puntuación ELO." />
                    </p>
                    <div className="d-flex gap-3">
                        <Button as={Link} to="/users/login" variant="dark" size="lg" className="rounded-pill px-4">
                            <FormattedMessage id="project.app.Home.landingHero.login" defaultMessage="Iniciar Sesión" />
                        </Button>
                        <Button as={Link} to="/users/signup" variant="outline-dark" size="lg" className="rounded-pill px-4">
                            <FormattedMessage id="project.app.Home.landingHero.signup" defaultMessage="Registrarse" />
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

const TEAM_PAGE_SIZE = 4;
const TOURNAMENT_PAGE_SIZE = 4;

const Dashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(users.selectors.getUser);
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    const userTeams = useSelector(state => state.teams?.userTeams || []);
    const teamsLoading = useSelector(state => state.teams?.loading || false);
    const userTournaments = useSelector(state => state.tournaments?.userTournaments || []);
    const teamsCount = userTeams.length;
    const tournamentsCount = userTournaments.length;

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [teamPage, setTeamPage] = useState(1);
    const [tournamentPage, setTournamentPage] = useState(1);

    const teamTotalPages = Math.ceil(teamsCount / TEAM_PAGE_SIZE);
    const tournamentTotalPages = Math.ceil(tournamentsCount / TOURNAMENT_PAGE_SIZE);
    const paginatedTeams = userTeams.slice((teamPage - 1) * TEAM_PAGE_SIZE, teamPage * TEAM_PAGE_SIZE);
    const paginatedTournaments = userTournaments.slice((tournamentPage - 1) * TOURNAMENT_PAGE_SIZE, tournamentPage * TOURNAMENT_PAGE_SIZE);

    useEffect(() => {
        if (loggedIn) {
            dispatch(teams.actions.getMyTeams());
            dispatch(tournaments.actions.getMyTournaments());
        }
    }, [loggedIn, dispatch]);

    useEffect(() => {
        setTeamPage(1);
        setTournamentPage(1);
    }, [teamsCount, tournamentsCount]);

    const statItems = [
        { icon: '🏆', labelId: 'project.app.Home.dashboard.stats.teams', defaultMsg: '{count} equipos', count: teamsCount },
        { icon: '📅', labelId: 'project.app.Home.dashboard.stats.tournaments', defaultMsg: '{count} torneos', count: tournamentsCount },
    ];

    return (
        <div className="home-dashboard">
            {/* ── Top Bar: Greeting + Stats ── */}
            <div className="dashboard-topbar">
                <div className="dashboard-greeting-block">
                    <h1 className="dashboard-greeting">
                        <FormattedMessage id="project.app.Home.dashboard.greeting" defaultMessage="Hola, {name}" values={{ name: user?.nombre || 'test' }} />
                    </h1>
                    <p className="dashboard-subtitle">
                        <FormattedMessage id="project.app.Home.dashboard.subtitle" defaultMessage="Bienvenido a tu panel de control" />
                    </p>
                </div>
                <div className="dashboard-stats">
                    {statItems.map((item, i) => (
                        <span key={i} className="stat-item">
                            <span className="stat-icon">{item.icon}</span>
                            <span className="stat-label">
                                <FormattedMessage id={item.labelId} defaultMessage={item.defaultMsg} values={{ count: item.count }} />
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="dashboard-actions-row">
                <button className="action-link action-link-btn" onClick={() => setShowCreateTeamModal(true)}>
                    <span className="action-link-icon">+</span>
                    <FormattedMessage id="project.app.Home.dashboard.createTeam" defaultMessage="Crear equipo" />
                </button>
                <span className="action-separator"></span>
                <Link to="/tournaments/create" className="action-link">
                    <span className="action-link-icon">+</span>
                    <FormattedMessage id="project.app.Home.dashboard.createTournament" defaultMessage="Crear torneo" />
                </Link>
                <span className="action-separator"></span>
                <Link to="/tournaments/my" className="action-link">
                    <FormattedMessage id="project.app.Home.dashboard.exploreTournaments" defaultMessage="Explorar Torneos" />
                </Link>
                <span className="action-separator"></span>
                <button className="action-link action-link-btn" onClick={() => setShowJoinModal(true)}>
                    <FormattedMessage id="project.app.Home.dashboard.joinTeam" defaultMessage="Unirse a equipo" />
                </button>
                <span className="action-separator"></span>
                <button className="action-link action-link-btn" onClick={() => setShowCodeModal(true)}>
                    <i className="fa-solid fa-key" style={{ fontSize: '0.7rem' }}></i>
                    <FormattedMessage id="project.app.Home.dashboard.codeSearchTitle" defaultMessage="Buscar torneo por código" />
                </button>
            </div>

            {/* ── Estadísticas de ELO ── */}
            <EloStats />

            {/* ── Main Grid ── */}
            <div className="dashboard-grid">
                {/* Left Column: Mis Equipos */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h5>
                            <FormattedMessage id="project.app.Home.dashboard.myTeams" defaultMessage="Mis Equipos" />
                        </h5>
                        <button className="section-action section-action-btn" onClick={() => setShowCreateTeamModal(true)}>
                            <FormattedMessage id="project.app.Home.dashboard.createTeam" defaultMessage="Crear equipo" />
                        </button>
                    </div>

                    <div className="dashboard-section-body">
                        {teamsLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="secondary" size="sm" />
                            </div>
                        ) : teamsCount > 0 ? (
                            <div className="section-list">
                                {paginatedTeams.map((team, index) => (
                                    <Link key={team.id || index} to={`/teams/view/${team.id}`} className="list-item">
                                        <div className="list-item-avatar">
                                            <i className="fa-solid fa-shield-halved"></i>
                                        </div>
                                        <div className="list-item-content">
                                            <div className="list-item-title">{team.nombreEquipo || team.nombre}</div>
                                            <div className="list-item-meta">
                                                <FormattedMessage id="project.app.Home.dashboard.members" defaultMessage="{count} miembros" values={{ count: team.miembros?.length || 0 }} />
                                            </div>
                                        </div>
                                        <span className="list-item-arrow">→</span>
                                    </Link>
                                ))}
                                {teamTotalPages > 1 && (
                                    <div className="pagination-row">
                                        <button
                                            className="pagination-btn"
                                            disabled={teamPage <= 1}
                                            onClick={() => setTeamPage(p => p - 1)}
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <span className="pagination-info">
                                            {teamPage} / {teamTotalPages}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            disabled={teamPage >= teamTotalPages}
                                            onClick={() => setTeamPage(p => p + 1)}
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <div className="empty-state-text">
                                    <FormattedMessage id="project.app.Home.dashboard.noTeams" defaultMessage="Aún no tienes equipos" />
                                </div>
                                <div className="empty-state-help">
                                    <FormattedMessage id="project.app.Home.dashboard.noTeamsHelp" defaultMessage="Crea tu primer equipo para empezar a competir" />
                                </div>
                                <button className="empty-state-action empty-state-action-btn" onClick={() => setShowCreateTeamModal(true)}>
                                    <FormattedMessage id="project.app.Home.dashboard.createTeamAction" defaultMessage="Crear equipo →" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Mis Torneos */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h5>
                            <FormattedMessage id="project.app.Home.dashboard.myTournaments" defaultMessage="Mis Torneos" />
                        </h5>
                        <Link to="/tournaments/create" className="section-action">
                            <FormattedMessage id="project.app.Home.dashboard.createTournament" defaultMessage="Crear torneo" />
                        </Link>
                    </div>

                    <div className="dashboard-section-body">
                        {tournamentsCount > 0 ? (
                            <div className="section-list">
                                {paginatedTournaments.map(tournament => (
                                    <Link key={tournament.id} to={`/tournaments/view/${tournament.id}`} className="list-item">
                                        <div className="list-item-avatar list-item-avatar-tournament">
                                            {tournament.privado ? '🔒' : '🏆'}
                                        </div>
                                        <div className="list-item-content">
                                            <div className="list-item-title">{tournament.nombre}</div>
                                            <div className="list-item-meta">
                                                <Badge className="list-item-badge">
                                                    {tournament.estado}
                                                </Badge>
                                            </div>
                                        </div>
                                        <span className="list-item-arrow">→</span>
                                    </Link>
                                ))}
                                {tournamentTotalPages > 1 && (
                                    <div className="pagination-row">
                                        <button
                                            className="pagination-btn"
                                            disabled={tournamentPage <= 1}
                                            onClick={() => setTournamentPage(p => p - 1)}
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <span className="pagination-info">
                                            {tournamentPage} / {tournamentTotalPages}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            disabled={tournamentPage >= tournamentTotalPages}
                                            onClick={() => setTournamentPage(p => p + 1)}
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🏆</div>
                                <div className="empty-state-text">
                                    <FormattedMessage id="project.app.Home.dashboard.noTournaments" defaultMessage="Sin torneos activos" />
                                </div>
                                <div className="empty-state-help">
                                    <FormattedMessage id="project.app.Home.dashboard.noTournamentsHelp" defaultMessage="Únete a un torneo o crea uno nuevo" />
                                </div>
                                <Link to="/tournaments/my" className="empty-state-action">
                                    <FormattedMessage id="project.app.Home.dashboard.exploreTournamentsAction" defaultMessage="Explorar torneos →" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mis Partidos ── */}
            <div className="dashboard-matches-section">
                <div className="section-header">
                    <h5>
                        <FormattedMessage id="project.matches.title" defaultMessage="Mis Partidos" />
                    </h5>
                </div>
                <MyMatches embedded />
            </div>

            {/* ── Modals ── */}
            <JoinTeamModal show={showJoinModal} onHide={() => setShowJoinModal(false)} />
            <CodeSearchModal show={showCodeModal} onHide={() => setShowCodeModal(false)} />
            <CreateTeamModal
                show={showCreateTeamModal}
                onHide={() => setShowCreateTeamModal(false)}
                onCreated={() => dispatch(teams.actions.getMyTeams())}
            />
        </div>
    );
};

const Home = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);
    return loggedIn ? <Dashboard /> : <LandingPage />;
};

export default Home;
