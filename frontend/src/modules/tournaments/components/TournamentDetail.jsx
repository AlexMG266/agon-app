import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { Errors, Success } from '../../common';
import TeamInfoModal from '../../teams/components/TeamInfoModal';
import EncuentroModal from './EncuentroModal';
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
    { value: 'RAPIDO', labelId: 'project.tournaments.Create.Step4.dist.rapido', label: 'Rápido' },
];


const NAV_ITEMS = [
    { key: 'info', icon: 'fa-regular fa-circle-info', labelId: 'project.tournaments.Detail.tabs.info', label: 'Información' },
    { key: 'teams', icon: 'fa-regular fa-users', labelId: 'project.tournaments.Detail.section.teams', label: 'Equipos' },
    { key: 'partidos', icon: 'fa-regular fa-calendar', labelId: 'project.tournaments.Detail.tabs.partidos', label: 'Partidos' },
    { key: 'playoffs', icon: 'fa-regular fa-sitemap', labelId: 'project.tournaments.Detail.tabs.playoffs', label: 'Playoffs' },
    { key: 'clasificacion', icon: 'fa-regular fa-trophy', labelId: 'project.tournaments.Detail.tabs.clasificacion', label: 'Clasificación' },
];

/**
 * Calcula la distribución de equipos entre grupos de forma equilibrada.
 * Reparte los equipos "round-robin": base = floor(total/grupos) y los
 * sobrantes se añaden uno a cada grupo hasta agotarlos, de modo que la
 * diferencia de tamaño entre el grupo más grande y el más pequeño es como
 * mucho de 1 equipo.
 *
 * @param {number|string} numGrupos Número de grupos
 * @param {number|string} totalEquipos Equipos inscritos
 * @returns {Array<number>} Tamaño de cada grupo (índice = grupo)
 */
const calcularDistribucionGrupos = (numGrupos, totalEquipos) => {
    const g = Math.max(1, parseInt(numGrupos) || 1);
    const total = Math.max(0, parseInt(totalEquipos) || 0);
    if (total === 0) return [];
    const base = Math.floor(total / g);
    const resto = total % g;
    return Array.from({ length: g }, (_, i) => (i < resto ? base + 1 : base));
};

/**
 * Devuelve el mayor tamaño de grupo para la distribución equilibrada.
 * Es el valor que se envía como `equiposPorGrupo` al backend.
 */
const calcularEquiposPorGrupoMax = (numGrupos, totalEquipos) => {
    const dist = calcularDistribucionGrupos(numGrupos, totalEquipos);
    return dist.length ? Math.max(...dist) : 0;
};

// Rondas de inicio de la eliminatoria: valores que entiende el backend (rondaInicioPlayoff).
const RONDA_OPTS = [
    { value: 'OCTAVOS', label: 'Octavos de final', equipos: 16 },
    { value: 'CUARTOS', label: 'Cuartos de final', equipos: 8 },
    { value: 'SEMIFINALES', label: 'Semifinales', equipos: 4 },
    { value: 'FINAL', label: 'Final', equipos: 2 },
];

const esPotenciaDeDos = (n) => n > 0 && (n & (n - 1)) === 0;

/**
 * Devuelve cuántos equipos pasan por grupo según la ronda de inicio elegida.
 * equiposEnRonda / numGrupos (entero). Si no es divisible devuelve 0 (config inválida).
 */
