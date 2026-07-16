import  { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

import users from '../../users';
import teams from '../../teams';

const Home = () => {
    const dispatch = useDispatch();
    const user = useSelector(users.selectors.getUser);
    const loggedIn = useSelector(users.selectors.isLoggedIn);

    /*
    useEffect(() => {
        if (loggedIn) {
            dispatch(teams.actions.getMyTeams());
        }
    }, [loggedIn, dispatch]);
     */
    const userTeams = useSelector(state => state.teams?.userTeams || []);

    if (loggedIn) {
        return (
            <Container className="mt-4 py-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1100px' }}>

                <div className="py-3 px-4 mb-4 rounded-4 border d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ backgroundColor: '#f5f5f7', borderColor: '#d2d2d7' }}>
                    <div style={{ flex: '1', minWidth: '280px' }}>
                        <h2 className="font-weight-bold text-dark mb-1" style={{ letterSpacing: '-0.03em', fontWeight: '700', fontSize: '1.8rem' }}>
                            <FormattedMessage id="project.global.welcome" defaultMessage="Bienvenido a Agón" />
                            {user && `, ${user.nombre}`}
                        </h2>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.4' }}>
                            Tu reputación competitiva es individual. Tu habilidad define el éxito de cualquier equipo en el que juegues.
                        </p>
                    </div>
                    <div className="bg-white py-2 px-3 rounded-4 border shadow-sm text-center" style={{ minWidth: '130px' }}>
                        <span className="text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block' }}>Mi Rango ELO</span>
                        <h3 className="font-weight-bold text-dark m-0" style={{ letterSpacing: '-0.02em', fontSize: '1.6rem', fontWeight: '700' }}>
                            {user?.elo || 1500}
                        </h3>
                    </div>
                </div>

                <div className="d-flex gap-2 mb-4 justify-content-start align-items-center bg-white p-3 rounded-4 border shadow-sm">
                    <span className="text-secondary small font-weight-bold me-2 ps-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                        Configuración:
                    </span>
                    <Button as={Link} to="/users/profile" variant="light" className="btn-sm rounded-pill border px-3 text-dark bg-light" style={{ fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-user-gear me-2 text-secondary"></i>Editar Mi Perfil
                    </Button>
                </div>

                <Row className="g-4">

                    <Col lg={7}>
                        <Card className="border rounded-4 shadow-sm mb-4" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4">
                                <Card.Title className="pb-3 font-weight-bold text-dark border-bottom" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                                    Tu Trayectoria de Habilidad (Historial ELO)
                                </Card.Title>
                                <div className="d-flex justify-content-center align-items-center text-muted bg-light rounded-3 mt-3" style={{ height: '220px', border: '1px dashed #d2d2d7' }}>
                                    <div className="text-center small p-4">
                                        <i className="fa-solid fa-chart-line mb-2 fs-4 text-secondary opacity-50"></i>
                                        <br />
                                        <span>El gráfico trazará el impacto de tus últimas 10 partidas en tu puntuación individual.</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="border rounded-4 shadow-sm" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4">
                                <Card.Title className="pb-3 font-weight-bold text-dark border-bottom d-flex justify-content-between align-items-center" style={{ fontSize: '1.1rem' }}>
                                    <span>Mis Equipos y Alineaciones</span>
                                    {userTeams.length > 0 && <span className="badge rounded-pill bg-light text-dark border">{userTeams.length}</span>}
                                </Card.Title>

                                {userTeams.length === 0 ? (
                                    <p className="text-muted small my-3">No estás integrado en ningún equipo todavía.</p>
                                ) : (
                                    <ListGroup variant="flush" className="mt-3 rounded-3 border overflow-hidden">
                                        {userTeams.map(team => (
                                            <ListGroup.Item key={team.id} className="py-3 px-3 border-0 border-bottom bg-white">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <Link to={`/teams/view/${team.id}`} className="fw-bold text-dark text-decoration-none small style-link">
                                                        <i className="fa-solid fa-shield-halved me-2 text-secondary opacity-70"></i>{team.nombre}
                                                    </Link>
                                                </div>
                                                <div className="d-flex flex-column gap-1 ps-4">
                                                    {team.miembros?.map(miembro => {
                                                        const esUsuarioActual = miembro.id === user?.id;
                                                        return (
                                                            <div key={miembro.id} className="d-flex justify-content-between align-items-center small text-muted" style={{ fontSize: '0.85rem' }}>
                                                                <span className={esUsuarioActual ? "fw-bold text-dark" : ""}>
                                                                    {miembro.nombre} {esUsuarioActual && "(Tú)"}
                                                                </span>
                                                                <span className={`badge rounded-pill ${esUsuarioActual ? "bg-dark text-white" : "bg-light text-secondary border"}`}>
                                                                    {miembro.elo || 1500} ELO
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                <Button as={Link} to="/teams/create" className="w-100 btn-dark rounded-pill py-2 mt-3" style={{ backgroundColor: '#000', border: 'none', fontSize: '0.9rem' }}>
                                    + Registrar Nuevo Equipo
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={5}>
                        <Card className="border rounded-4 shadow-sm mb-4" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4" style={{ minHeight: '180px' }}>
                                <Card.Title className="pb-3 font-weight-bold text-dark border-bottom" style={{ fontSize: '1.1rem' }}>
                                    Próximos Encuentros
                                </Card.Title>
                                <div className="text-center pt-4 text-muted small">
                                    <i className="fa-regular fa-calendar mb-2 opacity-50 fs-5"></i>
                                    <p>No hay partidos agendados en tus competiciones activas.</p>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="border rounded-4 shadow-sm" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4" style={{ minHeight: '180px' }}>
                                <Card.Title className="pb-3 font-weight-bold text-dark border-bottom" style={{ fontSize: '1.1rem' }}>
                                    Torneos Abiertos
                                </Card.Title>
                                <div className="text-center pt-4 text-muted small">
                                    <i className="fa-solid fa-trophy mb-2 opacity-50 fs-5"></i>
                                    <p>Explora ligas disponibles para inscribirte con tu plantilla.</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const team1Bars = { gk: '6%', df: '20%', mf: '40%', fw: '70%' };
    const team2Bars = { gk: '94%', df: '80%', mf: '60%', fw: '30%' };

    return (
        <Container className="mt-5 py-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <Row className="align-items-center justify-content-between">
                <Col lg={5} className="mb-5 mb-lg-0">
                    <h1 className="display-3 font-weight-bold text-dark mb-2" style={{ letterSpacing: '-0.03em', fontWeight: '700' }}>
                        Agón
                    </h1>
                    <p className="h4 text-secondary mb-4 font-weight-normal" style={{ letterSpacing: '-0.01em', lineHeight: '1.4' }}>
                        La plataforma para organizar y competir en torneos de futbolín.
                    </p>
                    <p className="text-muted mb-5" style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>
                        Crea competiciones fácilmente o únete con tu pareja de juego. Registra los resultados de tus partidas al instante, sigue el calendario en tiempo real y mide tu nivel con el sistema de puntuación ELO.
                    </p>
                    <div className="d-flex gap-3">
                        <Button as={Link} to="/users/login" className="btn-dark btn-lg px-4 rounded-pill shadow-sm" style={{ backgroundColor: '#000', fontSize: '0.95rem', border: 'none' }}>
                            Iniciar Sesión
                        </Button>
                        <Button as={Link} to="/users/signup" className="btn-outline-secondary btn-lg px-4 rounded-pill" style={{ fontSize: '0.95rem', color: '#1d1d1f', backgroundColor: 'transparent' }}>
                            Registrarse
                        </Button>
                    </div>
                </Col>

                <Col lg={6}>
                    <div
                        className="position-relative w-100 rounded-4 shadow-sm border"
                        style={{
                            height: '420px',
                            backgroundColor: '#f5f5f7',
                            borderColor: '#d2d2d7',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="position-absolute h-100 border-start" style={{ left: '50%', borderColor: '#d2d2d7', borderStyle: 'dashed' }}></div>
                        <div className="position-absolute rounded-circle border" style={{ width: '90px', height: '90px', top: 'calc(50% - 45px)', left: 'calc(50% - 45px)', borderColor: '#d2d2d7' }}></div>

                        <div className="position-absolute border border-start-0" style={{ width: '40px', height: '160px', top: 'calc(50% - 80px)', left: 0, borderColor: '#d2d2d7', borderRadius: '0 8px 8px 0' }}></div>
                        <div className="position-absolute border border-end-0" style={{ width: '40px', height: '160px', top: 'calc(50% - 80px)', right: 0, borderColor: '#d2d2d7', borderRadius: '8px 0 0 8px' }}></div>

                        <div className="position-absolute h-100" style={{ left: team1Bars.gk, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: 'calc(50% - 5px)', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3', boxShadow: '0 0 8px rgba(0,113,227,0.4)' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team1Bars.df, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '25%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '75%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team1Bars.mf, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '20%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '80%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team1Bars.fw, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '25%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '75%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#0071e3' }}></div>
                        </div>

                        <div className="position-absolute h-100" style={{ left: team2Bars.gk, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: 'calc(50% - 5px)', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a', boxShadow: '0 0 8px rgba(255,69,58,0.4)' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team2Bars.df, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '25%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '75%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team2Bars.mf, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '20%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '80%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                        </div>
                        <div className="position-absolute h-100" style={{ left: team2Bars.fw, width: '1px', backgroundColor: '#e2e2e7' }}>
                            <div className="position-absolute rounded-circle" style={{ top: '25%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '50%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                            <div className="position-absolute rounded-circle" style={{ top: '75%', left: '-5px', width: '10px', height: '10px', backgroundColor: '#ff453a' }}></div>
                        </div>

                        <div
                            className="position-absolute rounded-circle bg-white shadow-sm border border-secondary"
                            style={{ width: '14px', height: '14px', top: 'calc(50% - 7px)', left: 'calc(50% - 7px)', zIndex: 5 }}
                        ></div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;