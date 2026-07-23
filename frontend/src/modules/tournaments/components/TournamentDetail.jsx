import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { Errors, Success } from '../../common';
import users from '../../users';
import backend from '../../../backend';
import './TournamentDetail.css';

const ESTADOS = {
    RECLUTANDO: { labelId: 'project.tournaments.Detail.estado.reclutando', label: 'Reclutando', css: 'td-badge--recruiting' },
    INSCRIPCION_CERRADA: { labelId: 'project.tournaments.Detail.estado.inscripcionCerrada', label: 'Inscripción cerrada', css: 'td-badge--closed' },
    FASE_GRUPOS: { labelId: 'project.tournaments.Detail.estado.faseGrupos', label: 'Fase de grupos', css: 'td-badge--groups' },
    PLAYOFF: { labelId: 'project.tournaments.Detail.estado.playoff', label: 'Playoff', css: 'td-badge--playoff' },
    FINALIZADO: { labelId: 'project.tournaments.Detail.estado.finalizado', label: 'Finalizado', css: 'td-badge--finished' },
};

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const loggedUser = useSelector(users.selectors.getUser);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendErrors, setBackendErrors] = useState(null);
    const [configuring, setConfiguring] = useState(false);
    const [closing, setClosing] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [myTeams, setMyTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    // success feedback
    const [configSuccess, setConfigSuccess] = useState(false);
    const [closeSuccess, setCloseSuccess] = useState(false);
    // enrollment request state
    const [enrollRequestSent, setEnrollRequestSent] = useState(null); // team name string when sent
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [processingRequestId, setProcessingRequestId] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [configData, setConfigData] = useState({
        tipoTorneo: 'GRUPOS_PLAYOFF',
        numGrupos: 2,
        equiposPorGrupo: 2,
        tienePlayoff: true,
        idaVueltaPlayoff: false,
    });
    const [configErrors, setConfigErrors] = useState({});

    useEffect(() => { loadTournament(); }, [id]);

    useEffect(() => {
        if (loggedUser && id) {
            backend.tournamentService.getFollowedTournaments()
                .then(res => {
                    if (res.ok && Array.isArray(res.payload)) {
                        setIsFollowing(res.payload.some(t => t.id === parseInt(id, 10)));
                    }
                })
                .catch(err => console.error(err));
        }
    }, [id, loggedUser]);

    useEffect(() => {
        if (tournament?.estado === 'RECLUTANDO') {
            loadMyTeams();
            if (isOrg && id) loadPendingRequests();
        }
    }, [tournament?.estado, tournament?.organizadorId, id]);

    // Reload pending requests when tournament changes
    useEffect(() => {
        if (tournament && isOrg && tournament.estado === 'RECLUTANDO') {
            loadPendingRequests();
        }
    }, [tournament?.inscripciones?.length]);

    const loadTournament = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await backend.tournamentService.getTournament(id);
            if (res.ok && res.payload) {
                setTournament(res.payload);
            } else {
                setError(res.error || intl.formatMessage({ id: 'project.tournaments.Detail.loadError', defaultMessage: 'No se pudo cargar el torneo' }));
                setTournament(null);
            }
        } catch (err) {
            setError(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.connectionError', defaultMessage: 'Error de conexión' }));
            setTournament(null);
        } finally { setLoading(false); }
    };

    const loadMyTeams = async () => {
        try {
            const res = await backend.teamService.getMyTeams();
            if (res.ok && Array.isArray(res.payload)) setMyTeams(res.payload);
        } catch (err) { console.error(err); }
    };

    const loadPendingRequests = async () => {
        try {
            setLoadingRequests(true);
            const res = await backend.tournamentService.getPendingRequests(id);
            if (res.ok && Array.isArray(res.payload)) {
                setPendingRequests(res.payload);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleEnrollTeam = async () => {
        if (!selectedTeamId) return;
        setEnrolling(true);
        setBackendErrors(null);
        setEnrollRequestSent(null);
        try {
            const selectedTeam = myTeams.find(t => t.id === parseInt(selectedTeamId, 10));
            const res = await backend.tournamentService.requestEnroll(id, parseInt(selectedTeamId, 10));
            if (res.ok && res.payload) {
                setEnrollRequestSent(selectedTeam?.nombreEquipo || '');
                setSelectedTeamId('');
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.enroll.error.generic', defaultMessage: 'Error al solicitar inscripción' }));
        } finally { setEnrolling(false); }
    };

    const handleApproveRequest = async (solicitudId) => {
        setProcessingRequestId(solicitudId);
        setBackendErrors(null);
        try {
            const res = await backend.tournamentService.approveEnrollment(id, solicitudId);
            if (res.ok && res.payload) {
                setTournament(res.payload);
                await loadPendingRequests();
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.enroll.error.generic', defaultMessage: 'Error al aprobar solicitud' }));
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleRejectRequest = async (solicitudId) => {
        setProcessingRequestId(solicitudId);
        setBackendErrors(null);
        try {
            const res = await backend.tournamentService.rejectEnrollment(id, solicitudId);
            if (res.ok) {
                await loadPendingRequests();
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.enroll.error.generic', defaultMessage: 'Error al rechazar solicitud' }));
        } finally {
            setProcessingRequestId(null);
        }
    };

    // Check if the logged user has already sent a pending enrollment request
    const myPendingRequest = pendingRequests.find(r => r.candidatoId === loggedUser?.id);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await backend.tournamentService.followTournament(id);
            if (res.ok) {
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setFollowLoading(true);
        try {
            const res = await backend.tournamentService.unfollowTournament(id);
            if (res.ok) {
                setIsFollowing(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleCloseInscripciones = async () => {
        setClosing(true);
        setBackendErrors(null);
        setCloseSuccess(false);
        try {
            const res = await backend.tournamentService.closeTournament(id);
            if (res.ok && res.payload) {
                setTournament(res.payload);
                setCloseSuccess(true);
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.close.error.generic', defaultMessage: 'Error al cerrar las inscripciones' }));
        } finally { setClosing(false); }
    };

    const validateConfig = () => {
        const e = {};
        const g = parseInt(configData.numGrupos, 10);
        const eq = parseInt(configData.equiposPorGrupo, 10);
        if (isNaN(g) || g < 1) e.numGrupos = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.numGruposMin', defaultMessage: 'Debe haber al menos 1 grupo' });
        else if (g > 32) e.numGrupos = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.numGruposMax', defaultMessage: 'Máximo 32 grupos' });
        if (isNaN(eq) || eq < 2) e.equiposPorGrupo = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.equiposPorGrupoMin', defaultMessage: 'Debe haber al menos 2 equipos por grupo' });
        else if (eq > 32) e.equiposPorGrupo = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.equiposPorGrupoMax', defaultMessage: 'Máximo 32 equipos por grupo' });
        const cap = g * eq;
        const ins = tournament?.numEquiposInscritos || 0;
        if (!isNaN(g) && !isNaN(eq) && cap < ins) e.capacidad = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.capacidadInsuficiente', defaultMessage: 'Capacidad insuficiente: {capacidad} plazas para {inscritos} equipos inscritos' }, { capacidad: cap, inscritos: ins });
        setConfigErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfigChange = (field, value) => {
        setConfigData(p => ({ ...p, [field]: value }));
        if (configErrors[field] || configErrors.capacidad) {
            setConfigErrors(p => { const n = { ...p }; delete n[field]; delete n.capacidad; return n; });
        }
    };

    const handleConfigure = async (e) => {
        e.preventDefault();
        if (!validateConfig()) return;
        setConfiguring(true);
        setBackendErrors(null);
        setConfigSuccess(false);
        try {
            const res = await backend.tournamentService.configureTournament(id, {
                tipoTorneo: configData.tipoTorneo,
                numGrupos: parseInt(configData.numGrupos, 10),
                equiposPorGrupo: parseInt(configData.equiposPorGrupo, 10),
                tienePlayoff: configData.tienePlayoff,
                idaVueltaPlayoff: configData.idaVueltaPlayoff,
            });
            if (res.ok && res.payload) {
                setTournament(res.payload);
                setConfigSuccess(true);
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.config.error.generic', defaultMessage: 'Error al configurar el torneo' }));
        } finally { setConfiguring(false); }
    };

    const est = tournament ? ESTADOS[tournament.estado] : null;

    if (loading) return (
        <Container className="td-loading">
            <div className="text-center py-5">
                <Spinner animation="border" variant="secondary" />
                <p className="mt-2 text-muted"><FormattedMessage id="project.tournaments.Detail.loading" defaultMessage="Cargando torneo..." /></p>
            </div>
        </Container>
    );

    if (error || !tournament) return (
        <Container className="td-error">
            <div className="text-center py-5">
                <i className="fa-regular fa-circle-xmark fa-3x text-muted mb-3" />
                <h5><FormattedMessage id="project.tournaments.Detail.notFound" defaultMessage="Torneo no encontrado" /></h5>
                <p className="text-muted">{error}</p>
                <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate('/')}>
                    <FormattedMessage id="project.tournaments.Detail.backToDashboard" defaultMessage="Volver al inicio" />
                </Button>
            </div>
        </Container>
    );

    const isOrg = loggedUser?.id === tournament.organizadorId;

    // Filter teams that are NOT already enrolled (by inscripciones from the API)
    const enrolledTeamIds = new Set(
        (tournament.inscripciones || []).map(insc => insc.equipoId)
    );
    const availableTeams = myTeams.filter(
        t => t.estado === 'ACTIVO' && t.creadorId === loggedUser?.id && !enrolledTeamIds.has(t.id)
    );

    return (
        <Container className="td-container">
            <button className="td-back" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left" />
                <FormattedMessage id="project.tournaments.Detail.back" defaultMessage="Volver" />
            </button>

            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

            {/* Success feedback */}
            {enrollRequestSent && (
                <Success message={intl.formatMessage(
                    { id: 'project.tournaments.Detail.enroll.requestSent', defaultMessage: '¡Solicitud de inscripción enviada para "{team}"! El organizador la revisará.' },
                    { team: enrollRequestSent }
                )} onClose={() => setEnrollRequestSent(null)} />
            )}
            {closeSuccess && (
                <Success message={intl.formatMessage(
                    { id: 'project.tournaments.Detail.close.success', defaultMessage: 'Inscripciones cerradas con éxito. Ya puedes configurar la estructura del torneo.' }
                )} onClose={() => setCloseSuccess(false)} />
            )}
            {configSuccess && (
                <Success message={intl.formatMessage(
                    { id: 'project.tournaments.Detail.config.success', defaultMessage: 'Estructura configurada y calendario generado con éxito.' }
                )} onClose={() => setConfigSuccess(false)} />
            )}

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="td-main-layout">

                {/* ===== LEFT: HERO INFO ===== */}
                <div className="td-hero">
                    {/* Top: left side (name, org, code) + right side (badges, follow) */}
                    <div className="td-hero-top">
                        <div className="td-hero-top-left">
                            <h1 className="td-hero-name">{tournament.nombre}</h1>
                            <p className="td-hero-org">
                                <i className="fa-regular fa-user" />
                                {tournament.organizadorNombre}
                            </p>
                            {/* Code chip — only show code to the organizer if private */}
                            {!tournament.privado ? (
                                <div className="td-code">
                                    <i className="fa-regular fa-qrcode" />
                                    <span className="td-code-val">{tournament.codigoTorneo}</span>
                                </div>
                            ) : isOrg ? (
                                <div className="td-code td-code--private-org">
                                    <i className="fa-regular fa-qrcode" />
                                    <span className="td-code-val">{tournament.codigoTorneo}</span>
                                    <span className="td-code-org-hint">
                                        <FormattedMessage id="project.tournaments.Detail.code.organizerHint" defaultMessage="(compártelo para invitar)" />
                                    </span>
                                </div>
                            ) : (
                                <div className="td-code td-code--private-locked">
                                    <i className="fa-solid fa-lock" />
                                    <span className="td-code-locked-txt">
                                        <FormattedMessage id="project.tournaments.Detail.code.private" defaultMessage="Torneo privado — solicita el código al organizador" />
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="td-hero-top-right">
                            <div className="td-hero-badges">
                                {tournament.privado && <span title="Privado">🔒</span>}
                                {est && <span className={`td-badge ${est.css}`}><FormattedMessage id={est.labelId} defaultMessage={est.label} /></span>}
                            </div>
                            {/* Follow / Unfollow */}
                            {loggedUser && (
                                <Button
                                    variant={isFollowing ? 'outline-danger' : 'outline-dark'}
                                    className="rounded-pill td-follow-btn"
                                    size="sm"
                                    onClick={isFollowing ? handleUnfollow : handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : isFollowing ? (
                                        <><i className="fa-regular fa-bookmark me-1" /><FormattedMessage id="project.tournaments.Detail.follow.unfollow" defaultMessage="Dejar de seguir" /></>
                                    ) : (
                                        <><i className="fa-regular fa-bookmark me-1" /><FormattedMessage id="project.tournaments.Detail.follow.follow" defaultMessage="Seguir" /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="td-metrics">
                        <Metric icon="fa-regular fa-users" value={tournament.numEquiposInscritos || 0} labelId="project.tournaments.Detail.inscribedTeams" label="Inscritos" />
                        {tournament.numGrupos > 0 && <Metric icon="fa-regular fa-layer-group" value={tournament.numGrupos} labelId="project.tournaments.Detail.groups" label="Grupos" />}
                        {tournament.tipoTorneo && <Metric icon="fa-regular fa-trophy" value={formatTipo(tournament.tipoTorneo, intl)} labelId="project.tournaments.Detail.format" label="Formato" />}
                    </div>

                    {/* Close Inscriptions */}
                    {tournament.estado === 'RECLUTANDO' && isOrg && (
                        <div className="td-action">
                            <span className="td-action-text">
                                <i className="fa-regular fa-clock" />
                                <FormattedMessage id="project.tournaments.Detail.close.info" defaultMessage="Las inscripciones están abiertas. Ciérralas cuando tengas suficientes equipos." />
                            </span>
                            <Button variant="dark" className="rounded-pill px-3 td-action-btn" size="sm" onClick={handleCloseInscripciones} disabled={closing}>
                                {closing ? (
                                    <><Spinner animation="border" size="sm" className="me-1" /><FormattedMessage id="project.tournaments.Detail.close.closing" defaultMessage="Cerrando..." /></>
                                ) : (
                                    <><i className="fa-regular fa-door-closed me-1" /><FormattedMessage id="project.tournaments.Detail.close.button" defaultMessage="Cerrar inscripciones" /></>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Enroll section for non-organizers */}
                    {tournament.estado === 'RECLUTANDO' && !isOrg && loggedUser && (
                        <div className="td-enroll">
                            {myPendingRequest ? (
                                // User already has a pending request
                                <div className="td-enroll-pending-status">
                                    <div className="td-enroll-pending-icon"><i className="fa-regular fa-hourglass-half" /></div>
                                    <div className="td-enroll-pending-text">
                                        <FormattedMessage id="project.tournaments.Detail.enroll.pendingRequest" defaultMessage="Solicitud de inscripción enviada — pendiente de aprobación" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="td-enroll-title">
                                        <FormattedMessage id="project.tournaments.Detail.enroll.title" defaultMessage="Solicitar inscripción" />
                                    </div>
                                    <div className="td-enroll-sub">
                                        <FormattedMessage id="project.tournaments.Detail.enroll.info" defaultMessage="Selecciona uno de tus equipos para solicitar la inscripción. El organizador deberá aprobarla." />
                                    </div>

                                    {availableTeams.length === 0 ? (
                                        <div className="td-enroll-no-teams">
                                            <i className="fa-regular fa-circle-info me-1" />
                                            <FormattedMessage id="project.tournaments.Detail.enroll.noTeamsAvailable" defaultMessage="No tienes equipos disponibles para solicitar inscripción en este torneo." />
                                        </div>
                                    ) : (
                                        <div className="td-enroll-row">
                                            <Form.Select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="td-enroll-select" disabled={enrolling}>
                                                <option value="">{intl.formatMessage({ id: 'project.tournaments.Detail.enroll.selectTeam', defaultMessage: 'Seleccionar equipo...' })}</option>
                                                {availableTeams.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombreEquipo}</option>
                                                ))}
                                            </Form.Select>
                                            <Button variant="dark" className="rounded-pill px-3 flex-shrink-0" size="sm" onClick={handleEnrollTeam} disabled={enrolling || !selectedTeamId}>
                                                {enrolling ? (
                                                    <><Spinner animation="border" size="sm" className="me-1" /><FormattedMessage id="project.tournaments.Detail.enroll.enrolling" defaultMessage="Solicitando..." /></>
                                                ) : (
                                                    <><i className="fa-regular fa-paper-plane me-1" /><FormattedMessage id="project.tournaments.Detail.enroll.button" defaultMessage="Solicitar inscripción" /></>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Pending enrollment requests for organizer */}
                    {tournament.estado === 'RECLUTANDO' && isOrg && pendingRequests.length > 0 && (
                        <div className="td-enroll-requests">
                            <div className="td-enroll-requests-title">
                                <i className="fa-regular fa-clock me-1" />
                                <FormattedMessage id="project.tournaments.Detail.enroll.pendingRequests" defaultMessage="Solicitudes pendientes" />
                                <span className="td-enroll-requests-count">{pendingRequests.length}</span>
                            </div>
                            <div className="td-enroll-requests-list">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="td-enroll-request-item">
                                        <div className="td-enroll-request-info">
                                            <div className="td-enroll-request-team">{req.nombreEquipo}</div>
                                            <div className="td-enroll-request-captain">
                                                <i className="fa-regular fa-user me-1" />
                                                {req.nombreCandidato}
                                            </div>
                                        </div>
                                        <div className="td-enroll-request-actions">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="rounded-pill"
                                                disabled={processingRequestId === req.id}
                                                onClick={() => handleApproveRequest(req.id)}
                                            >
                                                {processingRequestId === req.id ? (
                                                    <Spinner animation="border" size="sm" />
                                                ) : (
                                                    <><i className="fa-regular fa-check me-1" /><FormattedMessage id="project.tournaments.Detail.enroll.approve" defaultMessage="Aceptar" /></>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="rounded-pill"
                                                disabled={processingRequestId === req.id}
                                                onClick={() => handleRejectRequest(req.id)}
                                            >
                                                {processingRequestId === req.id ? (
                                                    <Spinner animation="border" size="sm" />
                                                ) : (
                                                    <><i className="fa-regular fa-xmark me-1" /><FormattedMessage id="project.tournaments.Detail.enroll.reject" defaultMessage="Rechazar" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading indicator for pending requests */}
                    {tournament.estado === 'RECLUTANDO' && isOrg && loadingRequests && (
                        <div className="td-enroll-requests-loading">
                            <Spinner animation="border" size="sm" />
                            <span className="ms-2"><FormattedMessage id="project.tournaments.Detail.enroll.loadingRequests" defaultMessage="Cargando solicitudes..." /></span>
                        </div>
                    )}

                    {/* Configurator */}
                    {tournament.estado === 'INSCRIPCION_CERRADA' && isOrg && (
                        <div className="td-config">
                            <div className="td-config-title">
                                <i className="fa-regular fa-gear me-1" />
                                <FormattedMessage id="project.tournaments.Detail.config.title" defaultMessage="Configurar estructura del torneo" />
                            </div>
                            <div className="td-config-sub">
                                <FormattedMessage id="project.tournaments.Detail.config.subtitle" defaultMessage="Hay {count} equipo(s) inscrito(s). Define el formato de competición." values={{ count: tournament.numEquiposInscritos || 0 }} />
                            </div>

                            {configErrors.capacidad && (
                                <div className="td-config-error">
                                    <i className="fa-regular fa-circle-exclamation me-1" />
                                    {configErrors.capacidad}
                                </div>
                            )}

                            <Form onSubmit={handleConfigure}>
                                <div className="td-config-grid">
                                    <div className="td-config-field">
                                        <Form.Label><FormattedMessage id="project.tournaments.Detail.config.tipoTorneo" defaultMessage="Tipo de torneo" /></Form.Label>
                                        <Form.Select value={configData.tipoTorneo} onChange={e => handleConfigChange('tipoTorneo', e.target.value)}>
                                            <option value="GRUPOS_PLAYOFF"><FormattedMessage id="project.tournaments.Detail.config.tipo.gruposPlayoff" defaultMessage="Grupos + Playoff" /></option>
                                            <option value="LIGA_UNICA"><FormattedMessage id="project.tournaments.Detail.config.tipo.ligaUnica" defaultMessage="Liga única" /></option>
                                            <option value="ELIMINATORIAS"><FormattedMessage id="project.tournaments.Detail.config.tipo.eliminatorias" defaultMessage="Eliminatorias" /></option>
                                        </Form.Select>
                                    </div>

                                    {configData.tipoTorneo !== 'ELIMINATORIAS' && (
                                        <>
                                            <div className="td-config-field">
                                                <Form.Label><FormattedMessage id="project.tournaments.Detail.config.numGrupos" defaultMessage="Número de grupos" /></Form.Label>
                                                <Form.Control type="number" min={1} max={32} value={configData.numGrupos} onChange={e => handleConfigChange('numGrupos', e.target.value)} isInvalid={!!configErrors.numGrupos} />
                                                <Form.Control.Feedback type="invalid">{configErrors.numGrupos}</Form.Control.Feedback>
                                            </div>
                                            <div className="td-config-field">
                                                <Form.Label><FormattedMessage id="project.tournaments.Detail.config.equiposPorGrupo" defaultMessage="Equipos por grupo" /></Form.Label>
                                                <Form.Control type="number" min={2} max={32} value={configData.equiposPorGrupo} onChange={e => handleConfigChange('equiposPorGrupo', e.target.value)} isInvalid={!!configErrors.equiposPorGrupo} />
                                                <Form.Control.Feedback type="invalid">{configErrors.equiposPorGrupo}</Form.Control.Feedback>
                                            </div>
                                        </>
                                    )}

                                    {configData.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                                        <>
                                            <div className="td-config-field td-config-check">
                                                <Form.Check type="switch" id="tienePlayoff" label={intl.formatMessage({ id: 'project.tournaments.Detail.config.tienePlayoff', defaultMessage: 'Playoff' })} checked={configData.tienePlayoff} onChange={e => handleConfigChange('tienePlayoff', e.target.checked)} />
                                            </div>
                                            {configData.tienePlayoff && (
                                                <div className="td-config-field td-config-check">
                                                    <Form.Check type="switch" id="idaVueltaPlayoff" label={intl.formatMessage({ id: 'project.tournaments.Detail.config.idaVueltaPlayoff', defaultMessage: 'Ida y vuelta en playoff' })} checked={configData.idaVueltaPlayoff} onChange={e => handleConfigChange('idaVueltaPlayoff', e.target.checked)} />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {!configErrors.capacidad && configData.tipoTorneo !== 'ELIMINATORIAS' && (
                                    <div className="td-config-cap">
                                        <i className="fa-regular fa-circle-info me-1" />
                                        <FormattedMessage id="project.tournaments.Detail.config.capacityInfo" defaultMessage="Capacidad: {capacidad} plazas ({inscritos} inscritos)" values={{
                                            capacidad: parseInt(configData.numGrupos, 10) * parseInt(configData.equiposPorGrupo, 10) || 0,
                                            inscritos: tournament.numEquiposInscritos || 0,
                                        }} />
                                    </div>
                                )}

                                <div className="td-config-actions">
                                    <Button variant="outline-secondary" className="rounded-pill px-3" size="sm" onClick={() => navigate('/')} disabled={configuring}>
                                        <FormattedMessage id="project.tournaments.Detail.config.cancel" defaultMessage="Cancelar" />
                                    </Button>
                                    <Button type="submit" variant="dark" className="rounded-pill px-3" size="sm" disabled={configuring}>
                                        {configuring ? (
                                            <><Spinner animation="border" size="sm" className="me-1" /><FormattedMessage id="project.tournaments.Detail.config.generating" defaultMessage="Generando..." /></>
                                        ) : (
                                            <><i className="fa-regular fa-calendar-check me-1" /><FormattedMessage id="project.tournaments.Detail.config.generate" defaultMessage="Generar calendario" /></>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </div>

                {/* ===== RIGHT: TEAMS ===== */}
                <div className="td-teams">
                    <div className="td-teams-head">
                        <div className="td-teams-head-left">
                            <i className="fa-regular fa-users" style={{ color: '#6c757d', fontSize: '0.85rem' }} />
                            <h5 className="td-teams-title">
                                <FormattedMessage id="project.tournaments.Detail.registeredTeams" defaultMessage="Equipos inscritos" />
                            </h5>
                        </div>
                        <span className="td-teams-count">{tournament.numEquiposInscritos || 0}</span>
                    </div>

                    {tournament.inscripciones?.length > 0 ? (
                        <div>
                            {tournament.inscripciones.map((insc, i) => (
                                <div key={i} className="td-team">
                                    <div className="td-team-icon"><i className="fa-regular fa-shield" /></div>
                                    <span className="td-team-name">{insc.nombreEquipo}</span>
                                    {insc.creadorId === loggedUser?.id && (
                                        <span className="td-team-mine ms-auto">
                                            <FormattedMessage id="project.tournaments.Detail.myTeam" defaultMessage="(mi equipo)" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="td-teams-empty">
                            <div className="td-teams-empty-icon"><i className="fa-regular fa-users-slash" /></div>
                            <div className="td-teams-empty-txt">
                                <FormattedMessage id="project.tournaments.Detail.noTeams" defaultMessage="No hay equipos inscritos todavía" />
                            </div>
                            <div className="td-teams-empty-sub">
                                <FormattedMessage id="project.tournaments.Detail.noTeamsHelp" defaultMessage="Los equipos aparecerán aquí cuando se inscriban" />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Container>
    );
};

/* Helpers */
function Metric({ icon, value, labelId, label }) {
    return (
        <div className="td-metric">
            <div className="td-metric-icon"><i className={icon} /></div>
            <div className="td-metric-body">
                <span className="td-metric-val">{value}</span>
                <span className="td-metric-lbl"><FormattedMessage id={labelId} defaultMessage={label} /></span>
            </div>
        </div>
    );
}

function formatTipo(tipo, intl) {
    const map = {
        LIGA_UNICA: { id: 'project.tournaments.Detail.tipo.ligaUnica', msg: 'Liga única' },
        GRUPOS_PLAYOFF: { id: 'project.tournaments.Detail.tipo.gruposPlayoff', msg: 'Grupos + Playoff' },
        ELIMINATORIAS: { id: 'project.tournaments.Detail.tipo.eliminatorias', msg: 'Eliminatorias' },
    };
    const e = map[tipo];
    return e ? intl.formatMessage({ id: e.id, defaultMessage: e.msg }) : tipo;
}

export default TournamentDetail;
