import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { Errors, Success } from '../../common';
import ProfileAvatar from '../../common/components/ProfileAvatar';
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

const DAYS_OF_WEEK = [
    { key: 'L', labelId: 'project.tournaments.Create.Step4.mon', label: 'Lun' },
    { key: 'M', labelId: 'project.tournaments.Create.Step4.tue', label: 'Mar' },
    { key: 'X', labelId: 'project.tournaments.Create.Step4.wed', label: 'Mié' },
    { key: 'J', labelId: 'project.tournaments.Create.Step4.thu', label: 'Jue' },
    { key: 'V', labelId: 'project.tournaments.Create.Step4.fri', label: 'Vie' },
    { key: 'S', labelId: 'project.tournaments.Create.Step4.sat', label: 'Sáb' },
    { key: 'D', labelId: 'project.tournaments.Create.Step4.sun', label: 'Dom' },
];

const DISTRIBUCION_OPTS = [
    { value: 'JORNADAS', labelId: 'project.tournaments.Create.Step4.dist.jornadas', label: 'Por jornadas' },
    { value: 'UNIFORME', labelId: 'project.tournaments.Create.Step4.dist.uniforme', label: 'Uniforme' },
    { value: 'RAPIDO', labelId: 'project.tournaments.Create.Step4.dist.rapido', label: 'Rápido' },
];