const clasificadosPorGrupo = (ronda, numGrupos) => {
    const opt = RONDA_OPTS.find(o => o.value === ronda);
    if (!opt || !numGrupos) return 0;
    const g = parseInt(numGrupos) || 0;
    if (!g || opt.equipos % g !== 0) return 0;
    return opt.equipos / g;
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
    const [configSuccess, setConfigSuccess] = useState(false);
    const [closeSuccess, setCloseSuccess] = useState(false);
    const [enrollRequestSent, setEnrollRequestSent] = useState(null);
    const carouselRef = useRef(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [modalEquipoId, setModalEquipoId] = useState(null);
    const [teamsPage, setTeamsPage] = useState(1);
    const TEAMS_PER_PAGE = 10;
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [configData, setConfigData] = useState({
        tipoTorneo: 'GRUPOS_PLAYOFF',
        numGrupos: 2,
        equiposPorGrupo: 2,
        tienePlayoff: true,
        idaVueltaPlayoff: false,
        rondaInicioPlayoff: 'CUARTOS',
        fechaFin: '',
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
        diasEntreJornadas: 7,
        fechasExcluidas: [],
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [newExcludedDate, setNewExcludedDate] = useState('');
    const [selectedGrupoIdx, setSelectedGrupoIdx] = useState(0);
    const [jornadas, setJornadas] = useState([]);
    const [currentJornadaIdx, setCurrentJornadaIdx] = useState(0);
    const [loadingJornadas, setLoadingJornadas] = useState(false);
    const [selectedEncuentro, setSelectedEncuentro] = useState(null);

    // IDs de equipos donde el usuario es miembro (cualquier miembro puede registrar resultados).
    const capitanTeamIds = (tournament && tournament.inscripciones && loggedUser
        ? tournament.inscripciones
              .filter(insc => insc.miembros && insc.miembros.some(m => m.id === loggedUser.id))
              .map(insc => insc.equipoId)
        : []);


    useEffect(() => {
        loadTournament();
    }, [id]);

    useEffect(() => {
        if (loggedUser) loadMyTeams();
    }, [loggedUser]);

    useEffect(() => {
        loadJornadas();
    }, [id]);

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
                if (response.payload.fechaFin) {
                    setConfigData(prev => ({ ...prev, fechaFin: response.payload.fechaFin }));
                }
                if (response.payload.estrategiaDistribucion === 'UNIFORME') {
                    setConfigData(prev => ({ ...prev, estrategiaDistribucion: 'RAPIDO' }));
                }
                // Calcular automáticamente el número de equipos por grupo en función
                // de los inscritos y del número de grupos (distribución equilibrada).
                const inscritos = (response.payload.inscripciones || []).length;
                if (inscritos > 0) {
                    setConfigData(prev => {
                        const maxPorGrupo = calcularEquiposPorGrupoMax(prev.numGrupos, inscritos);
                        return maxPorGrupo > 0 ? { ...prev, equiposPorGrupo: maxPorGrupo } : prev;
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

    const loadJornadas = async () => {
        try {
            setLoadingJornadas(true);
            const response = await backend.tournamentService.getTournamentJornadas(id);
            if (response.ok && response.payload) {
                setJornadas(response.payload);
                setCurrentJornadaIdx(0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingJornadas(false);
        }
    };

    // Tras registrar un resultado se refrescan jornadas (puede haberse generado el playoff)
    // y también el torneo (para actualizar el estado si pasa a PLAYOFF).
    const handleRegistered = async () => {
        await loadJornadas();
        try {
            const response = await backend.tournamentService.getTournament(id);
            if (response.ok && response.payload) {
                setTournament(response.payload);
            }
        } catch (err) {
            console.error(err);
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
                const errorMsg = response.payload?.message || response.error || (typeof response.payload === 'string' ? response.payload : 'Error al solicitar inscripción');
                setBackendErrors(errorMsg);
            }
        } catch (err) {
            setBackendErrors(err.message || 'Error al solicitar inscripción');
        } finally {
            setEnrolling(false);
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
        if (parseInt(configData.equiposPorGrupo) < 1) errors.equiposPorGrupo = true;
        if (configData.tipoTorneo === 'GRUPOS_PLAYOFF') {
            const numGrupos = parseInt(configData.numGrupos) || 0;
            // El número de grupos debe ser potencia de 2 para poder calibrar un cuadro
            // de eliminatorias sin byes (FINAL/SEMIFINALES/CUARTOS/OCTAVOS/...).
            if (!esPotenciaDeDos(numGrupos)) {
                errors.numGrupos = true;
            }
            // La ronda elegida debe ser divisible por el número de grupos.
            if (clasificadosPorGrupo(configData.rondaInicioPlayoff, numGrupos) < 1) {
                errors.rondaInicioPlayoff = true;
            }
        }
        setConfigErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Calcula una fecha de fin propuesta basada en la configuración actual del torneo.
     * Usa los datos reales: número de grupos, equipos, estrategia de distribución y playoff.
     */
    const calcularFinPropuesto = (data, tournament) => {
        if (!tournament?.fechaInicio) return '';
        const estrategia = tournament.estrategiaDistribucion || 'JORNADAS';
        const diasEntre = tournament.diasEntreJornadas != null ? tournament.diasEntreJornadas : 7;
        // El número de rondas depende del grupo más grande
        const equiposPorGrupo = parseInt(data.equiposPorGrupo) || 2;
        const tienePlayoff = data.tipoTorneo === 'GRUPOS_PLAYOFF';
        const idaVuelta = data.idaVueltaPlayoff || false;

        // Calcular el número de rondas de liga necesarias
        const N = equiposPorGrupo;
        const rondasLiga = (N % 2 === 0) ? N - 1 : N; // circle method

        // Calcular días según estrategia de distribución
        let diasLiga;
        if (estrategia === 'JORNADAS') {
            diasLiga = (rondasLiga - 1) * diasEntre;
        } else {
            // RAPIDO: consecutivos
            diasLiga = rondasLiga - 1;
        }

        let totalDays = diasLiga;

        // Añadir buffer para playoff si aplica
        if (tienePlayoff) {
            const estrPlayoff = data.estrategiaPlayoff || 'RAPIDO';
            const diasEntrePlayoff = (estrPlayoff === 'JORNADAS') ? (data.diasEntrePlayoff || 7) : 1;
            // Rondas de la eliminatoria según la ronda de inicio: OCTAVOS=4, CUARTOS=3,
            // SEMIFINALES=2, FINAL=1 (y se duplican si es ida/vuelta). Compatibilidad: 3.
            const rondaOpt = RONDA_OPTS.find(o => o.value === data.rondaInicioPlayoff);
            const rondasEliminatoria = rondaOpt ? Math.log2(rondaOpt.equipos) : 3;
            const rondasPlayoff = idaVuelta ? rondasEliminatoria * 2 : rondasEliminatoria;
            totalDays += rondasPlayoff * diasEntrePlayoff;
        }

        // Buffer de seguridad de 3 días
        totalDays += 3;

        const start = new Date(tournament.fechaInicio + 'T12:00:00');
        const end = new Date(start);
        end.setDate(end.getDate() + totalDays);
        return end.toISOString().split('T')[0];
    };

    const handleConfigChange = (field, value) => {
        setConfigData(prev => {
            const newData = { ...prev, [field]: value };
            const totalInscritos = tournament?.inscripciones?.length || 0;
            // Al cambiar el número de grupos (o el tipo de torneo) se calcula
            // automáticamente cuántos equipos irán por grupo de forma equilibrada:
            // base = floor(total/grupos) y los sobrantes se reparten round-robin,
            // de modo que la diferencia entre grupos sea como mucho de 1 equipo.
            if (field === 'numGrupos' || field === 'tipoTorneo') {
                const maxPorGrupo = calcularEquiposPorGrupoMax(newData.numGrupos, totalInscritos);
                if (maxPorGrupo > 0) {
                    newData.equiposPorGrupo = maxPorGrupo;
                }
            }
            // Auto-calcular fechaFin cuando cambian parámetros relevantes
            if (field !== 'fechaFin' && tournament) {
                newData.fechaFin = calcularFinPropuesto(newData, tournament);
            }
            return newData;
        });
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
                rondaInicioPlayoff: configData.tipoTorneo === 'GRUPOS_PLAYOFF'
                    ? configData.rondaInicioPlayoff : null,
                estrategiaPlayoff: configData.estrategiaPlayoff || 'RAPIDO',
                diasEntrePlayoff: configData.diasEntrePlayoff || null,
                fechaFin: configData.fechaFin || null,
            });
            if (response.ok) {
                setConfigSuccess(true);
                loadTournament();
                loadJornadas();
            } else {
                setBackendErrors(response.payload || response.error);
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
                // Compatibilidad: 'UNIFORME' eliminada, se normaliza a 'RAPIDO' al editar
                estrategiaDistribucion: tournament.estrategiaDistribucion === 'UNIFORME' ? 'RAPIDO' : (tournament.estrategiaDistribucion || ''),
                diasEntreJornadas: tournament.diasEntreJornadas ?? 7,
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

    // Equipos inscritos y distribución equilibrada calculada automáticamente
    const totalInscritos = (tournament.inscripciones || []).length;
    const distribucionGrupos = calcularDistribucionGrupos(configData.numGrupos, totalInscritos);
    const distribucionTexto = distribucionGrupos.length > 0
        ? distribucionGrupos.map((n, i) => `${String.fromCharCode(65 + i)}: ${n}`).join(' · ')
        : '—';

    const enrolledTeamIds = new Set(
        (tournament.inscripciones || []).map(insc => insc.equipoId)
    );
    const availableTeams = myTeams.filter(
        t => t.estado === 'ACTIVO' && t.creadorId === loggedUser?.id && !enrolledTeamIds.has(t.id)
    );

    return (
        <>
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
                        <span className="td-top-nav-item-label">
                            <FormattedMessage id={item.labelId} defaultMessage={item.label} />
                        </span>
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
                                            <i className="fa-regular fa-circle-exclamation" />
                                            {typeof backendErrors === 'string' ? backendErrors : backendErrors.globalError}
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
                                            <input type="number" min={1} max={16} step={1} value={configData.numGrupos}
                                                onChange={e => handleConfigChange('numGrupos', e.target.value)} />
                                            {configData.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                                                <span className="td-config-field-hint">
                                                    <FormattedMessage id="project.tournaments.Detail.config.numGruposPotencia" defaultMessage="Debe ser potencia de 2 (1, 2, 4, 8, 16) para cuadrar la eliminatoria." />
                                                </span>
                                            )}
                                            {configErrors.numGrupos && <span className="td-config-field-error">
                                                {configData.tipoTorneo === 'GRUPOS_PLAYOFF'
                                                    ? 'El número de grupos debe ser potencia de 2 para la eliminatoria'
                                                    : 'Válido requerido'}
                                            </span>}
                                        </div>
                                        <div className={`td-config-field td-config-field--num ${configErrors.equiposPorGrupo ? 'error' : ''}`}>
                                            <label>
                                                <FormattedMessage id="project.tournaments.Detail.config.equiposPorGrupoAuto" defaultMessage="Equipos por grupo (auto)" />
                                            </label>
                                            <div className="td-config-auto-value">
                                                {configData.equiposPorGrupo > 0 ? configData.equiposPorGrupo : '—'}
                                            </div>
                                            <span className="td-config-field-hint">
                                                <FormattedMessage id="project.tournaments.Detail.config.equiposPorGrupoAutoHint" defaultMessage="Calculado automáticamente según los equipos inscritos." />
                                            </span>
                                        </div>
                                        <div className="td-config-calc td-config-field--full">
                                            <i className="fa-regular fa-calculator" />
                                            {configData.tipoTorneo === 'LIGA_UNICA' ? (
                                                <FormattedMessage id="project.tournaments.Detail.config.calc.liga" defaultMessage="Liga única: {total} equipos en 1 grupo" values={{ total: totalInscritos }} />
                                            ) : (
                                                <FormattedMessage id="project.tournaments.Detail.config.calc.grupos" defaultMessage="Grupos + Playoff: {total} equipos en {g} grupos: {dist}" values={{ total: totalInscritos, g: configData.numGrupos, dist: distribucionTexto }} />
                                            )}
                                        </div>
                                        {configData.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                                            <>
                                                <div className={`td-config-field td-config-field--full ${configErrors.rondaInicioPlayoff ? 'error' : ''}`}>
                                                    <label className="td-edit-label">
                                                        <FormattedMessage id="project.tournaments.Detail.config.rondaInicio" defaultMessage="Ronda de inicio de la eliminatoria" />
                                                    </label>
                                                    <select className="form-control-apple" value={configData.rondaInicioPlayoff}
                                                        onChange={e => handleConfigChange('rondaInicioPlayoff', e.target.value)}>
                                                        {RONDA_OPTS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    {configErrors.rondaInicioPlayoff && <span className="td-config-field-error">
                                                        La ronda elegida no divide exactamente el número de grupos
                                                    </span>}
                                                    {!configErrors.rondaInicioPlayoff && clasificadosPorGrupo(configData.rondaInicioPlayoff, configData.numGrupos) > 0 && (
                                                        <span className="td-config-field-hint">
                                                            <FormattedMessage id="project.tournaments.Detail.config.clasificadosPorGrupo" defaultMessage="Pasan {n} equipos por grupo ({total} en total)" values={{ n: clasificadosPorGrupo(configData.rondaInicioPlayoff, configData.numGrupos), total: parseInt(configData.numGrupos) * clasificadosPorGrupo(configData.rondaInicioPlayoff, configData.numGrupos) }} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="td-config-toggles td-config-field--full">
                                                    <label className="td-config-toggle">
                                                        <span>
                                                            <FormattedMessage id="project.tournaments.Create.Step2.idaVuelta" defaultMessage="Playoff ida y vuelta" />
                                                        </span>
                                                        <input type="checkbox" checked={configData.idaVueltaPlayoff}
                                                            onChange={e => handleConfigChange('idaVueltaPlayoff', e.target.checked)} />
                                                    </label>
                                                </div>
                                                <div className="td-config-field td-config-field--full">
                                                    <label className="td-edit-label">
                                                        <FormattedMessage id="project.tournaments.Detail.config.playoffDistribution" defaultMessage="Distribución playoff" />
                                                    </label>
                                                    <select className="form-control-apple" value={configData.estrategiaPlayoff || 'RAPIDO'}
                                                        onChange={e => handleConfigChange('estrategiaPlayoff', e.target.value)}>
                                                        <option value="RAPIDO">Rápido</option>
                                                        <option value="JORNADAS">Jornadas</option>
                                                    </select>
                                                </div>
                                                {configData.estrategiaPlayoff === 'JORNADAS' && (
                                                    <div className="td-config-field td-config-field--num">
                                                        <label className="td-edit-label">
                                                            <FormattedMessage id="project.tournaments.Detail.config.daysBetweenPlayoff" defaultMessage="Días entre rondas" />
                                                        </label>
                                                        <input type="number" min={1} max={30} step={1} className="form-control-apple" value={configData.diasEntrePlayoff ?? 7}
                                                            onChange={e => handleConfigChange('diasEntrePlayoff', parseInt(e.target.value))} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="td-config-field td-config-field--full" style={{ marginTop: '8px' }}>
                                            <label className="td-edit-label">
                                                <FormattedMessage id="project.tournaments.Detail.config.endDate" defaultMessage="Fecha de fin (estimada)" />
                                                <i className="fa-regular fa-circle-question ms-1 text-muted" title="Se calcula automáticamente según la configuración. Puedes modificarla manualmente." />
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="date" className="form-control-apple" style={{ flex: 1 }}
                                                    value={configData.fechaFin || ''}
                                                    onChange={e => handleConfigChange('fechaFin', e.target.value)} />
                                                {!configData.fechaFin && tournament?.fechaInicio && (
                                                    <button type="button" className="td-config-btn td-config-btn--secondary" style={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '0.8rem' }}
                                                        onClick={() => handleConfigChange('fechaFin', calcularFinPropuesto(configData, tournament))}>
                                                        <i className="fa-regular fa-calculator me-1" />
                                                        Calcular
                                                    </button>
                                                )}
                                            </div>
                                            {configData.fechaFin && tournament?.fechaInicio && (
                                                <small className="text-muted" style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                                                    <i className="fa-regular fa-calendar me-1" />
                                                    Inicio: {tournament.fechaInicio} → Fin: {configData.fechaFin}
                                                </small>
                                            )}
                                        </div>
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

                    {/* Parámetros del torneo — visible para todos los usuarios */}
                    <div className="td-config-panel">
                        <div className="td-config-panel-header">
                            <h5 className="td-config-panel-title">
                                <i className="fa-regular fa-sliders me-2" />
                                <FormattedMessage id="project.tournaments.Detail.params.title" defaultMessage="Parámetros del torneo" />
                            </h5>
                            {isOrg && !editing && (
                                <button
                                    type="button"
                                    className="td-config-panel-edit-btn"
                                    onClick={toggleEditMode}
                                    disabled={updateLoading || tournament.tipoTorneo}
                                    title={tournament.tipoTorneo ? "El torneo ya ha comenzado y no puede editarse" : ""}
                                >
                                    {tournament.tipoTorneo ? (
                                        <><i className="fa-regular fa-lock me-1" /><FormattedMessage id="project.tournaments.Detail.params.locked" defaultMessage="Bloqueado" /></>
                                    ) : (
                                        <><i className="fa-regular fa-pen me-1" /><FormattedMessage id="project.tournaments.Detail.params.edit" defaultMessage="Editar" /></>
                                    )}
                                </button>
                            )}
                            {isOrg && editing && (
                                <button
                                    type="button"
                                    className="td-config-panel-edit-btn"
                                    onClick={toggleEditMode}
                                    disabled={updateLoading}
                                >
                                    <i className="fa-regular fa-xmark me-1" /><FormattedMessage id="project.tournaments.Detail.params.cancel" defaultMessage="Cancelar" />
                                </button>
                            )}
                        </div>

                        {isOrg && editing ? (
                            /* MODO EDICIÓN — solo organizador */
                            <form onSubmit={handleUpdateConfig} className="td-edit-form">
                                <h6 className="td-edit-section-title">
                                    <FormattedMessage id="project.tournaments.Detail.params.infoTitle" defaultMessage="Información básica" />
                                </h6>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step1.nombre" defaultMessage="Nombre" /></span>
                                    <input type="text" className="td-edit-input" value={editFields.nombre}
                                        onChange={e => handleEditFieldChange('nombre', e.target.value)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaInicio" defaultMessage="Fecha de inicio" /></span>
                                    <input type="date" className="td-edit-input" value={editFields.fechaInicio}
                                        onChange={e => handleEditFieldChange('fechaInicio', e.target.value)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaFin" defaultMessage="Fecha de fin" /></span>
                                    <input type="date" className="td-edit-input" value={editFields.fechaFin}
                                        onChange={e => handleEditFieldChange('fechaFin', e.target.value)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaLimite" defaultMessage="Límite inscripción" /></span>
                                    <input type="date" className="td-edit-input" value={editFields.fechaLimiteInscripcion}
                                        onChange={e => handleEditFieldChange('fechaLimiteInscripcion', e.target.value)} />
                                </div>

                                <div className="td-edit-section-divider" />

                                <h6 className="td-edit-section-title">
                                    <FormattedMessage id="project.tournaments.Detail.params.scoringTitle" defaultMessage="Sistema de puntuación" />
                                </h6>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosVictoria" defaultMessage="Puntos victoria" /></span>
                                    <input type="number" min={0} className="td-edit-input td-edit-input--sm" value={editFields.puntosVictoria}
                                        onChange={e => handleEditFieldChange('puntosVictoria', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosEmpate" defaultMessage="Puntos empate" /></span>
                                    <input type="number" min={0} className="td-edit-input td-edit-input--sm" value={editFields.puntosEmpate}
                                        onChange={e => handleEditFieldChange('puntosEmpate', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosDerrota" defaultMessage="Puntos derrota" /></span>
                                    <input type="number" min={0} className="td-edit-input td-edit-input--sm" value={editFields.puntosDerrota}
                                        onChange={e => handleEditFieldChange('puntosDerrota', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step3.formatoPartidos" defaultMessage="Formato partidos" /></span>
                                    <select className="td-edit-input" value={editFields.formatoPartidos}
                                        onChange={e => handleEditFieldChange('formatoPartidos', e.target.value)}>
                                        <option value="">—</option>
                                        <option value="BO1">BO1 (Al mejor de 1)</option>
                                        <option value="BO3">BO3 (Al mejor de 3)</option>
                                        <option value="BO5">BO5 (Al mejor de 5)</option>
                                    </select>
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step3.criterioDesempate" defaultMessage="Criterio desempate" /></span>
                                    <select className="td-edit-input" value={editFields.criterioDesempate}
                                        onChange={e => handleEditFieldChange('criterioDesempate', e.target.value)}>
                                        <option value="">—</option>
                                        <option value="DIFERENCIA_GOLES">Diferencia de goles</option>
                                        <option value="ENFRENTAMIENTO_DIRECTO">Enfrentamiento directo</option>
                                        <option value="PARTIDOS_GANADOS">Partidos ganados</option>
                                    </select>
                                </div>

                                <div className="td-edit-section-divider" />

                                <h6 className="td-edit-section-title">
                                    <FormattedMessage id="project.tournaments.Detail.params.scheduleTitle" defaultMessage="Calendario" />
                                </h6>
                                <div className="td-edit-row td-edit-row--full">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.diasDisponibles" defaultMessage="Días disponibles" /></span>
                                    <div className="td-edit-days">
                                        {DAYS_OF_WEEK.map(d => (
                                            <button
                                                key={d.key}
                                                type="button"
                                                className={`td-edit-day-btn ${(editFields.diasDisponibles || []).includes(d.key) ? 'active' : ''}`}
                                                onClick={() => handleToggleDay(d.key)}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.horaInicio" defaultMessage="Hora inicio" /></span>
                                    <input type="time" className="td-edit-input" value={editFields.horaInicio}
                                        onChange={e => handleEditFieldChange('horaInicio', e.target.value)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.horaFin" defaultMessage="Hora fin" /></span>
                                    <input type="time" className="td-edit-input" value={editFields.horaFin}
                                        onChange={e => handleEditFieldChange('horaFin', e.target.value)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.duracionPartido" defaultMessage="Duración partido (min)" /></span>
                                    <input type="number" min={5} step={5} className="td-edit-input td-edit-input--sm" value={editFields.duracionPartido}
                                        onChange={e => handleEditFieldChange('duracionPartido', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.distribucion" defaultMessage="Distribución" /></span>
                                    <select className="td-edit-input" value={editFields.estrategiaDistribucion}
                                        onChange={e => handleEditFieldChange('estrategiaDistribucion', e.target.value)}>
                                        <option value="">—</option>
                                        {DISTRIBUCION_OPTS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="td-edit-row">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.diasEntreJornadas" defaultMessage="Días entre jornadas" /></span>
                                    <input type="number" min={1} max={30} className="td-edit-input td-edit-input--sm" value={editFields.diasEntreJornadas ?? 7}
                                        onChange={e => handleEditFieldChange('diasEntreJornadas', parseInt(e.target.value) || 7)} />
                                </div>
                                <div className="td-edit-row td-edit-row--full">
                                    <span className="td-edit-label"><FormattedMessage id="project.tournaments.Create.Step4.fechasExcluidas" defaultMessage="Fechas excluidas" /></span>
                                    <div className="td-edit-excluded-dates">
                                        <div className="td-edit-excluded-row">
                                            <input type="date" className="td-edit-input" value={newExcludedDate}
                                                onChange={e => setNewExcludedDate(e.target.value)} />
                                            <button type="button" className="td-edit-add-date-btn" onClick={handleAddExcludedDate}>
                                                <i className="fa-regular fa-plus" />
                                            </button>
                                        </div>
                                        {(editFields.fechasExcluidas || []).length > 0 && (
                                            <div className="td-edit-excluded-list">
                                                {(editFields.fechasExcluidas || []).map(date => (
                                                    <span key={date} className="td-edit-excluded-tag">
                                                        {date}
                                                        <button type="button" className="td-edit-excluded-remove"
                                                            onClick={() => handleRemoveExcludedDate(date)}>
                                                            <i className="fa-regular fa-xmark" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="td-edit-footer">
                                    <button type="submit" className="td-config-btn td-config-btn--primary" disabled={updateLoading}>
                                        {updateLoading ? (
                                            <><Spinner animation="border" size="sm" /><FormattedMessage id="project.tournaments.Detail.params.saving" defaultMessage="Guardando..." /></>
                                        ) : (
                                            <><i className="fa-regular fa-floppy-disk me-1" /><FormattedMessage id="project.tournaments.Detail.params.save" defaultMessage="Guardar cambios" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* MODO VISUALIZACIÓN — visible para todos */
                            <div className="td-view-content">
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step1.nombre" defaultMessage="Nombre" /></span>
                                    <span className="td-view-field-value">{tournament.nombre || '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaInicio" defaultMessage="Fecha de inicio" /></span>
                                    <span className="td-view-field-value">{tournament.fechaInicio ? tournament.fechaInicio.substring(0, 10) : '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaFin" defaultMessage="Fecha de fin" /></span>
                                    <span className="td-view-field-value">{tournament.fechaFin ? tournament.fechaFin.substring(0, 10) : '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step1.fechaLimite" defaultMessage="Límite inscripción" /></span>
                                    <span className="td-view-field-value">{tournament.fechaLimiteInscripcion ? tournament.fechaLimiteInscripcion.substring(0, 10) : '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosVictoria" defaultMessage="Puntos victoria" /></span>
                                    <span className="td-view-field-value">{tournament.puntosVictoria ?? '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosEmpate" defaultMessage="Puntos empate" /></span>
                                    <span className="td-view-field-value">{tournament.puntosEmpate ?? '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step3.puntosDerrota" defaultMessage="Puntos derrota" /></span>
                                    <span className="td-view-field-value">{tournament.puntosDerrota ?? '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step3.formatoPartidos" defaultMessage="Formato partidos" /></span>
                                    <span className="td-view-field-value">{tournament.formatoPartidos || '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step3.criterioDesempate" defaultMessage="Criterio desempate" /></span>
                                    <span className="td-view-field-value">{tournament.criterioDesempate || '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.diasDisponibles" defaultMessage="Días disponibles" /></span>
                                    <span className="td-view-field-value">{tournament.diasDisponibles ? tournament.diasDisponibles.join(', ') : '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.horaInicio" defaultMessage="Hora inicio" /></span>
                                    <span className="td-view-field-value">{tournament.horaInicio || '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.horaFin" defaultMessage="Hora fin" /></span>
                                    <span className="td-view-field-value">{tournament.horaFin || '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.duracionPartido" defaultMessage="Duración partido" /></span>
                                    <span className="td-view-field-value">{tournament.duracionPartido ? `${tournament.duracionPartido} min` : '—'}</span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.distribucion" defaultMessage="Distribución" /></span>
                                    <span className="td-view-field-value">
                                        {tournament.estrategiaDistribucion === 'JORNADAS' ? 'Jornadas'
                                            : (tournament.estrategiaDistribucion === 'RAPIDO' || tournament.estrategiaDistribucion === 'UNIFORME') ? 'Rápido'
                                            : '—'}
                                    </span>
                                </div>
                                <div className="td-view-field-row">
                                    <span className="td-view-field-label"><FormattedMessage id="project.tournaments.Create.Step4.fechasExcluidas" defaultMessage="Fechas excluidas" /></span>
                                    <span className="td-view-field-value">{tournament.fechasExcluidas && tournament.fechasExcluidas.length > 0 ? tournament.fechasExcluidas.join(', ') : '—'}</span>
                                </div>
                            </div>
                        )}
                    </div>
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
                        <>
                            <div className="td-teams-grid">
                                {(() => {
                                    const totalPages = Math.ceil(tournament.inscripciones.length / TEAMS_PER_PAGE);
                                    const safePage = Math.min(teamsPage, totalPages);
                                    const start = (safePage - 1) * TEAMS_PER_PAGE;
                                    const end = start + TEAMS_PER_PAGE;
                                    const pageTeams = tournament.inscripciones.slice(start, end);
                                    return pageTeams.map(insc => (
                                        <div
                                            key={insc.equipoId}
                                            className="td-teams-card"
                                            onClick={() => {
                                                setModalEquipoId(insc.equipoId);
                                                setShowTeamModal(true);
                                            }}
                                        >
                                            <div className="td-teams-card-icon">
                                                <i className="fa-regular fa-shield-halved" />
                                            </div>
                                            <div className="td-teams-card-name">{insc.nombreEquipo}</div>
                                        </div>
                                    ));
                                })()}
                            </div>
                            {Math.ceil(tournament.inscripciones.length / TEAMS_PER_PAGE) > 1 && (
                                <div className="td-teams-pagination">
                                    <button
                                        className="td-teams-pagination-btn"
                                        disabled={teamsPage <= 1}
                                        onClick={() => setTeamsPage(prev => Math.max(1, prev - 1))}
                                    >
                                        <i className="fa-regular fa-chevron-left" />
                                    </button>
                                    <span className="td-teams-pagination-info">
                                        {teamsPage} / {Math.ceil(tournament.inscripciones.length / TEAMS_PER_PAGE)}
                                    </span>
                                    <button
                                        className="td-teams-pagination-btn"
                                        disabled={teamsPage >= Math.ceil(tournament.inscripciones.length / TEAMS_PER_PAGE)}
                                        onClick={() => setTeamsPage(prev => prev + 1)}
                                    >
                                        <i className="fa-regular fa-chevron-right" />
                                    </button>
                                </div>
                            )}
                        </>
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
                    {loadingJornadas ? (
                        <div className="td-empty-state">
                            <Spinner animation="border" variant="dark" />
                        </div>
                    ) : jornadas.length > 0 ? (
                        <>
                            <div className="td-partidos-carousel">
                                <button
                                    className="td-partidos-carousel-btn"
                                    disabled={currentJornadaIdx <= 0}
                                    onClick={() => setCurrentJornadaIdx(prev => Math.max(0, prev - 1))}
                                    aria-label="Jornada anterior"
                                >
                                    <i className="fa-regular fa-chevron-left" />
                                </button>
                                <div className="td-partidos-carousel-track" ref={carouselRef}>
                                    {jornadas.map((j, idx) => {
                                        const fecha = j.fechaInicio ? new Date(j.fechaInicio) : null;
                                        const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
                                        return (
                                            <div
                                                key={j.id}
                                                className={`td-partidos-carousel-item${idx === currentJornadaIdx ? ' td-partidos-carousel-item--active' : ''}`}
                                                onClick={() => setCurrentJornadaIdx(idx)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCurrentJornadaIdx(idx); }}
                                            >
                                                <span className="td-partidos-carousel-item-num">
                                                    {intl.formatMessage({ id: 'project.tournaments.Detail.partidos.jornada', defaultMessage: 'Jornada' })} {j.numeroJornada}
                                                </span>
                                                {fechaStr && <span className="td-partidos-carousel-item-date">{fechaStr}</span>}
                                                {j.tipoFase && <span className="td-partidos-carousel-item-phase">{j.tipoFase}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="td-partidos-mobile-select-wrapper">
                                    <select
                                        className="td-partidos-mobile-select"
                                        value={currentJornadaIdx}
                                        onChange={e => setCurrentJornadaIdx(parseInt(e.target.value))}
                                        aria-label="Seleccionar jornada"
                                    >
                                        {jornadas.map((j, idx) => {
                                            const fecha = j.fechaInicio ? new Date(j.fechaInicio) : null;
                                            const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
                                            return (
                                                <option key={j.id} value={idx}>
                                                    {intl.formatMessage({ id: 'project.tournaments.Detail.partidos.jornada', defaultMessage: 'Jornada' })} {j.numeroJornada}{fechaStr ? ` (${fechaStr})` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <button
                                    className="td-partidos-carousel-btn"
                                    disabled={currentJornadaIdx >= jornadas.length - 1}
                                    onClick={() => setCurrentJornadaIdx(prev => Math.min(jornadas.length - 1, prev + 1))}
                                    aria-label="Jornada siguiente"
                                >
                                    <i className="fa-regular fa-chevron-right" />
                                </button>
                            </div>
                            {(() => {
                                const currentJornada = jornadas[currentJornadaIdx];
                                const encuentros = currentJornada.encuentros || [];

                                // Build equipo -> grupo mapping from tournament.inscripciones
                                const equipoGrupoMap = {};
                                if (tournament.inscripciones) {
                                    tournament.inscripciones.forEach(insc => {
                                        if (insc.grupoId && insc.grupoNombre) {
                                            equipoGrupoMap[insc.equipoId] = { grupoId: insc.grupoId, grupoNombre: insc.grupoNombre };
                                        }
                                    });
                                }

                                // Group encuentros by grupo
                                const gruposMap = {};
                                const sinGrupo = [];
                                encuentros.forEach(enc => {
                                    const grupoInfo = equipoGrupoMap[enc.equipoLocalId] || equipoGrupoMap[enc.equipoVisitanteId];
                                    if (grupoInfo) {
                                        const key = grupoInfo.grupoId;
                                        if (!gruposMap[key]) {
                                            gruposMap[key] = { grupoId: grupoInfo.grupoId, grupoNombre: grupoInfo.grupoNombre, encuentros: [] };
                                        }
                                        gruposMap[key].encuentros.push(enc);
                                    } else {
                                        sinGrupo.push(enc);
                                    }
                                });

                                const gruposList = Object.values(gruposMap).sort((a, b) => a.grupoId - b.grupoId);

                                if (encuentros.length === 0) {
                                    return (
                                        <div className="td-empty-state">
                                            <p className="td-empty-state-text">
                                                <FormattedMessage id="project.tournaments.Detail.partidos.noEncuentros" defaultMessage="No hay encuentros en esta jornada." />
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {/* Render each grupo as a subsection */}
                                        {gruposList.map(grupo => (
                                            <div key={grupo.grupoId} className="td-partidos-grupo-section">
                                                <div className="td-partidos-jornada-label">
                                                    <i className="fa-regular fa-layer-group me-1" />
                                                    {grupo.grupoNombre}
                                                </div>
                                                <div className="td-partidos-grid">
                                                    {grupo.encuentros.map(enc => {
                                                        const fecha = enc.fechaRealizacion ? new Date(enc.fechaRealizacion) : null;
                                                        const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                                        const horaStr = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                                                        const jugado = enc.estado === 'JUGADO';
                                                        return (
                                                            <div
                                                                key={enc.id}
                                                                className="td-partido-card"
                                                                onClick={() => setSelectedEncuentro(enc)}
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedEncuentro(enc); }}
                                                            >
                                                                <div className="td-partido-card-teams">
                                                                    <div className="td-partido-card-team">
                                                                        <i className="fa-regular fa-shield-halved td-partido-card-shield" />
                                                                        <span className="td-partido-card-team-name">{enc.equipoLocalNombre}</span>
                                                                        {jugado && (
                                                                            <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[0] : '—'}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="td-partido-card-team">
                                                                        <i className="fa-regular fa-shield-halved td-partido-card-shield" />
                                                                        <span className="td-partido-card-team-name">{enc.equipoVisitanteNombre}</span>
                                                                        {jugado && (
                                                                            <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[1] : '—'}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {fecha && (
                                                                    <div className="td-partido-card-datetime">
                                                                        <span className="td-partido-card-date">{fechaStr}</span>
                                                                        <span className="td-partido-card-time">{horaStr}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Render encounters without grupo at the end */}
                                        {sinGrupo.length > 0 && (
                                            <div className="td-partidos-grupo-section">
                                                <div className="td-partidos-jornada-label">
                                                    <i className="fa-regular fa-circle me-1" />
                                                    <FormattedMessage id="project.tournaments.Detail.partidos.sinGrupo" defaultMessage="Sin grupo" />
                                                </div>
                                                <div className="td-partidos-grid">
                                                    {sinGrupo.map(enc => {
                                                        const fecha = enc.fechaRealizacion ? new Date(enc.fechaRealizacion) : null;
                                                        const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                                        const horaStr = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                                                        const jugado = enc.estado === 'JUGADO';
                                                        return (
                                                            <div
                                                                key={enc.id}
                                                                className="td-partido-card"
                                                                onClick={() => setSelectedEncuentro(enc)}
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedEncuentro(enc); }}
                                                            >
                                                                <div className="td-partido-card-teams">
                                                                    <div className="td-partido-card-team">
                                                                        <i className="fa-regular fa-shield-halved td-partido-card-shield" />
                                                                        <span className="td-partido-card-team-name">{enc.equipoLocalNombre}</span>
                                                                        {jugado && (
                                                                            <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[0] : '—'}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="td-partido-card-team">
                                                                        <i className="fa-regular fa-shield-halved td-partido-card-shield" />
                                                                        <span className="td-partido-card-team-name">{enc.equipoVisitanteNombre}</span>
                                                                        {jugado && (
                                                                            <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[1] : '—'}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {fecha && (
                                                                    <div className="td-partido-card-datetime">
                                                                        <span className="td-partido-card-date">{fechaStr}</span>
                                                                        <span className="td-partido-card-time">{horaStr}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    ) : (
                        <div className="td-empty-state">
                            <div className="td-empty-state-icon">
                                <i className="fa-regular fa-calendar-circle-exclamation" />
                            </div>
                            <p className="td-empty-state-text">
                                <FormattedMessage id="project.tournaments.Detail.partidos.noCalendar" defaultMessage="Aún no hay partidos. El calendario se generará cuando el organizador configure el torneo." />
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'playoffs' && (
                <div className="td-fullbleed td-playoffs-section">
                    <div className="td-partidos-header">
                        <h5 className="td-partidos-title">
                            <i className="fa-regular fa-sitemap" />
                            <FormattedMessage id="project.tournaments.Detail.playoffs.title" defaultMessage="Playoffs" />
                        </h5>
                    </div>
                    {loadingJornadas ? (
                        <div className="td-empty-state">
                            <Spinner animation="border" variant="dark" />
                        </div>
                    ) : (() => {
                        const eliminatorias = jornadas.filter(j => j.tipoFase === 'ELIMINATORIA');
                        if (eliminatorias.length === 0) {
                            return (
                                <div className="td-empty-state">
                                    <div className="td-empty-state-icon">
                                        <i className="fa-regular fa-sitemap" />
                                    </div>
                                    <p className="td-empty-state-text">
                                        <FormattedMessage id="project.tournaments.Detail.playoffs.empty" defaultMessage="Aún no hay playoffs. Se generarán automáticamente cuando termine la fase de grupos." />
                                    </p>
                                </div>
                            );
                        }
                        return (
                            <>
                                {eliminatorias.map((j, rondaIdx) => {
                                    const fecha = j.fechaInicio ? new Date(j.fechaInicio) : null;
                                    const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                    return (
                                        <div key={j.id} className="td-playoffs-ronda">
                                            <div className="td-playoffs-ronda-header">
                                                <span className="td-playoffs-ronda-title">
                                                    {intl.formatMessage(
                                                        { id: 'project.tournaments.Detail.playoffs.ronda', defaultMessage: 'Ronda {num}' },
                                                        { num: rondaIdx + 1 }
                                                    )}
                                                </span>
                                                {fechaStr && <span className="td-playoffs-ronda-date">{fechaStr}</span>}
                                            </div>
                                            <div className="td-playoffs-grid">
                                                {(j.encuentros || []).map(enc => {
                                                    const fechaEnc = enc.fechaRealizacion ? new Date(enc.fechaRealizacion) : null;
                                                    const horaStr = fechaEnc ? fechaEnc.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                                                    const jugado = enc.estado === 'JUGADO';
                                                    return (
                                                        <div
                                                            key={enc.id}
                                                            className="td-playoff-card"
                                                            onClick={() => setSelectedEncuentro(enc)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedEncuentro(enc); }}
                                                        >
                                                            <div className="td-playoff-card-team">
                                                                <i className="fa-regular fa-shield-halved td-playoff-card-shield" />
                                                                <span className="td-playoff-card-team-name">{enc.equipoLocalNombre || '—'}</span>
                                                                {jugado && (
                                                                    <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[0] : '—'}</span>
                                                                )}
                                                            </div>
                                                            <div className="td-playoff-card-team">
                                                                <i className="fa-regular fa-shield-halved td-playoff-card-shield" />
                                                                <span className="td-playoff-card-team-name">{enc.equipoVisitanteNombre || '—'}</span>
                                                                {jugado && (
                                                                    <span className="td-partido-card-score">{enc.resultado ? enc.resultado.split('-')[1] : '—'}</span>
                                                                )}
                                                            </div>
                                                            {horaStr && (
                                                                <div className="td-playoff-card-time">
                                                                    <i className="fa-regular fa-clock me-1" />
                                                                    {horaStr}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        );
                    })()}
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
                            const equiposGrupo = (currentGrupo ? currentGrupo.equipos : tournament.inscripciones || [])
                                .slice()
                                .sort((a, b) => {
                                    const pts = (b.puntosLiga || 0) - (a.puntosLiga || 0);
                                    if (pts !== 0) return pts;
                                    const dg = (b.diferenciaSets || 0) - (a.diferenciaSets || 0);
                                    if (dg !== 0) return dg;
                                    return (b.setsGanados || 0) - (a.setsGanados || 0);
                                });
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
                                            const dg = (insc.diferenciaSets ?? (insc.setsGanados || 0) - (insc.setsPerdidos || 0));
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
                                                    <td>{insc.partidosJugados || 0}</td>
                                                    <td>{insc.partidosGanados || 0}</td>
                                                    <td>—</td>
                                                    <td>{insc.partidosPerdidos || 0}</td>
                                                    <td style={{ color: '#8e8e93' }}>{dg > 0 ? `+${dg}` : dg}</td>
                                                    <td>{insc.puntosLiga || 0}</td>
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

        </div>

        {/* Modal de información del equipo */}
        <TeamInfoModal
            show={showTeamModal}
            equipoId={modalEquipoId}
            onHide={() => {
                setShowTeamModal(false);
                setModalEquipoId(null);
            }}
        />

        {/* Modal de detalle del encuentro (información + registro de resultado) */}
        <EncuentroModal
            show={!!selectedEncuentro}
            encuentro={selectedEncuentro}
            capitanTeamIds={capitanTeamIds}
            onHide={() => setSelectedEncuentro(null)}
            onRegistered={handleRegistered}
        />
        </>
    );
};


export default TournamentDetail;
