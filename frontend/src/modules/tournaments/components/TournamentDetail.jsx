import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { Errors } from '../../common';
import users from '../../users';
import backend from '../../../backend';
import './TournamentDetail.css';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendErrors, setBackendErrors] = useState(null);
    const [configuring, setConfiguring] = useState(false);
    const [closing, setClosing] = useState(false);

    // Configurator form state
    const [configData, setConfigData] = useState({
        tipoTorneo: 'GRUPOS_PLAYOFF',
        numGrupos: 2,
        equiposPorGrupo: 2,
        tienePlayoff: true,
        idaVueltaPlayoff: false
    });
    const [configErrors, setConfigErrors] = useState({});
    const loggedUser = useSelector(users.selectors.getUser);

    useEffect(() => {
        loadTournament();
    }, [id]);

    const loadTournament = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await backend.tournamentService.getTournament(id);
            if (response.ok && response.payload) {
                setTournament(response.payload);
            } else {
                setError(response.error || intl.formatMessage({
                    id: 'project.tournaments.Detail.loadError',
                    defaultMessage: 'No se pudo cargar el torneo'
                }));
                setTournament(null);
            }
        } catch (err) {
            console.error('Error loading tournament:', err);
            setError(err.message || intl.formatMessage({
                id: 'project.tournaments.Detail.connectionError',
                defaultMessage: 'Error de conexión'
            }));
            setTournament(null);
        } finally {
            setLoading(false);
        }
    };

    const validateConfig = () => {
        const errors = {};
        const numGrupos = parseInt(configData.numGrupos, 10);
        const equiposPorGrupo = parseInt(configData.equiposPorGrupo, 10);

        if (isNaN(numGrupos) || numGrupos < 1) {
            errors.numGrupos = intl.formatMessage({
                id: 'project.tournaments.Detail.config.error.numGruposMin',
                defaultMessage: 'Debe haber al menos 1 grupo'
            });
        } else if (numGrupos > 32) {
            errors.numGrupos = intl.formatMessage({
                id: 'project.tournaments.Detail.config.error.numGruposMax',
                defaultMessage: 'Máximo 32 grupos'
            });
        }

        if (isNaN(equiposPorGrupo) || equiposPorGrupo < 2) {
            errors.equiposPorGrupo = intl.formatMessage({
                id: 'project.tournaments.Detail.config.error.equiposPorGrupoMin',
                defaultMessage: 'Debe haber al menos 2 equipos por grupo'
            });
        } else if (equiposPorGrupo > 32) {
            errors.equiposPorGrupo = intl.formatMessage({
                id: 'project.tournaments.Detail.config.error.equiposPorGrupoMax',
                defaultMessage: 'Máximo 32 equipos por grupo'
            });
        }

        const capacidadTotal = numGrupos * equiposPorGrupo;
        const numInscritos = tournament?.numEquiposInscritos || 0;

        if (!isNaN(numGrupos) && !isNaN(equiposPorGrupo) && capacidadTotal < numInscritos) {
            errors.capacidad = intl.formatMessage(
                {
                    id: 'project.tournaments.Detail.config.error.capacidadInsuficiente',
                    defaultMessage: 'Capacidad insuficiente: {capacidad} plazas para {inscritos} equipos inscritos'
                },
                { capacidad: capacidadTotal, inscritos: numInscritos }
            );
        }

        setConfigErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfigChange = (field, value) => {
        setConfigData(prev => ({ ...prev, [field]: value }));
        // Clear field error on change
        if (configErrors[field]) {
            setConfigErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
        // Clear capacidad error when any relevant field changes
        if (configErrors.capacidad) {
            setConfigErrors(prev => {
                const next = { ...prev };
                delete next.capacidad;
                return next;
            });
        }
    };

    const handleCloseInscripciones = async () => {
        setClosing(true);
        setBackendErrors(null);
        try {
            const response = await backend.tournamentService.closeTournament(id);
            if (response.ok && response.payload) {
                setTournament(response.payload);
            } else {
                setBackendErrors(response.payload || response.error);
            }
        } catch (err) {
            console.error('Error closing inscriptions:', err);
            setBackendErrors(err.message || intl.formatMessage({
                id: 'project.tournaments.Detail.close.error.generic',
                defaultMessage: 'Error al cerrar las inscripciones'
            }));
        } finally {
            setClosing(false);
        }
    };

    const handleConfigure = async (e) => {
        e.preventDefault();
        if (!validateConfig()) return;

        setConfiguring(true);
        setBackendErrors(null);
        try {
            const response = await backend.tournamentService.configureTournament(id, {
                tipoTorneo: configData.tipoTorneo,
                numGrupos: parseInt(configData.numGrupos, 10),
                equiposPorGrupo: parseInt(configData.equiposPorGrupo, 10),
                tienePlayoff: configData.tienePlayoff,
                idaVueltaPlayoff: configData.idaVueltaPlayoff
            });
            if (response.ok && response.payload) {
                setTournament(response.payload);
            } else {
                setBackendErrors(response.payload || response.error);
            }
        } catch (err) {
            console.error('Error configuring tournament:', err);
            setBackendErrors(err.message || intl.formatMessage({
                id: 'project.tournaments.Detail.config.error.generic',
                defaultMessage: 'Error al configurar el torneo'
            }));
        } finally {
            setConfiguring(false);
        }
    };

    const formatEstado = (estado) => {
        const estadoMap = {
            'RECLUTANDO': intl.formatMessage({ id: 'project.tournaments.Detail.estado.reclutando', defaultMessage: 'Reclutando' }),
            'INSCRIPCION_CERRADA': intl.formatMessage({ id: 'project.tournaments.Detail.estado.inscripcionCerrada', defaultMessage: 'Inscripción cerrada' }),
            'FASE_GRUPOS': intl.formatMessage({ id: 'project.tournaments.Detail.estado.faseGrupos', defaultMessage: 'Fase de grupos' }),
            'PLAYOFF': intl.formatMessage({ id: 'project.tournaments.Detail.estado.playoff', defaultMessage: 'Playoff' }),
            'FINALIZADO': intl.formatMessage({ id: 'project.tournaments.Detail.estado.finalizado', defaultMessage: 'Finalizado' })
        };
        return estadoMap[estado] || estado;
    };

    const getEstadoBadgeClass = (estado) => {
        const classMap = {
            'RECLUTANDO': 'badge-recruiting',
            'INSCRIPCION_CERRADA': 'badge-closed',
            'FASE_GRUPOS': 'badge-active',
            'PLAYOFF': 'badge-playoff',
            'FINALIZADO': 'badge-finished'
        };
        return classMap[estado] || '';
    };

    if (loading) {
        return (
            <Container className="tournament-detail-loading">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="secondary" />
                    <p className="mt-2 text-muted">
                        <FormattedMessage id="project.tournaments.Detail.loading" defaultMessage="Cargando torneo..." />
                    </p>
                </div>
            </Container>
        );
    }

    if (error || !tournament) {
        return (
            <Container className="tournament-detail-error">
                <div className="text-center py-5">
                    <i className="fa-regular fa-circle-xmark fa-3x text-muted mb-3" />
                    <h5>
                        <FormattedMessage id="project.tournaments.Detail.notFound" defaultMessage="Torneo no encontrado" />
                    </h5>
                    <p className="text-muted">{error}</p>
                    <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate('/')}>
                        <FormattedMessage id="project.tournaments.Detail.backToDashboard" defaultMessage="Volver al inicio" />
                    </Button>
                </div>
            </Container>
        );
    }

    const isOrganizer = loggedUser?.id === tournament.organizadorId;
    const showConfigurator = tournament.estado === 'INSCRIPCION_CERRADA' && isOrganizer;
    const showCloseButton = tournament.estado === 'RECLUTANDO' && isOrganizer;

    return (
        <Container className="tournament-detail-container">
            <div className="tournament-detail-header">
                <Button variant="link" className="tournament-detail-back" onClick={() => navigate('/')}>
                    <i className="fa-solid fa-arrow-left me-2" />
                    <FormattedMessage id="project.tournaments.Detail.back" defaultMessage="Volver" />
                </Button>
            </div>

            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

            {/* Tournament Info Card */}
            <div className="tournament-detail-card">
                <div className="tournament-detail-title-section">
                    <div className="tournament-detail-title-row">
                        <h2 className="tournament-detail-name">{tournament.nombre}</h2>
                        <span className={`tournament-detail-badge ${getEstadoBadgeClass(tournament.estado)}`}>
                            {formatEstado(tournament.estado)}
                        </span>
                    </div>
                    <p className="tournament-detail-organizer">
                        <i className="fa-regular fa-user me-1" />
                        <FormattedMessage
                            id="project.tournaments.Detail.organizer"
                            defaultMessage="Organizado por {name}"
                            values={{ name: tournament.organizadorNombre }}
                        />
                    </p>
                </div>

                <div className="tournament-detail-stats">
                    <div className="tournament-detail-stat">
                        <i className="fa-regular fa-users" />
                        <span className="stat-value">{tournament.numEquiposInscritos || 0}</span>
                        <span className="stat-label">
                            <FormattedMessage id="project.tournaments.Detail.inscribedTeams" defaultMessage="Inscritos" />
                        </span>
                    </div>
                    {tournament.numGrupos > 0 && (
                        <div className="tournament-detail-stat">
                            <i className="fa-regular fa-layer-group" />
                            <span className="stat-value">{tournament.numGrupos}</span>
                            <span className="stat-label">
                                <FormattedMessage id="project.tournaments.Detail.groups" defaultMessage="Grupos" />
                            </span>
                        </div>
                    )}
                    {tournament.tipoTorneo && (
                        <div className="tournament-detail-stat">
                            <i className="fa-regular fa-trophy" />
                            <span className="stat-value">
                                {tournament.tipoTorneo === 'LIGA_UNICA' && intl.formatMessage({ id: 'project.tournaments.Detail.tipo.ligaUnica', defaultMessage: 'Liga única' })}
                                {tournament.tipoTorneo === 'GRUPOS_PLAYOFF' && intl.formatMessage({ id: 'project.tournaments.Detail.tipo.gruposPlayoff', defaultMessage: 'Grupos + Playoff' })}
                                {tournament.tipoTorneo === 'ELIMINATORIAS' && intl.formatMessage({ id: 'project.tournaments.Detail.tipo.eliminatorias', defaultMessage: 'Eliminatorias' })}
                            </span>
                            <span className="stat-label">
                                <FormattedMessage id="project.tournaments.Detail.format" defaultMessage="Formato" />
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Close Inscriptions — only when RECLUTANDO */}
            {showCloseButton && (
                <div className="tournament-actions-card">
                    <div className="tournament-actions-body">
                        <div className="tournament-actions-info">
                            <i className="fa-regular fa-clock me-2" />
                            <span>
                                <FormattedMessage
                                    id="project.tournaments.Detail.close.info"
                                    defaultMessage="Las inscripciones están abiertas. Ciérralas cuando tengas suficientes equipos para configurar el torneo."
                                />
                            </span>
                        </div>
                        <Button
                            variant="dark"
                            className="rounded-pill px-4"
                            onClick={handleCloseInscripciones}
                            disabled={closing}
                        >
                            {closing ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    <FormattedMessage id="project.tournaments.Detail.close.closing" defaultMessage="Cerrando..." />
                                </>
                            ) : (
                                <>
                                    <i className="fa-regular fa-door-closed me-2" />
                                    <FormattedMessage id="project.tournaments.Detail.close.button" defaultMessage="Cerrar inscripciones" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Inline Configurator — only when INSCRIPCION_CERRADA */}
            {showConfigurator && (
                <div className="tournament-configurator-card">
                    <div className="configurator-header">
                        <i className="fa-regular fa-gear me-2" />
                        <FormattedMessage
                            id="project.tournaments.Detail.config.title"
                            defaultMessage="Configurar estructura del torneo"
                        />
                    </div>
                    <p className="configurator-subtitle">
                        <FormattedMessage
                            id="project.tournaments.Detail.config.subtitle"
                            defaultMessage="Hay {count} equipo(s) inscrito(s). Define el formato de competición."
                            values={{ count: tournament.numEquiposInscritos || 0 }}
                        />
                    </p>

                    {configErrors.capacidad && (
                        <div className="configurator-error-banner">
                            <i className="fa-regular fa-circle-exclamation me-2" />
                            {configErrors.capacidad}
                        </div>
                    )}

                    <Form onSubmit={handleConfigure} className="configurator-form">
                        <div className="configurator-grid">
                            <Form.Group className="configurator-field">
                                <Form.Label>
                                    <FormattedMessage id="project.tournaments.Detail.config.tipoTorneo" defaultMessage="Tipo de torneo" />
                                </Form.Label>
                                <Form.Select
                                    value={configData.tipoTorneo}
                                    onChange={(e) => handleConfigChange('tipoTorneo', e.target.value)}
                                >
                                    <option value="GRUPOS_PLAYOFF">
                                        <FormattedMessage id="project.tournaments.Detail.config.tipo.gruposPlayoff" defaultMessage="Grupos + Playoff" />
                                    </option>
                                    <option value="LIGA_UNICA">
                                        <FormattedMessage id="project.tournaments.Detail.config.tipo.ligaUnica" defaultMessage="Liga única" />
                                    </option>
                                    <option value="ELIMINATORIAS">
                                        <FormattedMessage id="project.tournaments.Detail.config.tipo.eliminatorias" defaultMessage="Eliminatorias" />
                                    </option>
                                </Form.Select>
                            </Form.Group>

                            {configData.tipoTorneo !== 'ELIMINATORIAS' && (
                                <>
                                    <Form.Group className="configurator-field">
                                        <Form.Label>
                                            <FormattedMessage id="project.tournaments.Detail.config.numGrupos" defaultMessage="Número de grupos" />
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            max={32}
                                            value={configData.numGrupos}
                                            onChange={(e) => handleConfigChange('numGrupos', e.target.value)}
                                            isInvalid={!!configErrors.numGrupos}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {configErrors.numGrupos}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="configurator-field">
                                        <Form.Label>
                                            <FormattedMessage id="project.tournaments.Detail.config.equiposPorGrupo" defaultMessage="Equipos por grupo" />
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={2}
                                            max={32}
                                            value={configData.equiposPorGrupo}
                                            onChange={(e) => handleConfigChange('equiposPorGrupo', e.target.value)}
                                            isInvalid={!!configErrors.equiposPorGrupo}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {configErrors.equiposPorGrupo}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </>
                            )}

                            {configData.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                                <>
                                    <Form.Group className="configurator-field configurator-checkbox">
                                        <Form.Check
                                            type="switch"
                                            id="tienePlayoff"
                                            label={intl.formatMessage({
                                                id: 'project.tournaments.Detail.config.tienePlayoff',
                                                defaultMessage: 'Playoff'
                                            })}
                                            checked={configData.tienePlayoff}
                                            onChange={(e) => handleConfigChange('tienePlayoff', e.target.checked)}
                                        />
                                    </Form.Group>

                                    {configData.tienePlayoff && (
                                        <Form.Group className="configurator-field configurator-checkbox">
                                            <Form.Check
                                                type="switch"
                                                id="idaVueltaPlayoff"
                                                label={intl.formatMessage({
                                                    id: 'project.tournaments.Detail.config.idaVueltaPlayoff',
                                                    defaultMessage: 'Ida y vuelta en playoff'
                                                })}
                                                checked={configData.idaVueltaPlayoff}
                                                onChange={(e) => handleConfigChange('idaVueltaPlayoff', e.target.checked)}
                                            />
                                        </Form.Group>
                                    )}
                                </>
                            )}
                        </div>

                        {!configErrors.capacidad && configData.tipoTorneo !== 'ELIMINATORIAS' && (
                            <div className="configurator-capacity-info">
                                <i className="fa-regular fa-circle-info me-1" />
                                <FormattedMessage
                                    id="project.tournaments.Detail.config.capacityInfo"
                                    defaultMessage="Capacidad: {capacidad} plazas ({inscritos} inscritos)"
                                    values={{
                                        capacidad: parseInt(configData.numGrupos, 10) * parseInt(configData.equiposPorGrupo, 10) || 0,
                                        inscritos: tournament.numEquiposInscritos || 0
                                    }}
                                />
                            </div>
                        )}

                        <div className="configurator-actions">
                            <Button
                                variant="outline-secondary"
                                className="rounded-pill px-4"
                                onClick={() => navigate('/')}
                                disabled={configuring}
                            >
                                <FormattedMessage id="project.tournaments.Detail.config.cancel" defaultMessage="Cancelar" />
                            </Button>
                            <Button
                                type="submit"
                                variant="dark"
                                className="rounded-pill px-4"
                                disabled={configuring}
                            >
                                {configuring ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        <FormattedMessage id="project.tournaments.Detail.config.generating" defaultMessage="Generando..." />
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-regular fa-calendar-check me-2" />
                                        <FormattedMessage id="project.tournaments.Detail.config.generate" defaultMessage="Generar calendario" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>
            )}

            {/* Teams list section placeholder */}
            <div className="tournament-detail-section">
                <h5 className="section-title">
                    <i className="fa-regular fa-users me-2" />
                    <FormattedMessage id="project.tournaments.Detail.registeredTeams" defaultMessage="Equipos inscritos" />
                </h5>
                {tournament.numEquiposInscritos > 0 ? (
                    <p className="text-muted">
                        <FormattedMessage
                            id="project.tournaments.Detail.registeredTeamsCount"
                            defaultMessage="{count} equipo(s) inscrito(s)"
                            values={{ count: tournament.numEquiposInscritos }}
                        />
                    </p>
                ) : (
                    <div className="empty-teams">
                        <i className="fa-regular fa-users-slash mb-2" style={{ fontSize: '1.3rem', display: 'block' }} />
                        <FormattedMessage id="project.tournaments.Detail.noTeams" defaultMessage="No hay equipos inscritos todavía" />
                    </div>
                )}
            </div>
        </Container>
    );
};

export default TournamentDetail;