const NAV_ITEMS = [
    { key: 'info', icon: 'fa-regular fa-circle-info', labelId: 'project.tournaments.Detail.tabs.info', label: 'Información' },
    { key: 'teams', icon: 'fa-regular fa-users', labelId: 'project.tournaments.Detail.section.teams', label: 'Equipos' },
    { key: 'partidos', icon: 'fa-regular fa-calendar', labelId: 'project.tournaments.Detail.tabs.partidos', label: 'Partidos' },
    { key: 'clasificacion', icon: 'fa-regular fa-trophy', labelId: 'project.tournaments.Detail.tabs.clasificacion', label: 'Clasificación' },
    { key: 'params', icon: 'fa-regular fa-sliders', labelId: 'project.tournaments.Detail.tabs.params', label: 'Configuración' },
];


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
    const [configSuccess, setConfigSuccess] = useState(false);
    const [closeSuccess, setCloseSuccess] = useState(false);
    const [enrollRequestSent, setEnrollRequestSent] = useState(null);
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
    const [activeTab, setActiveTab] = useState('info');
    const [editing, setEditing] = useState(false);
    const [editFields, setEditFields] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        fechaLimiteInscripcion: '',
        puntosVictoria: 0,
        puntosEmpate: 0,
        puntosDerrota: 0,
        formatoPartidos: '',
        criterioDesempate: '',
        diasDisponibles: [],
        horaInicio: '',
        horaFin: '',
        duracionPartido: 0,
        estrategiaDistribucion: '',
        fechasExcluidas: [],
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [newExcludedDate, setNewExcludedDate] = useState('');
    const [selectedGrupoIdx, setSelectedGrupoIdx] = useState(0);


    useEffect(() => {
        loadTournament();
    }, [id]);

    useEffect(() => {
        if (loggedUser) loadMyTeams();
    }, [loggedUser]);

    const loadTournament = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await backend.tournamentService.getTournament(id);
            if (response.ok && response.payload) {
                setTournament(response.payload);
                if (response.payload.inscripciones && response.payload.inscripciones.length > 0 && response.payload.inscripciones[0].miembros) {
                    const teams = response.payload.inscripciones.map(insc => ({
                        id: insc.equipoId,
                        nombreEquipo: insc.nombreEquipo,
                    }));
                    setMyTeams(prev => {
                        const existing = new Set(prev.map(t => t.id));
                        const merged = [...prev];
                        teams.forEach(t => { if (!existing.has(t.id)) merged.push(t); });
                        return merged;
                    });
                }
            } else {
                setError(response.error || 'Error loading tournament');
            }
        } catch (err) {
            setError(err.message || 'Error loading tournament');
        } finally {
            setLoading(false);
        }
    };

    const loadMyTeams = async () => {
        try {
            const response = await backend.teamService.getMyTeams();
            if (response.ok) {
                setMyTeams(response.payload || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadPendingRequests = async () => {
        if (!isOrg) return;
        try {
            setLoadingRequests(true);
            const response = await backend.tournamentService.getPendingRequests(id);
            if (response.ok) {
                setPendingRequests(response.payload || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleEnrollTeam = async () => {
        if (!selectedTeamId) return;
        try {
            setEnrolling(true);
            setBackendErrors(null);
            const team = myTeams.find(t => t.id === parseInt(selectedTeamId));
            const response = await backend.tournamentService.requestEnroll(id, parseInt(selectedTeamId));
            if (response.ok) {
                setEnrollRequestSent(team ? team.nombreEquipo : '');
                setSelectedTeamId('');
            } else {
                setBackendErrors(response.error || 'Error al solicitar inscripción');
            }
        } catch (err) {
            setBackendErrors(err.message || 'Error al solicitar inscripción');
        } finally {
            setEnrolling(false);
        }
    };

    const handleApproveRequest = async (solicitudId) => {
        try {
            setProcessingRequestId(solicitudId);
            await backend.tournamentService.approveEnrollment(id, solicitudId);
            loadPendingRequests();
            loadTournament();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleRejectRequest = async (solicitudId) => {
        try {
            setProcessingRequestId(solicitudId);
            await backend.tournamentService.rejectEnrollment(id, solicitudId);
            loadPendingRequests();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleFollow = async () => {
        if (!loggedUser) return;
        try {
            setFollowLoading(true);
            await backend.tournamentService.followTournament(id);
            setIsFollowing(true);
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!loggedUser) return;
        try {
            setFollowLoading(true);
            await backend.tournamentService.unfollowTournament(id);
            setIsFollowing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleCloseInscripciones = async () => {
        try {
            setClosing(true);
            setBackendErrors(null);
            const response = await backend.tournamentService.closeTournament(id);
            if (!response.ok) {
                setBackendErrors(response.error);
            } else {
                setCloseSuccess(true);
                loadTournament();
            }
        } catch (err) {
            setBackendErrors(err.message);
        } finally {
            setClosing(false);
        }
    };

    const validateConfig = () => {
        const errors = {};
        if (!configData.numGrupos || parseInt(configData.numGrupos) < 1) errors.numGrupos = true;
        if (!configData.equiposPorGrupo || parseInt(configData.equiposPorGrupo) < 1) errors.equiposPorGrupo = true;
        setConfigErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfigChange = (field, value) => {
        setConfigData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfigure = async (e) => {
        e.preventDefault();
        if (!validateConfig()) return;
        try {
            setConfiguring(true);
            setBackendErrors(null);
            const response = await backend.tournamentService.configureTournament(id, {
                tipoTorneo: configData.tipoTorneo,
                numGrupos: parseInt(configData.numGrupos),
                equiposPorGrupo: parseInt(configData.equiposPorGrupo),
                tienePlayoff: configData.tipoTorneo !== 'LIGA_UNICA',
                idaVueltaPlayoff: configData.idaVueltaPlayoff,
            });
            if (response.ok) {
                setConfigSuccess(true);
                loadTournament();
            } else {
                setBackendErrors(response.error);
            }
        } catch (err) {
            setBackendErrors(err.message);
        } finally {
            setConfiguring(false);
        }
    };

    const toggleEditMode = () => {
        if (!editing && tournament) {
            setEditFields({
                nombre: tournament.nombre || '',
                fechaInicio: tournament.fechaInicio || '',
                fechaFin: tournament.fechaFin || '',
                fechaLimiteInscripcion: tournament.fechaLimiteInscripcion || '',
                puntosVictoria: tournament.puntosVictoria || 0,
                puntosEmpate: tournament.puntosEmpate || 0,
                puntosDerrota: tournament.puntosDerrota || 0,
                formatoPartidos: tournament.formatoPartidos || '',
                criterioDesempate: tournament.criterioDesempate || '',
                diasDisponibles: tournament.diasDisponibles || [],
                horaInicio: tournament.horaInicio || '',
                horaFin: tournament.horaFin || '',
                duracionPartido: tournament.duracionPartido || 0,
                estrategiaDistribucion: tournament.estrategiaDistribucion || '',
                fechasExcluidas: tournament.fechasExcluidas || [],
            });
        }
        setEditing(!editing);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleDay = (dayKey) => {
        setEditFields(prev => ({
            ...prev,
            diasDisponibles: (prev.diasDisponibles || []).includes(dayKey)
                ? prev.diasDisponibles.filter(d => d !== dayKey)
                : [...(prev.diasDisponibles || []), dayKey],
        }));
    };

    const handleAddExcludedDate = () => {
        if (!newExcludedDate) return;
        setEditFields(prev => ({
            ...prev,
            fechasExcluidas: [...(prev.fechasExcluidas || []), newExcludedDate],
        }));
        setNewExcludedDate('');
    };

    const handleRemoveExcludedDate = (date) => {
        setEditFields(prev => ({
            ...prev,
            fechasExcluidas: (prev.fechasExcluidas || []).filter(d => d !== date),
        }));
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        try {
            setUpdateLoading(true);
            setBackendErrors(null);
            const response = await backend.tournamentService.updateTournament(id, editFields);
            if (response.ok) {
                setUpdateSuccess(true);
                setEditing(false);
                loadTournament();
            } else {
                setBackendErrors(response.error);
            }
        } catch (err) {
            setBackendErrors(err.message);
        } finally {
            setUpdateLoading(false);
        }
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

    const enrolledTeamIds = new Set(
        (tournament.inscripciones || []).map(insc => insc.equipoId)
    );
    const availableTeams = myTeams.filter(
        t => t.estado === 'ACTIVO' && t.creadorId === loggedUser?.id && !enrolledTeamIds.has(t.id)
    );

    return (
        <div className="td-container">
            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

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
            {updateSuccess && (
                <Success message={intl.formatMessage(
                    { id: 'project.tournaments.Detail.updateSuccess', defaultMessage: 'Configuración del torneo actualizada con éxito.' }
                )} onClose={() => setUpdateSuccess(false)} />
            )}

            <nav className="td-top-nav">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        className={`td-top-nav-item ${activeTab === item.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.key)}
                        role="tab"
                    >
                        <i className={item.icon} />
                        <FormattedMessage id={item.labelId} defaultMessage={item.label} />
                    </button>
                ))}
            </nav>

            {activeTab === 'info' && (
                <div className="td-info-profile">
                    <div className="td-hero-panel">
                        <div className="td-hero-top">
                            <div className="td-hero-title-row">
                                <div className="td-hero-name">{tournament.nombre}</div>
                                {est && <span className={`td-hero-badge ${est.css}`}><FormattedMessage id={est.labelId} defaultMessage={est.label} /></span>}
                                {tournament.privado && <span className="td-info-badge-private">🔒 <FormattedMessage id="project.tournaments.Detail.private.badge" defaultMessage="Privado" /></span>}
                            </div>
                            <div className="td-hero-actions">
                                {loggedUser && (
                                    <Button
                                        variant={isFollowing ? 'outline-danger' : 'outline-dark'}
                                        className="rounded-pill td-hero-follow-btn"
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

                        <div className="td-hero-meta">
                            <span className="td-hero-meta-item">
                                <i className="fa-regular fa-user" />{tournament.organizadorNombre}
                            </span>
                            <span className="td-hero-meta-sep">·</span>
                            {!tournament.privado ? (
                                <span className="td-hero-code">
                                    <i className="fa-regular fa-qrcode" />
                                    <span className="td-hero-code-val">{tournament.codigoTorneo}</span>
                                </span>
                            ) : isOrg ? (
                                <span className="td-hero-code td-hero-code--org">
                                    <i className="fa-regular fa-qrcode" />
                                    <span className="td-hero-code-val">{tournament.codigoTorneo}</span>
                                </span>
                            ) : (
                                <span className="td-hero-code td-hero-code--locked">
                                    <i className="fa-solid fa-lock" />
                                    <FormattedMessage id="project.tournaments.Detail.code.private" defaultMessage="Torneo privado" />
                                </span>
                            )}
                            <span className="td-hero-meta-sep">·</span>
                            <span className="td-hero-meta-item">
                                <i className="fa-regular fa-users" />
                                {tournament.inscripciones ? tournament.inscripciones.length : 0} / {tournament.maxEquipos || '∞'} <FormattedMessage id="project.tournaments.Detail.teams" defaultMessage="equipos" />
                            </span>
                        </div>

                        <div className="td-hero-stats">
                            <div className="td-hero-stat">
                                <span className="td-hero-stat-value">{tournament.fechaInicio ? (typeof tournament.fechaInicio === 'string' ? tournament.fechaInicio.substring(0, 10) : tournament.fechaInicio.substring(0, 10)) : '—'}</span>
                                <span className="td-hero-stat-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaInicio" defaultMessage="Fecha de inicio" /></span>
                            </div>
                            <div className="td-hero-stat">
                                <span className="td-hero-stat-value">{tournament.fechaFin ? (typeof tournament.fechaFin === 'string' ? tournament.fechaFin.substring(0, 10) : tournament.fechaFin.substring(0, 10)) : '—'}</span>
                                <span className="td-hero-stat-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaFin" defaultMessage="Fecha de fin" /></span>
                            </div>
                            <div className="td-hero-stat">
                                <span className="td-hero-stat-value">{tournament.fechaLimiteInscripcion ? (typeof tournament.fechaLimiteInscripcion === 'string' ? tournament.fechaLimiteInscripcion.substring(0, 10) : tournament.fechaLimiteInscripcion.substring(0, 10)) : '—'}</span>
                                <span className="td-hero-stat-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaLimite" defaultMessage="Límite inscripción" /></span>
                            </div>
                        </div>
                    </div>

                    {(tournament.estado === 'RECLUTANDO' || tournament.estado === 'INSCRIPCION_CERRADA') && (
                        <div className="td-inscriptions-section">
                            <div className="td-inscriptions-title">
                                <FormattedMessage id="project.tournaments.Detail.section.inscriptions" defaultMessage="Inscripciones" />
                                <span className="td-inscriptions-count">{tournament.numEquiposInscritos || 0}</span>
                            </div>
                            <p className="td-inscriptions-sub">
                                <FormattedMessage id="project.tournaments.Detail.section.inscriptions.sub" defaultMessage="Gestiona las inscripciones de los equipos al torneo." />
                            </p>

                            {tournament.estado === 'RECLUTANDO' && isOrg && (
                                <div className="td-action">
                                    <span className="td-action-text">
                                        <i className="fa-regular fa-circle-xmark" />
                                        <FormattedMessage id="project.tournaments.Detail.closeInscriptions" defaultMessage="Cerrar inscripciones" />
                                    </span>
                                    <Button
                                        variant="outline-dark"
                                        size="sm"
                                        className="rounded-pill td-action-btn"
                                        onClick={handleCloseInscripciones}
                                        disabled={closing}
                                    >
                                        {closing ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <FormattedMessage id="project.tournaments.Detail.close.button" defaultMessage="Cerrar" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {tournament.estado === 'RECLUTANDO' && !isOrg && loggedUser && (
                                <div className="td-enroll">
                                    {availableTeams.length > 0 ? (
                                        <>
                                            <div className="td-enroll-title">
                                                <FormattedMessage id="project.tournaments.Detail.enroll.title" defaultMessage="Inscribir equipo" />
                                            </div>
                                            <div className="td-enroll-sub">
                                                <FormattedMessage id="project.tournaments.Detail.enroll.sub" defaultMessage="Selecciona uno de tus equipos para solicitar la inscripción." />
                                            </div>
                                            <div className="td-enroll-row">
                                                <Form.Select className="td-enroll-select" value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
                                                    <option value="">
                                                        <FormattedMessage id="project.tournaments.Detail.enroll.select" defaultMessage="Seleccionar equipo..." />
                                                    </option>
                                                    {availableTeams.map(t => (
                                                        <option key={t.id} value={t.id}>{t.nombreEquipo}</option>
                                                    ))}
                                                </Form.Select>
                                                <Button
                                                    variant="dark"
                                                    size="sm"
                                                    className="rounded-pill"
                                                    onClick={handleEnrollTeam}
                                                    disabled={!selectedTeamId || enrolling}
                                                >
                                                    {enrolling ? (
                                                        <Spinner animation="border" size="sm" />
                                                    ) : (
                                                        <FormattedMessage id="project.tournaments.Detail.enroll.button" defaultMessage="Solicitar inscripción" />
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="td-enroll-no-teams">
                                            <FormattedMessage id="project.tournaments.Detail.enroll.noTeams" defaultMessage="No tienes equipos disponibles para inscribir o ya están inscritos." />
                                        </div>
                                    )}
                                </div>
                            )}

                            {tournament.estado === 'INSCRIPCION_CERRADA' && isOrg && loggedUser && !tournament.tipoTorneo && tournament.inscripciones && tournament.inscripciones.length > 1 && (
                                <div className="td-config-card">
                                    <div className="td-config-card-header">
                                        <i className="fa-regular fa-gear" />
                                        <FormattedMessage id="project.tournaments.Detail.config.header" defaultMessage="Configurar estructura" />
                                    </div>
                                    <div className="td-config-card-sub">
                                        <FormattedMessage id="project.tournaments.Detail.config.sub" defaultMessage="Define el formato del torneo antes de generar el calendario." />
                                    </div>
                                    {backendErrors && (
                                        <div className="td-config-error">
                                            <i className="fa-regular fa-circle-exclamation" />{backendErrors}
                                        </div>
                                    )}
                                    <form onSubmit={handleConfigure} className="td-config-form">
                                        <div className="td-config-field td-config-field--full">
                                            <label>
                                                <FormattedMessage id="project.tournaments.Create.Step2.tipoTorneo" defaultMessage="Tipo de torneo" />
                                            </label>
                                            <div className="td-config-segmented">
                                                {[
                                                    { value: 'LIGA_UNICA', label: 'Liga única' },
                                                    { value: 'GRUPOS_PLAYOFF', label: 'Grupos + Playoff' },
                                                    { value: 'ELIMINATORIAS', label: 'Eliminatorias' },
                                                ].map(opt => (
                                                    <button key={opt.value} type="button"
                                                        className={`td-config-seg-btn ${configData.tipoTorneo === opt.value ? 'active' : ''}`}
                                                        onClick={() => handleConfigChange('tipoTorneo', opt.value)}>
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`td-config-field td-config-field--num ${configErrors.numGrupos ? 'error' : ''}`}>
                                            <label>
                                                <FormattedMessage id="project.tournaments.Create.Step2.numGrupos" defaultMessage="Grupos" />
                                            </label>
                                            <input type="number" min={1} max={20} value={configData.numGrupos}
                                                onChange={e => handleConfigChange('numGrupos', e.target.value)} />
                                            {configErrors.numGrupos && <span className="td-config-field-error">Válido requerido</span>}
                                        </div>
                                        <div className={`td-config-field td-config-field--num ${configErrors.equiposPorGrupo ? 'error' : ''}`}>
                                            <label>
                                                <FormattedMessage id="project.tournaments.Create.Step2.equiposPorGrupo" defaultMessage="Equipos x grupo" />
                                            </label>
                                            <input type="number" min={1} max={20} value={configData.equiposPorGrupo}
                                                onChange={e => handleConfigChange('equiposPorGrupo', e.target.value)} />
                                            {configErrors.equiposPorGrupo && <span className="td-config-field-error">Válido requerido</span>}
                                        </div>
                                        <div className="td-config-calc td-config-field--full">
                                            <i className="fa-regular fa-calculator" />
                                            {configData.tipoTorneo === 'LIGA_UNICA' ? (
                                                <FormattedMessage id="project.tournaments.Detail.config.calc.liga" defaultMessage="Liga única: {n} equipos en 1 grupo" values={{ n: parseInt(configData.equiposPorGrupo) * parseInt(configData.numGrupos) || 0 }} />
                                            ) : configData.tipoTorneo === 'GRUPOS_PLAYOFF' ? (
                                                <FormattedMessage id="project.tournaments.Detail.config.calc.grupos" defaultMessage="Grupos + Playoff: {total} equipos, {g} grupos de {e}" values={{ total: parseInt(configData.equiposPorGrupo) * parseInt(configData.numGrupos) || 0, g: configData.numGrupos, e: configData.equiposPorGrupo }} />
                                            ) : (
                                                <FormattedMessage id="project.tournaments.Detail.config.calc.elim" defaultMessage="Eliminatorias: {n} equipos" values={{ n: parseInt(configData.equiposPorGrupo) * parseInt(configData.numGrupos) || 0 }} />
                                            )}
                                        </div>
                                        {(configData.tipoTorneo === 'GRUPOS_PLAYOFF' || configData.tipoTorneo === 'ELIMINATORIAS') && (
                                            <div className="td-config-toggles td-config-field--full">
                                                <label className="td-config-toggle">
                                                    <span>
                                                        <FormattedMessage id="project.tournaments.Create.Step2.idaVuelta" defaultMessage="Playoff ida y vuelta" />
                                                    </span>
                                                    <input type="checkbox" checked={configData.idaVueltaPlayoff}
                                                        onChange={e => handleConfigChange('idaVueltaPlayoff', e.target.checked)} />
                                                </label>
                                            </div>
                                        )}
                                        <div className="td-config-actions td-config-field--full">
                                            <button type="button" className="td-config-btn td-config-btn--secondary"
                                                onClick={() => navigate('/')} disabled={configuring}>
                                                <FormattedMessage id="project.tournaments.Detail.config.cancel" defaultMessage="Cancelar" />
                                            </button>
                                            <button type="submit" className="td-config-btn td-config-btn--primary" disabled={configuring}>
                                                {configuring ? (
                                                    <><span className="td-config-spinner" /><FormattedMessage id="project.tournaments.Detail.config.generating" defaultMessage="Generando..." /></>
                                                ) : (
                                                    <><i className="fa-regular fa-calendar-check" /><FormattedMessage id="project.tournaments.Detail.config.generate" defaultMessage="Generar calendario" /></>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'teams' && (
                <div className="td-teams-section">
                    <div className="td-teams-header">
                        <h5 className="td-teams-title">
                            <i className="fa-regular fa-users me-2" />
                            <FormattedMessage id="project.tournaments.Detail.registeredTeams" defaultMessage="Equipos inscritos" />
                        </h5>
                        <span className="td-teams-count">{tournament.inscripciones ? tournament.inscripciones.length : 0} / {tournament.maxEquipos || '∞'}</span>
                    </div>

                    {tournament.inscripciones && tournament.inscripciones.length > 0 ? (
                        <div className="td-teams-grid">
                            {tournament.inscripciones.map(insc => (
                                <div key={insc.equipoId} className="td-teams-card">
                                    <div className="td-teams-card-header">
                                        <div className="td-teams-card-icon">
                                            <i className="fa-regular fa-shield-halved" />
                                        </div>
                                        <div className="td-teams-card-header-info">
                                            <div className="td-teams-card-name">{insc.nombreEquipo}</div>
                                            <div className="td-teams-card-meta">{insc.miembros ? insc.miembros.length : 1} {insc.miembros && insc.miembros.length === 1 ? 'miembro' : 'miembros'}</div>
                                        </div>
                                    </div>
                                    <div className="td-teams-card-body">
                                        <div className="td-teams-card-members">
                                            {insc.miembros && insc.miembros.length > 0 ? (
                                                insc.miembros.map((m, i) => (
                                                    <div key={i} className="td-teams-card-member">
                                                        <ProfileAvatar
                                                            imageUrl={m.imagenPerfil}
                                                            name={m.nombre}
                                                            size={28}
                                                        />
                                                        <div className="td-teams-card-member-info">
                                                            <div className="td-teams-card-member-name-row">
                                                                <span className="td-teams-card-member-name">{m.nombre}</span>
                                                                <span className={`td-elo ${m.elo >= 1500 ? 'high' : ''}`}>
                                                                    <i className="fa-solid fa-bolt" />
                                                                    {m.elo}{m.eloProvisional && <span className="td-elo-provisional">*</span>}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="td-teams-card-member td-teams-card-member--empty">
                                                    <FormattedMessage id="project.tournaments.Detail.teams.noMembers" defaultMessage="Sin miembros" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="td-teams-empty">
                            <i className="fa-regular fa-users-slash me-2" />
                            <FormattedMessage id="project.tournaments.Detail.teams.empty" defaultMessage="No hay equipos inscritos aún." />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'partidos' && (
                <div className="td-fullbleed td-partidos-section">
                    <div className="td-partidos-header">
                        <h5 className="td-partidos-title">
                            <i className="fa-regular fa-calendar" />
                            <FormattedMessage id="project.tournaments.Detail.partidos.title" defaultMessage="Partidos" />
                        </h5>
                    </div>
                    <div className="td-empty-state">
                        <div className="td-empty-state-icon">
                            <i className="fa-regular fa-calendar-circle-exclamation" />
                        </div>
                        <p className="td-empty-state-text">
                            <FormattedMessage id="project.tournaments.Detail.partidos.noCalendar" defaultMessage="Aún no hay partidos. El calendario se generará cuando el organizador configure el torneo." />
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'clasificacion' && (
                <div className="td-fullbleed td-clasificacion-section">
                    <div className="td-clasificacion-header">
                        <h5 className="td-clasificacion-title">
                            <i className="fa-regular fa-trophy" />
                            <FormattedMessage id="project.tournaments.Detail.clasificacion.title" defaultMessage="Clasificación" />
                        </h5>
                        {tournament.estado === 'FASE_GRUPOS' || tournament.estado === 'PLAYOFF' || tournament.estado === 'FINALIZADO' ? (
                            (() => {
                                const gruposMap = {};
                                (tournament.inscripciones || []).forEach(insc => {
                                    const gId = insc.grupoId || 0;
                                    const gNombre = insc.grupoNombre || 'Sin grupo';
                                    if (!gruposMap[gId]) gruposMap[gId] = { nombre: gNombre, equipos: [] };
                                    gruposMap[gId].equipos.push(insc);
                                });
                                const gruposList = Object.entries(gruposMap).map(([id, g]) => ({ id: parseInt(id), ...g }));
                                const currentGrupo = gruposList.length > 0 ? (gruposList.find(g => g.id === selectedGrupoIdx) || gruposList[0]) : null;
                                return (
                                    <>
                                        {gruposList.length > 1 && (
                                            <select
                                                className="td-clasificacion-grupo-select"
                                                value={currentGrupo ? currentGrupo.id : 0}
                                                onChange={e => setSelectedGrupoIdx(parseInt(e.target.value))}
                                            >
                                                {gruposList.map(g => (
                                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                                ))}
                                            </select>
                                        )}
                                    </>
                                );
                            })()
                        ) : null}
                    </div>

                    {tournament.estado === 'FASE_GRUPOS' || tournament.estado === 'PLAYOFF' || tournament.estado === 'FINALIZADO' ? (
                        (() => {
                            const gruposMap = {};
                            (tournament.inscripciones || []).forEach(insc => {
                                const gId = insc.grupoId || 0;
                                const gNombre = insc.grupoNombre || 'Sin grupo';
                                if (!gruposMap[gId]) gruposMap[gId] = { nombre: gNombre, equipos: [] };
                                gruposMap[gId].equipos.push(insc);
                            });
                            const gruposList = Object.entries(gruposMap).map(([id, g]) => ({ id: parseInt(id), ...g }));
                            const currentGrupo = gruposList.length > 0 ? (gruposList.find(g => g.id === selectedGrupoIdx) || gruposList[0]) : null;
                            const equiposGrupo = currentGrupo ? currentGrupo.equipos : tournament.inscripciones || [];
                            return equiposGrupo.length > 0 ? (
                                <table className="td-clasificacion-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.team" defaultMessage="Equipo" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.pj" defaultMessage="PJ" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.g" defaultMessage="G" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.e" defaultMessage="E" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.p" defaultMessage="P" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.dg" defaultMessage="DG" /></th>
                                            <th><FormattedMessage id="project.tournaments.Detail.clasificacion.pts" defaultMessage="PTS" /></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equiposGrupo.map((insc, idx) => {
                                            const pos = idx + 1;
                                            return (
                                                <tr key={insc.equipoId}>
                                                    <td>
                                                        <span className={`td-clasificacion-pos ${pos <= 3 ? `td-clasificacion-pos--${pos}` : ''}`}>
                                                            {pos}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="td-clasificacion-team">
                                                            <div className="td-clasificacion-shield">
                                                                <i className="fa-regular fa-shield-halved" />
                                                            </div>
                                                            {insc.nombreEquipo}
                                                        </div>
                                                    </td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                    <td style={{ color: '#8e8e93' }}>0</td>
                                                    <td>0</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="td-empty-state">
                                    <div className="td-empty-state-icon">
                                        <i className="fa-regular fa-trophy" />
                                    </div>
                                    <p className="td-empty-state-text">
                                        <FormattedMessage id="project.tournaments.Detail.clasificacion.noTeams" defaultMessage="No hay equipos inscritos para mostrar clasificación." />
                                    </p>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="td-empty-state">
                            <div className="td-empty-state-icon">
                                <i className="fa-regular fa-trophy" />
                            </div>
                            <p className="td-empty-state-text">
                                <FormattedMessage id="project.tournaments.Detail.clasificacion.notAvailable" defaultMessage="La clasificación estará disponible cuando el torneo esté en fase de grupos." />
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'params' && (
                <div className="td-config-panel">
                    <div className="td-config-panel-header">
                        <h5 className="td-config-panel-title">
                            <i className="fa-regular fa-sliders me-2" />
                            <FormattedMessage id="project.tournaments.Detail.configPanel.title" defaultMessage="Configuración del torneo" />
                        </h5>
                        {isOrg && (tournament.estado === 'RECLUTANDO' || tournament.estado === 'INSCRIPCION_CERRADA') && (
                            <Button
                                variant={editing ? 'outline-dark' : 'dark'}
                                size="sm"
                                className="rounded-pill td-config-panel-edit-btn"
                                onClick={toggleEditMode}
                            >
                                {editing ? (
                                    <><i className="fa-regular fa-xmark me-1" /><FormattedMessage id="project.global.buttons.cancel" defaultMessage="Cancelar" /></>
                                ) : (
                                    <><i className="fa-regular fa-pen me-1" /><FormattedMessage id="project.global.buttons.edit" defaultMessage="Editar" /></>
                                )}
                            </Button>
                        )}
                    </div>

                    {!editing ? (
                        <div className="td-config-panel-body">
                            <ConfigSection
                                title={<FormattedMessage id="project.tournaments.Detail.configPanel.basicInfo" defaultMessage="Información básica" />}
                                fields={[
                                    { label: <FormattedMessage id="project.global.fields.name" defaultMessage="Nombre" />, value: tournament.nombre },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step1.fechaInicio" defaultMessage="Fecha de inicio" />, value: tournament.fechaInicio ? (typeof tournament.fechaInicio === 'string' ? tournament.fechaInicio : tournament.fechaInicio.substring(0, 10)) : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step1.fechaFin" defaultMessage="Fecha de fin" />, value: tournament.fechaFin ? (typeof tournament.fechaFin === 'string' ? tournament.fechaFin : tournament.fechaFin.substring(0, 10)) : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step1.fechaLimite" defaultMessage="Límite inscripción" />, value: tournament.fechaLimiteInscripcion ? (typeof tournament.fechaLimiteInscripcion === 'string' ? tournament.fechaLimiteInscripcion : tournament.fechaLimiteInscripcion.substring(0, 10)) : '—' },
                                ]}
                            />
                            <ConfigSection
                                title={<FormattedMessage id="project.tournaments.Detail.configPanel.rules" defaultMessage="Reglas y puntuación" />}
                                fields={[
                                    { label: <FormattedMessage id="project.tournaments.Create.Step3.puntosVictoria" defaultMessage="Pts. victoria" />, value: tournament.puntosVictoria != null ? tournament.puntosVictoria : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step3.puntosEmpate" defaultMessage="Pts. empate" />, value: tournament.puntosEmpate != null ? tournament.puntosEmpate : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step3.puntosDerrota" defaultMessage="Pts. derrota" />, value: tournament.puntosDerrota != null ? tournament.puntosDerrota : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step3.formatoPartidos" defaultMessage="Formato partidos" />, value: tournament.formatoPartidos ? (tournament.formatoPartidos === '4_SETS' ? '4 sets' : tournament.formatoPartidos === '5_SETS' ? '5 sets' : tournament.formatoPartidos) : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step3.criterioDesempate" defaultMessage="Desempate" />, value: tournament.criterioDesempate || '—' },
                                ]}
                            />
                            <ConfigSection
                                title={<FormattedMessage id="project.tournaments.Detail.configPanel.calendar" defaultMessage="Calendario" />}
                                fields={[
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.diasDisponibles" defaultMessage="Días" />, value: (tournament.diasDisponibles || []).length > 0 ? (tournament.diasDisponibles || []).join(', ') : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.horaInicio" defaultMessage="Hora inicio" />, value: tournament.horaInicio || '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.horaFin" defaultMessage="Hora fin" />, value: tournament.horaFin || '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.duracionPartido" defaultMessage="Duración (min)" />, value: tournament.duracionPartido != null ? tournament.duracionPartido : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.fechasExcluidas" defaultMessage="Fechas excluidas" />, value: (tournament.fechasExcluidas || []).length > 0 ? (tournament.fechasExcluidas || []).join(', ') : '—' },
                                    { label: <FormattedMessage id="project.tournaments.Create.Step4.estrategiaDistribucion" defaultMessage="Distribución" />, value: tournament.estrategiaDistribucion || '—' },
                                ]}
                            />
                        </div>
                    ) : (
                        <Form onSubmit={handleUpdateConfig} className="td-config-panel-form">
                            <div className="td-config-panel-body">
                                <div className="td-config-panel-subsection">
                                    <h6 className="td-config-panel-subtitle">
                                        <FormattedMessage id="project.tournaments.Detail.configPanel.basicInfo" defaultMessage="Información básica" />
                                    </h6>
                                    <Form.Group className="td-edit-field" controlId="edit-nombre">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.global.fields.name" defaultMessage="Nombre" />
                                        </Form.Label>
                                        <Form.Control type="text" className="form-control-apple" value={editFields.nombre}
                                            onChange={e => handleEditFieldChange('nombre', e.target.value)} />
                                    </Form.Group>
                                    <Row className="g-2">
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-fechaInicio">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step1.fechaInicio" defaultMessage="Fecha inicio" />
                                                </Form.Label>
                                                <Form.Control type="date" className="form-control-apple" value={editFields.fechaInicio}
                                                    onChange={e => handleEditFieldChange('fechaInicio', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-fechaFin">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step1.fechaFin" defaultMessage="Fecha fin" />
                                                </Form.Label>
                                                <Form.Control type="date" className="form-control-apple" value={editFields.fechaFin}
                                                    onChange={e => handleEditFieldChange('fechaFin', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="td-edit-field" controlId="edit-fechaLimite">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step1.fechaLimite" defaultMessage="Límite inscripción" />
                                        </Form.Label>
                                        <Form.Control type="date" className="form-control-apple" value={editFields.fechaLimiteInscripcion}
                                            onChange={e => handleEditFieldChange('fechaLimiteInscripcion', e.target.value)} />
                                    </Form.Group>
                                </div>

                                <div className="td-config-panel-subsection">
                                    <h6 className="td-config-panel-subtitle">
                                        <FormattedMessage id="project.tournaments.Detail.configPanel.rules" defaultMessage="Reglas y puntuación" />
                                    </h6>
                                    <Row className="g-2">
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-puntosVictoria">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step3.puntosVictoria" defaultMessage="Pts. victoria" />
                                                </Form.Label>
                                                <Form.Control type="number" min={0} className="form-control-apple" value={editFields.puntosVictoria}
                                                    onChange={e => handleEditFieldChange('puntosVictoria', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-puntosEmpate">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step3.puntosEmpate" defaultMessage="Pts. empate" />
                                                </Form.Label>
                                                <Form.Control type="number" min={0} className="form-control-apple" value={editFields.puntosEmpate}
                                                    onChange={e => handleEditFieldChange('puntosEmpate', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-puntosDerrota">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step3.puntosDerrota" defaultMessage="Pts. derrota" />
                                                </Form.Label>
                                                <Form.Control type="number" min={0} className="form-control-apple" value={editFields.puntosDerrota}
                                                    onChange={e => handleEditFieldChange('puntosDerrota', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="td-edit-field" controlId="edit-formatoPartidos">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step3.formatoPartidos" defaultMessage="Formato partidos" />
                                        </Form.Label>
                                        <Form.Select className="form-control-apple" value={editFields.formatoPartidos}
                                            onChange={e => handleEditFieldChange('formatoPartidos', e.target.value)}>
                                            <option value="">—</option>
                                            <option value="4_SETS">4 sets</option>
                                            <option value="5_SETS">5 sets</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="td-edit-field" controlId="edit-criterioDesempate">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step3.criterioDesempate" defaultMessage="Desempate" />
                                        </Form.Label>
                                        <Form.Select className="form-control-apple" value={editFields.criterioDesempate}
                                            onChange={e => handleEditFieldChange('criterioDesempate', e.target.value)}>
                                            <option value="">—</option>
                                            <option value="PUNTOS"><FormattedMessage id="project.tournaments.Create.Step3.tiebreaker.points" defaultMessage="Puntos" /></option>
                                            <option value="SET_AVERAGE"><FormattedMessage id="project.tournaments.Create.Step3.tiebreaker.setAvg" defaultMessage="Average de sets" /></option>
                                            <option value="GAME_AVERAGE"><FormattedMessage id="project.tournaments.Create.Step3.tiebreaker.gameAvg" defaultMessage="Average de juegos" /></option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="td-config-panel-subsection">
                                    <h6 className="td-config-panel-subtitle">
                                        <FormattedMessage id="project.tournaments.Detail.configPanel.calendar" defaultMessage="Calendario" />
                                    </h6>
                                    <Form.Group className="td-edit-field">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step4.diasDisponibles" defaultMessage="Días disponibles" />
                                        </Form.Label>
                                        <div className="td-edit-days">
                                            {DAYS_OF_WEEK.map(day => (
                                                <button key={day.key} type="button"
                                                    className={`td-edit-day-btn ${(editFields.diasDisponibles || []).includes(day.key) ? 'active' : ''}`}
                                                    onClick={() => handleToggleDay(day.key)}>
                                                    <FormattedMessage id={day.labelId} defaultMessage={day.label} />
                                                </button>
                                            ))}
                                        </div>
                                    </Form.Group>
                                    <Row className="g-2">
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-horaInicio">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step4.horaInicio" defaultMessage="Hora inicio" />
                                                </Form.Label>
                                                <Form.Control type="time" className="form-control-apple" value={editFields.horaInicio}
                                                    onChange={e => handleEditFieldChange('horaInicio', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="td-edit-field" controlId="edit-horaFin">
                                                <Form.Label className="td-edit-label">
                                                    <FormattedMessage id="project.tournaments.Create.Step4.horaFin" defaultMessage="Hora fin" />
                                                </Form.Label>
                                                <Form.Control type="time" className="form-control-apple" value={editFields.horaFin}
                                                    onChange={e => handleEditFieldChange('horaFin', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="td-edit-field" controlId="edit-duracion">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step4.duracionPartido" defaultMessage="Duración (min)" />
                                        </Form.Label>
                                        <Form.Control type="number" min={5} step={5} className="form-control-apple" value={editFields.duracionPartido}
                                            onChange={e => handleEditFieldChange('duracionPartido', e.target.value)} />
                                    </Form.Group>
                                    <Form.Group className="td-edit-field" controlId="edit-estrategia">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step4.estrategiaDistribucion" defaultMessage="Distribución" />
                                        </Form.Label>
                                        <Form.Select className="form-control-apple" value={editFields.estrategiaDistribucion}
                                            onChange={e => handleEditFieldChange('estrategiaDistribucion', e.target.value)}>
                                            <option value="">—</option>
                                            {DISTRIBUCION_OPTS.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    <FormattedMessage id={opt.labelId} defaultMessage={opt.label} />
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="td-edit-field">
                                        <Form.Label className="td-edit-label">
                                            <FormattedMessage id="project.tournaments.Create.Step4.fechasExcluidas" defaultMessage="Fechas excluidas" />
                                        </Form.Label>
                                        <div className="td-edit-excluded-dates">
                                            {(editFields.fechasExcluidas || []).map(date => (
                                                <span key={date} className="td-edit-excluded-date">
                                                    {date}
                                                    <button type="button" className="td-edit-excluded-remove" onClick={() => handleRemoveExcludedDate(date)}>
                                                        <i className="fa-regular fa-xmark" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="td-edit-excluded-add">
                                            <Form.Control type="date" className="form-control-apple" value={newExcludedDate}
                                                onChange={e => setNewExcludedDate(e.target.value)} />
                                            <Button type="button" variant="outline-dark" size="sm" className="rounded-pill"
                                                onClick={handleAddExcludedDate} disabled={!newExcludedDate}>
                                                <i className="fa-regular fa-plus" />
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="td-config-panel-footer">
                                <Button type="submit" variant="dark" className="rounded-pill px-4 td-save-btn"
                                    disabled={updateLoading}>
                                    {updateLoading ? (
                                        <><Spinner animation="border" size="sm" className="me-1" /><FormattedMessage id="project.global.buttons.saving" defaultMessage="Guardando..." /></>
                                    ) : (
                                        <><i className="fa-regular fa-floppy-disk me-1" /><FormattedMessage id="project.global.buttons.save" defaultMessage="Guardar" /></>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </div>
            )}
        </div>
    );
};

function ConfigSection({ title, fields }) {
    return (
        <div className="td-view-section">
            <h6 className="td-view-section-title">{title}</h6>
            <div className="td-view-fields">
                {fields.map((f, i) => (
                    <div key={i} className="td-view-field">
                        <span className="td-view-field-label">{f.label}</span>
                        <span className="td-view-field-value">{f.value != null && f.value !== '' ? f.value : '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TournamentDetail;
