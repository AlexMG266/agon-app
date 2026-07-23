import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';

const ESTADO_MAP = {
    'RECLUTANDO': { key: 'reclutando', color: '#2563eb' },
    'INSCRIPCION_CERRADA': { key: 'inscripcionCerrada', color: '#d97706' },
    'FASE_GRUPOS': { key: 'faseGrupos', color: '#16a34a' },
    'PLAYOFF': { key: 'playoff', color: '#7c3aed' },
    'FINALIZADO': { key: 'finalizado', color: '#6b7280' }
};

const BrowseTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Code search state
    const [codeSearchTerm, setCodeSearchTerm] = useState('');
    const [codeSearchResult, setCodeSearchResult] = useState(null);
    const [codeSearching, setCodeSearching] = useState(false);
    const [codeError, setCodeError] = useState(null);

    const intl = useIntl();

    const loadTournaments = useCallback(async (filtro) => {
        setLoading(true);
        setError(null);
        try {
            const response = filtro
                ? await backend.tournamentService.searchTournaments(filtro)
                : await backend.tournamentService.getAllTournaments();

            if (response.ok && Array.isArray(response.payload)) {
                setTournaments(response.payload);
            } else {
                setTournaments([]);
                setError(response.error || intl.formatMessage({
                    id: 'project.tournaments.Browse.loadError',
                    defaultMessage: 'Error al cargar torneos'
                }));
            }
        } catch (err) {
            console.error('Error loading tournaments:', err);
            setTournaments([]);
            setError(err.message || intl.formatMessage({
                id: 'project.tournaments.Browse.connectionError',
                defaultMessage: 'Error de conexión'
            }));
        } finally {
            setLoading(false);
        }
    }, [intl]);

    useEffect(() => {
        loadTournaments();
    }, [loadTournaments]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadTournaments(searchTerm.trim());
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCodeSearchTerm('');
        setCodeSearchResult(null);
        setCodeError(null);
        loadTournaments();
    };

    const handleCodeSearch = async (e) => {
        e.preventDefault();
        const code = codeSearchTerm.trim();
        if (!code) return;

        setCodeSearching(true);
        setCodeError(null);
        setCodeSearchResult(null);
        try {
            const response = await backend.tournamentService.getTournamentByCode(code);
            if (response.ok && response.payload) {
                setCodeSearchResult(response.payload);
            } else {
                setCodeError(intl.formatMessage({
                    id: 'project.tournaments.Browse.codeNotFound',
                    defaultMessage: 'No se encontró ningún torneo con ese código'
                }));
            }
        } catch (err) {
            console.error('Error searching by code:', err);
            setCodeError(err.message || intl.formatMessage({
                id: 'project.tournaments.Browse.codeError',
                defaultMessage: 'Error al buscar por código'
            }));
        } finally {
            setCodeSearching(false);
        }
    };

    const filtered = tournaments.filter(t => {
        if (statusFilter && t.estado !== statusFilter) return false;
        return true;
    });

    const getEstadoLabel = (estado) => {
        const map = {
            'RECLUTANDO': intl.formatMessage({ id: 'project.tournaments.Detail.estado.reclutando', defaultMessage: 'Reclutando' }),
            'INSCRIPCION_CERRADA': intl.formatMessage({ id: 'project.tournaments.Detail.estado.inscripcionCerrada', defaultMessage: 'Inscripción cerrada' }),
            'FASE_GRUPOS': intl.formatMessage({ id: 'project.tournaments.Detail.estado.faseGrupos', defaultMessage: 'Fase de grupos' }),
            'PLAYOFF': intl.formatMessage({ id: 'project.tournaments.Detail.estado.playoff', defaultMessage: 'Playoff' }),
            'FINALIZADO': intl.formatMessage({ id: 'project.tournaments.Detail.estado.finalizado', defaultMessage: 'Finalizado' })
        };
        return map[estado] || estado;
    };

    return (
        <div className="home-dashboard" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="dashboard-greeting" style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        <FormattedMessage id="project.tournaments.Browse.title" defaultMessage="Explorar Torneos" />
                    </h1>
                    <p className="dashboard-subtitle" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                        <FormattedMessage id="project.tournaments.Browse.subtitle" defaultMessage="Encuentra torneos disponibles para inscribirte" />
                    </p>
                </div>
            </div>

            {/* Search by code */}
            <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    <i className="fa-regular fa-qrcode me-1" />
                    <FormattedMessage id="project.tournaments.Browse.codeSearchTitle" defaultMessage="Buscar por código de torneo" />
                </div>
                <Form onSubmit={handleCodeSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <Form.Control
                        type="text"
                        placeholder={intl.formatMessage({ id: 'project.tournaments.Browse.codePlaceholder', defaultMessage: 'Ej. T22-K9M8' })}
                        value={codeSearchTerm}
                        onChange={(e) => setCodeSearchTerm(e.target.value)}
                        style={{ borderRadius: '999px', maxWidth: '300px' }}
                    />
                    <Button type="submit" variant="dark" className="rounded-pill px-3" disabled={codeSearching || !codeSearchTerm.trim()}>
                        {codeSearching ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <i className="fa-solid fa-search" />
                        )}
                    </Button>
                    {codeSearchResult && (
                        <Button variant="outline-secondary" className="rounded-pill" size="sm" onClick={() => { setCodeSearchResult(null); setCodeError(null); }}>
                            <i className="fa-solid fa-xmark" />
                        </Button>
                    )}
                </Form>

                {/* Code search result */}
                {codeError && (
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <i className="fa-regular fa-circle-exclamation me-1" />
                        {codeError}
                    </div>
                )}
                {codeSearchResult && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <Link
                            to={`/tournaments/view/${codeSearchResult.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                background: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #2563eb40',
                                transition: 'box-shadow 0.2s'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1d1d1f' }}>
                                        {codeSearchResult.privado && <span style={{ marginRight: '0.5rem' }}>🔒</span>}
                                        {codeSearchResult.nombre}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        <FormattedMessage id="project.tournaments.Browse.codeFound" defaultMessage="Código: {code}" values={{ code: codeSearchResult.codigoTorneo }} />
                                    </div>
                                </div>
                                <i className="fa-solid fa-arrow-right" style={{ color: '#2563eb' }} />
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            {/* Search & Filters */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <Form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
                    <Form.Control
                        type="text"
                        placeholder={intl.formatMessage({ id: 'project.tournaments.Browse.searchPlaceholder', defaultMessage: 'Buscar por nombre...' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderRadius: '999px' }}
                    />
                    <Button type="submit" variant="dark" className="rounded-pill px-3" disabled={loading}>
                        <i className="fa-solid fa-search" />
                    </Button>
                </Form>

                <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto', minWidth: '160px', borderRadius: '999px' }}
                >
                    <option value="">
                        <FormattedMessage id="project.tournaments.Browse.filterAll" defaultMessage="Todos los estados" />
                    </option>
                    <option value="RECLUTANDO">
                        <FormattedMessage id="project.tournaments.Detail.estado.reclutando" defaultMessage="Reclutando" />
                    </option>
                    <option value="INSCRIPCION_CERRADA">
                        <FormattedMessage id="project.tournaments.Detail.estado.inscripcionCerrada" defaultMessage="Inscripción cerrada" />
                    </option>
                    <option value="FASE_GRUPOS">
                        <FormattedMessage id="project.tournaments.Detail.estado.faseGrupos" defaultMessage="Fase de grupos" />
                    </option>
                    <option value="PLAYOFF">
                        <FormattedMessage id="project.tournaments.Detail.estado.playoff" defaultMessage="Playoff" />
                    </option>
                    <option value="FINALIZADO">
                        <FormattedMessage id="project.tournaments.Detail.estado.finalizado" defaultMessage="Finalizado" />
                    </option>
                </Form.Select>

                {(searchTerm || statusFilter) && (
                    <Button variant="outline-secondary" className="rounded-pill" onClick={handleClearSearch} size="sm">
                        <i className="fa-solid fa-xmark me-1" />
                        <FormattedMessage id="project.tournaments.Browse.clearFilter" defaultMessage="Limpiar" />
                    </Button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    <i className="fa-regular fa-circle-exclamation me-2" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="secondary" />
                </div>
            ) : filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map((t, idx) => {
                        const estadoInfo = ESTADO_MAP[t.estado] || { key: 'reclutando', color: '#2563eb' };
                        return (
                            <Link
                                key={t.id || idx}
                                to={`/tournaments/view/${t.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 1.25rem',
                                    background: '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    transition: 'box-shadow 0.2s, border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#1d1d1f' }}>
                                            {t.privado && (
                                                <span className="me-1" title={intl.formatMessage({ id: 'project.tournaments.Detail.privado', defaultMessage: 'Torneo privado' })}>🔒</span>
                                            )}
                                            {t.nombre}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span>
                                                <FormattedMessage id="project.tournaments.Browse.organizer" defaultMessage="Organizador: {name}" values={{ name: t.organizadorNombre }} />
                                            </span>
                                            <span>
                                                <FormattedMessage id="project.tournaments.Browse.teamsCount" defaultMessage="{count} equipo(s)" values={{ count: t.numEquiposInscritos || 0 }} />
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        flexShrink: 0
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.2rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.78rem',
                                            fontWeight: '500',
                                            background: `${estadoInfo.color}15`,
                                            color: estadoInfo.color,
                                            border: `1px solid ${estadoInfo.color}30`
                                        }}>
                                            {getEstadoLabel(t.estado)}
                                        </span>
                                        <i className="fa-solid fa-chevron-right" style={{ color: '#9ca3af', fontSize: '0.8rem' }} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                        {searchTerm || statusFilter ? (
                            <FormattedMessage id="project.tournaments.Browse.noResults" defaultMessage="No se encontraron torneos con los filtros seleccionados" />
                        ) : (
                            <FormattedMessage id="project.tournaments.Browse.noTournaments" defaultMessage="No hay torneos disponibles" />
                        )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        {searchTerm || statusFilter ? (
                            <FormattedMessage id="project.tournaments.Browse.noResultsHelp" defaultMessage="Prueba con otros términos o limpia los filtros" />
                        ) : (
                            <FormattedMessage id="project.tournaments.Browse.noTournamentsHelp" defaultMessage="Cuando alguien cree un torneo, aparecerá aquí" />
                        )}
                    </div>
                    {(searchTerm || statusFilter) && (
                        <Button variant="outline-dark" className="rounded-pill mt-3" onClick={handleClearSearch}>
                            <FormattedMessage id="project.tournaments.Browse.clearFilter" defaultMessage="Limpiar filtros" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseTournaments;
