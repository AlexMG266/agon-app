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

    const [editing, setEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editFields, setEditFields] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        fechaLimiteInscripcion: '',
        puntosVictoria: '',
        puntosEmpate: '',
        puntosDerrota: '',
        formatoPartidos: '',
        criterioDesempate: '',
        diasDisponibles: [],
        horaInicio: '',
        horaFin: '',
        duracionPartido: '',
        fechasExcluidas: [],
        estrategiaDistribucion: '',
    });
    const [newExcludedDate, setNewExcludedDate] = useState('');
    const [activeTab, setActiveTab] = useState('info');

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

    useEffect(() => {
        if (tournament && isOrg && tournament.estado === 'RECLUTANDO') {
            loadPendingRequests();
        }
    }, [tournament?.inscripciones?.length]);

    useEffect(() => {
        if (tournament) {
            const fechaInicio = tournament.fechaInicio || '';
            const fechaFin = tournament.fechaFin || '';
            const fechaLimite = tournament.fechaLimiteInscripcion || '';
            setEditFields({
                nombre: tournament.nombre || '',
                fechaInicio: typeof fechaInicio === 'string' ? fechaInicio : (fechaInicio ? fechaInicio.substring(0, 10) : ''),
                fechaFin: typeof fechaFin === 'string' ? fechaFin : (fechaFin ? fechaFin.substring(0, 10) : ''),
                fechaLimiteInscripcion: typeof fechaLimite === 'string' ? fechaLimite : (fechaLimite ? fechaLimite.substring(0, 10) : ''),
                puntosVictoria: tournament.puntosVictoria != null ? String(tournament.puntosVictoria) : '',
                puntosEmpate: tournament.puntosEmpate != null ? String(tournament.puntosEmpate) : '',
                puntosDerrota: tournament.puntosDerrota != null ? String(tournament.puntosDerrota) : '',
                formatoPartidos: tournament.formatoPartidos || '',
                criterioDesempate: tournament.criterioDesempate || '',
                diasDisponibles: tournament.diasDisponibles || [],
                horaInicio: tournament.horaInicio || '',
                horaFin: tournament.horaFin || '',
                duracionPartido: tournament.duracionPartido != null ? String(tournament.duracionPartido) : '',
                fechasExcluidas: tournament.fechasExcluidas || [],
                estrategiaDistribucion: tournament.estrategiaDistribucion || '',
            });
        }
    }, [tournament]);

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
        const ins = tournament?.numEquiposInscritos || 0;
        if (isNaN(g) || g < 1) e.numGrupos = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.numGruposMin', defaultMessage: 'Debe haber al menos 1 grupo' });
        else if (g > 32) e.numGrupos = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.numGruposMax', defaultMessage: 'Máximo 32 grupos' });
        const porGrupo = Math.ceil(ins / g);
        if (!isNaN(g) && g > 0 && porGrupo < 1) e.capacidad = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.sinEquipos', defaultMessage: 'No hay equipos inscritos para distribuir' });
        else if (!isNaN(g) && g > 0 && porGrupo > 32) e.capacidad = intl.formatMessage({ id: 'project.tournaments.Detail.config.error.demasiadosPorGrupo', defaultMessage: 'Demasiados equipos por grupo ({porGrupo}). Aumenta el número de grupos.' }, { porGrupo });
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
        const equiposInscritos = tournament?.numEquiposInscritos || 0;
        const grupos = parseInt(configData.numGrupos, 10) || 1;
        const equiposPorGrupo = Math.ceil(equiposInscritos / grupos);
        try {
            const res = await backend.tournamentService.configureTournament(id, {
                tipoTorneo: configData.tipoTorneo,
                numGrupos: grupos,
                equiposPorGrupo: equiposPorGrupo,
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

    const toggleEditMode = () => {
        if (editing) {
            setEditFields(p => ({
                ...p,
                ...(tournament ? {
                    nombre: tournament.nombre || '',
                    fechaInicio: tournament.fechaInicio ? (typeof tournament.fechaInicio === 'string' ? tournament.fechaInicio : tournament.fechaInicio.substring(0, 10)) : '',
                    fechaFin: tournament.fechaFin ? (typeof tournament.fechaFin === 'string' ? tournament.fechaFin : tournament.fechaFin.substring(0, 10)) : '',
                    fechaLimiteInscripcion: tournament.fechaLimiteInscripcion ? (typeof tournament.fechaLimiteInscripcion === 'string' ? tournament.fechaLimiteInscripcion : tournament.fechaLimiteInscripcion.substring(0, 10)) : '',
                    puntosVictoria: tournament.puntosVictoria != null ? String(tournament.puntosVictoria) : '',
                    puntosEmpate: tournament.puntosEmpate != null ? String(tournament.puntosEmpate) : '',
                    puntosDerrota: tournament.puntosDerrota != null ? String(tournament.puntosDerrota) : '',
                    formatoPartidos: tournament.formatoPartidos || '',
                    criterioDesempate: tournament.criterioDesempate || '',
                    diasDisponibles: tournament.diasDisponibles || [],
                    horaInicio: tournament.horaInicio || '',
                    horaFin: tournament.horaFin || '',
                    duracionPartido: tournament.duracionPartido != null ? String(tournament.duracionPartido) : '',
                    fechasExcluidas: tournament.fechasExcluidas || [],
                    estrategiaDistribucion: tournament.estrategiaDistribucion || '',
                } : {})
            }));
            setUpdateSuccess(false);
        }
        setEditing(!editing);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields(p => ({ ...p, [field]: value }));
    };

    const handleToggleDay = (dayKey) => {
        setEditFields(p => {
            const current = p.diasDisponibles || [];
            if (current.includes(dayKey)) {
                return { ...p, diasDisponibles: current.filter(d => d !== dayKey) };
            } else {
                return { ...p, diasDisponibles: [...current, dayKey] };
            }
        });
    };

    const handleAddExcludedDate = () => {
        if (newExcludedDate && !editFields.fechasExcluidas.includes(newExcludedDate)) {
            setEditFields(p => ({
                ...p,
                fechasExcluidas: [...(p.fechasExcluidas || []), newExcludedDate]
            }));
            setNewExcludedDate('');
        }
    };

    const handleRemoveExcludedDate = (date) => {
        setEditFields(p => ({
            ...p,
            fechasExcluidas: (p.fechasExcluidas || []).filter(d => d !== date)
        }));
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setBackendErrors(null);
        setUpdateSuccess(false);
        try {
            const body = {
                nombre: editFields.nombre || null,
                fechaInicio: editFields.fechaInicio || null,
                fechaFin: editFields.fechaFin || null,
                fechaLimiteInscripcion: editFields.fechaLimiteInscripcion || null,
                puntosVictoria: editFields.puntosVictoria ? parseInt(editFields.puntosVictoria, 10) : null,
                puntosEmpate: editFields.puntosEmpate ? parseInt(editFields.puntosEmpate, 10) : null,
                puntosDerrota: editFields.puntosDerrota ? parseInt(editFields.puntosDerrota, 10) : null,
                formatoPartidos: editFields.formatoPartidos || null,
                criterioDesempate: editFields.criterioDesempate || null,
                diasDisponibles: (editFields.diasDisponibles && editFields.diasDisponibles.length > 0) ? editFields.diasDisponibles : null,
                horaInicio: editFields.horaInicio || null,
                horaFin: editFields.horaFin || null,
                duracionPartido: editFields.duracionPartido ? parseInt(editFields.duracionPartido, 10) : null,
                fechasExcluidas: (editFields.fechasExcluidas && editFields.fechasExcluidas.length > 0) ? editFields.fechasExcluidas : null,
                estrategiaDistribucion: editFields.estrategiaDistribucion || null,
            };
            const res = await backend.tournamentService.updateTournament(id, body);
            if (res.ok && res.payload) {
                setTournament(res.payload);
                setUpdateSuccess(true);
                setEditing(false);
                setTimeout(() => setUpdateSuccess(false), 3000);
            } else {
                setBackendErrors(res.payload || res.error);
            }
        } catch (err) {
            setBackendErrors(err.message || intl.formatMessage({ id: 'project.tournaments.Detail.updateError', defaultMessage: 'Error al actualizar la configuración' }));
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
        <Container className="td-container">
            <button className="td-back" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left" />
                <FormattedMessage id="project.tournaments.Detail.back" defaultMessage="Volver" />
            </button>

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

            <div className="segmented-control p-1 mb-4 rounded-3 d-flex">
                <button
                    className={`segmented-btn flex-grow-1 border-0 py-2 rounded-3 text-center transition-all ${activeTab === 'info' ? 'active shadow-sm fw-medium text-dark' : 'text-secondary'}`}
                    onClick={() => setActiveTab('info')}
                    role="tab"
                >
                    <i className="fa-regular fa-circle-info me-1" />
                    <FormattedMessage id="project.tournaments.Detail.tabs.info" defaultMessage="Información del torneo" />
                </button>
                <button
                    className={`segmented-btn flex-grow-1 border-0 py-2 rounded-3 text-center transition-all ${activeTab === 'params' ? 'active shadow-sm fw-medium text-dark' : 'text-secondary'}`}
                    onClick={() => setActiveTab('params')}
                    role="tab"
                >
                    <i className="fa-regular fa-sliders me-1" />
                    <FormattedMessage id="project.tournaments.Detail.tabs.params" defaultMessage="Parámetros del torneo" />
                </button>
            </div>

            {activeTab === 'info' && (
                <div className="td-info-profile">
                    <div className="td-info-hero">
                        <div className="td-info-hero-icon">
                            <i className="fa-regular fa-trophy" />
                        </div>
                        <div className="td-info-hero-body">
                            <div className="td-info-hero-name">{tournament.nombre}</div>
                            <div className="td-info-hero-meta">
                                <span className="td-info-hero-org">
                                    <i className="fa-regular fa-user" />{tournament.organizadorNombre}
                                </span>
                                <span className="td-info-hero-sep">·</span>
                                {!tournament.privado ? (
                                    <span className="td-info-hero-code">
                                        <i className="fa-regular fa-qrcode" />
                                        <span className="td-info-code-val">{tournament.codigoTorneo}</span>
                                    </span>
                                ) : isOrg ? (
                                    <span className="td-info-hero-code td-info-code--org">
                                        <i className="fa-regular fa-qrcode" />
                                        <span className="td-info-code-val">{tournament.codigoTorneo}</span>
                                        <span className="td-info-code-hint">
                                            <FormattedMessage id="project.tournaments.Detail.code.organizerHint" defaultMessage="(compártelo para invitar)" />
                                        </span>
                                    </span>
                                ) : (
                                    <span className="td-info-hero-code td-info-code--locked">
                                        <i className="fa-solid fa-lock" />
                                        <span className="td-info-code-txt">
                                            <FormattedMessage id="project.tournaments.Detail.code.private" defaultMessage="Torneo privado" />
                                        </span>
                                    </span>
                                )}
                                {tournament.privado && <span className="td-info-badge-private">🔒 <FormattedMessage id="project.tournaments.Detail.private.badge" defaultMessage="Privado" /></span>}
                            </div>
                        </div>
                        <div className="td-info-hero-aside">
                            {est && <span className={`td-info-badge ${est.css}`}><FormattedMessage id={est.labelId} defaultMessage={est.label} /></span>}
                            {loggedUser && (
                                <Button
                                    variant={isFollowing ? 'outline-danger' : 'outline-dark'}
                                    className="rounded-pill td-info-hero-follow"
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

                    {(tournament.estado === 'RECLUTANDO' || tournament.estado === 'INSCRIPCION_CERRADA') && (
                        <div className="td-info-section">
                            <h3 className="td-info-section-title">
                                <FormattedMessage id="project.tournaments.Detail.section.inscriptions" defaultMessage="Inscripciones" />
                            </h3>

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
                                                    <Button variant="outline-success" size="sm" className="rounded-pill"
                                                        disabled={processingRequestId === req.id}
                                                        onClick={() => handleApproveRequest(req.id)}>
                                                        {processingRequestId === req.id ? (
                                                            <Spinner animation="border" size="sm" />
                                                        ) : (
                                                            <><i className="fa-regular fa-check me-1" /><FormattedMessage id="project.tournaments.Detail.enroll.approve" defaultMessage="Aceptar" /></>
                                                        )}
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill"
                                                        disabled={processingRequestId === req.id}
                                                        onClick={() => handleRejectRequest(req.id)}>
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

                            {tournament.estado === 'RECLUTANDO' && isOrg && loadingRequests && (
                                <div className="td-enroll-requests-loading">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2"><FormattedMessage id="project.tournaments.Detail.enroll.loadingRequests" defaultMessage="Cargando solicitudes..." /></span>
                                </div>
                            )}

                            {tournament.estado === 'INSCRIPCION_CERRADA' && isOrg && (
                                <div className="td-config-card">
                                    <div className="td-config-card-header">
                                        <i className="fa-regular fa-gear" />
                                        <FormattedMessage id="project.tournaments.Detail.config.title" defaultMessage="Configurar estructura del torneo" />
                                    </div>
                                    <p className="td-config-card-sub">
                                        <FormattedMessage id="project.tournaments.Detail.config.subtitle" defaultMessage="Hay {count} equipos inscritos. Define el formato de competición." values={{ count: tournament.numEquiposInscritos || 0 }} />
                                    </p>

                                    {configErrors.capacidad && (
                                        <div className="td-config-error">
                                            <i className="fa-regular fa-circle-exclamation" />
                                            {configErrors.capacidad}
                                        </div>
                                    )}

                                    <form onSubmit={handleConfigure} className="td-config-form">
                                        <div className={`td-config-field ${configData.tipoTorneo === 'ELIMINATORIAS' ? 'td-config-field--full' : ''}`}>
                                            <label><FormattedMessage id="project.tournaments.Detail.config.tipoTorneo" defaultMessage="Tipo de torneo" /></label>
                                            <div className="td-config-segmented">
                                                {[
                                                    { value: 'GRUPOS_PLAYOFF', labelId: 'project.tournaments.Detail.config.tipo.gruposPlayoff', label: 'Grupos + Playoff' },
                                                    { value: 'LIGA_UNICA', labelId: 'project.tournaments.Detail.config.tipo.ligaUnica', label: 'Liga única' },
                                                    { value: 'ELIMINATORIAS', labelId: 'project.tournaments.Detail.config.tipo.eliminatorias', label: 'Eliminatorias' },
                                                ].map(tipo => (
                                                    <button
                                                        key={tipo.value}
                                                        type="button"
                                                        className={`td-config-seg-btn ${configData.tipoTorneo === tipo.value ? 'active' : ''}`}
                                                        onClick={() => handleConfigChange('tipoTorneo', tipo.value)}
                                                    >
                                                        <FormattedMessage id={tipo.labelId} defaultMessage={tipo.label} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {configData.tipoTorneo !== 'ELIMINATORIAS' && (
                                            <div className="td-config-field td-config-field--num">
                                                <label><FormattedMessage id="project.tournaments.Detail.config.numGrupos" defaultMessage="Número de grupos" /></label>
                                                <input type="number" min={1} max={32} value={configData.numGrupos}
                                                    onChange={e => handleConfigChange('numGrupos', e.target.value)}
                                                    className={configErrors.numGrupos ? 'error' : ''} />
                                                {configErrors.numGrupos && (
                                                    <span className="td-config-field-error">{configErrors.numGrupos}</span>
                                                )}
                                                {!configErrors.capacidad && (
                                                    <div className="td-config-calc">
                                                        <i className="fa-regular fa-circle-check" />
                                                        <FormattedMessage id="project.tournaments.Detail.config.equiposPorGrupoCalc"
                                                            defaultMessage="{inscritos} equipos · {grupos} grupos = {porGrupo} equipos por grupo"
                                                            values={{
                                                                inscritos: tournament.numEquiposInscritos || 0,
                                                                grupos: parseInt(configData.numGrupos, 10) || 1,
                                                                porGrupo: Math.ceil((tournament.numEquiposInscritos || 0) / (parseInt(configData.numGrupos, 10) || 1)),
                                                            }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {configData.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                                            <div className="td-config-toggles">
                                                <label className="td-config-toggle">
                                                    <span><FormattedMessage id="project.tournaments.Detail.config.tienePlayoff" defaultMessage="Playoff" /></span>
                                                    <input type="checkbox" role="switch" checked={configData.tienePlayoff}
                                                        onChange={e => handleConfigChange('tienePlayoff', e.target.checked)} />
                                                </label>
                                                {configData.tienePlayoff && (
                                                    <label className="td-config-toggle">
                                                        <span><FormattedMessage id="project.tournaments.Detail.config.idaVueltaPlayoff" defaultMessage="Ida y vuelta en playoff" /></span>
                                                        <input type="checkbox" role="switch" checked={configData.idaVueltaPlayoff}
                                                            onChange={e => handleConfigChange('idaVueltaPlayoff', e.target.checked)} />
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        <div className="td-config-actions">
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

            {activeTab === 'params' && (
                <div className="td-tab-content">
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
                                    {/* Basic Info */}
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
                </div>
            )}
        </Container>
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
