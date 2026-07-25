import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import backend from '../../../backend';
import './BrowseTournaments.css';

const PAGE_SIZE = 6;

const ESTADO_MAP = {
    'RECLUTANDO': { key: 'reclutando', color: '#2563eb', bg: '#eef4ff' },
    'INSCRIPCION_CERRADA': { key: 'inscripcionCerrada', color: '#d97706', bg: '#fffbeb' },
    'FASE_GRUPOS': { key: 'faseGrupos', color: '#16a34a', bg: '#f0fdf4' },
    'PLAYOFF': { key: 'playoff', color: '#7c3aed', bg: '#f5f3ff' },
    'FINALIZADO': { key: 'finalizado', color: '#6b7280', bg: '#f3f4f6' }
};

const FILTER_OPTIONS = [
    { value: 'RECLUTANDO', labelId: 'project.tournaments.Detail.estado.reclutando', label: 'Reclutando' },
    { value: 'EN_JUEGO', labelId: 'project.tournaments.Browse.filterEnJuego', label: 'En juego' },
    { value: 'FINALIZADO', labelId: 'project.tournaments.Detail.estado.finalizado', label: 'Finalizado' }
];

const BrowseTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [page, setPage] = useState(0);
    const [existMoreItems, setExistMoreItems] = useState(false);

    const [codeSearchTerm, setCodeSearchTerm] = useState('');
    const [codeSearchResult, setCodeSearchResult] = useState(null);
    const [codeSearching, setCodeSearching] = useState(false);
    const [codeError, setCodeError] = useState(null);

    const intl = useIntl();

    const loadTournaments = useCallback(async (filtro, pageNum = 0, estado) => {
        setLoading(true);
        setError(null);
        const estadoParam = estado ?? (statusFilter || 'ALL');
        try {
            const response = filtro
                ? await backend.tournamentService.searchTournaments(filtro, pageNum, PAGE_SIZE, estadoParam)
                : await backend.tournamentService.getAllTournaments(pageNum, PAGE_SIZE, estadoParam);

            if (response.ok && response.payload) {
                setTournaments(response.payload.items || []);
                setExistMoreItems(response.payload.existMoreItems || false);
                setPage(pageNum);
            } else {
                setTournaments([]);
                setExistMoreItems(false);
                setError(response.error || intl.formatMessage({
                    id: 'project.tournaments.Browse.loadError',
                    defaultMessage: 'Error al cargar torneos'
                }));
            }
        } catch (err) {
            console.error('Error loading tournaments:', err);
            setTournaments([]);
            setExistMoreItems(false);
            setError(err.message || intl.formatMessage({
                id: 'project.tournaments.Browse.connectionError',
                defaultMessage: 'Error de conexión'
            }));
        } finally {
            setLoading(false);
        }
    }, [intl]);

    useEffect(() => {
        loadTournaments('', 0, 'ALL');
    }, [loadTournaments]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadTournaments(searchTerm.trim(), 0, statusFilter || 'ALL');
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCodeSearchTerm('');
        setCodeSearchResult(null);
        setCodeError(null);
        loadTournaments('', 0, 'ALL');
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

    const handlePreviousPage = () => {
        if (page > 0) {
            loadTournaments(searchTerm.trim(), page - 1, statusFilter || 'ALL');
        }
    };

    const handleNextPage = () => {
        if (existMoreItems) {
            loadTournaments(searchTerm.trim(), page + 1, statusFilter || 'ALL');
        }
    };

    const filtered = tournaments;

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
        <div className="bt-container">
            {/* Header */}
            <div className="bt-header">
                <h1 className="bt-title">
                    <FormattedMessage id="project.tournaments.Browse.title" defaultMessage="Explorar Torneos" />
                </h1>
                <p className="bt-subtitle">
                    <FormattedMessage id="project.tournaments.Browse.subtitle" defaultMessage="Encuentra torneos disponibles para inscribirte" />
                </p>
            </div>

            <div className="bt-toolbar">
                <div className="bt-toolbar-left">
                    <Form onSubmit={handleSearch} className="bt-search-form">
                        <Form.Control
                            type="text"
                            className="bt-search-input"
                            placeholder={intl.formatMessage({ id: 'project.tournaments.Browse.searchPlaceholder', defaultMessage: 'Buscar por nombre...' })}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button type="submit" className="bt-search-btn bt-search-btn--dark" disabled={loading}>
                            <i className="fa-solid fa-search" />
                        </Button>
                    </Form>
                </div>

                <div className="bt-toolbar-right">
                    <Form onSubmit={handleCodeSearch} className="bt-code-form">
                        <Form.Control
                            type="text"
                            className="bt-code-input"
                            placeholder={intl.formatMessage({ id: 'project.tournaments.Browse.codePlaceholder', defaultMessage: 'Código torneo' })}
                            value={codeSearchTerm}
                            onChange={(e) => setCodeSearchTerm(e.target.value)}
                        />
                        <Button type="submit" className="bt-search-btn bt-search-btn--outline" disabled={codeSearching || !codeSearchTerm.trim()}>
                            {codeSearching ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="fa-solid fa-qrcode" />
                            )}
                        </Button>
                        {codeSearchResult && (
                            <Button className="bt-search-btn bt-search-btn--outline" onClick={() => { setCodeSearchResult(null); setCodeError(null); }}>
                                <i className="fa-solid fa-xmark" />
                            </Button>
                        )}
                    </Form>

                    <Form.Select
                        className="bt-filter-select"
                        value={statusFilter}
                        onChange={(e) => {
                            const newVal = e.target.value;
                            setStatusFilter(newVal);
                            loadTournaments(searchTerm.trim(), 0, newVal || 'ALL');
                        }}
                    >
                        <option value="">
                            <FormattedMessage id="project.tournaments.Browse.filterAll" defaultMessage="Todos los estados" />
                        </option>
                        {FILTER_OPTIONS.filter(o => o.value).map(opt => (
                            <option key={opt.value} value={opt.value}>
                                <FormattedMessage id={opt.labelId} defaultMessage={opt.label} />
                            </option>
                        ))}
                    </Form.Select>

                    {(searchTerm || statusFilter) && (
                        <button className="bt-clear-btn" onClick={handleClearSearch}>
                            <i className="fa-solid fa-xmark" />
                            <FormattedMessage id="project.tournaments.Browse.clearFilter" defaultMessage="Limpiar" />
                        </button>
                    )}
                </div>
            </div>

            {codeError && (
                <div className="bt-message bt-message--error">
                    <i className="fa-regular fa-circle-exclamation" />
                    {codeError}
                </div>
            )}

            {codeSearchResult && (
                <Link to={`/tournaments/view/${codeSearchResult.id}`} className="bt-code-result">
                    <div>
                        <div className="bt-code-result-name">
                            {codeSearchResult.privado && <span className="me-1">🔒</span>}
                            {codeSearchResult.nombre}
                        </div>
                        <div className="bt-code-result-meta">
                            <FormattedMessage id="project.tournaments.Browse.codeFound" defaultMessage="Código: {code}" values={{ code: codeSearchResult.codigoTorneo }} />
                        </div>
                    </div>
                    <i className="fa-solid fa-arrow-right bt-code-result-arrow" />
                </Link>
            )}

            {/* Error */}
            {error && (
                <div className="bt-message bt-message--error">
                    <i className="fa-regular fa-circle-exclamation" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bt-loading">
                    <Spinner animation="border" variant="secondary" />
                </div>
            )}

            {/* Tournament list */}
            {!loading && filtered.length > 0 && (
                <>
                    <div className="bt-list">
                        {filtered.map((t, idx) => {
                            const estadoInfo = ESTADO_MAP[t.estado] || ESTADO_MAP['RECLUTANDO'];
                            return (
                                <Link
                                    key={t.id || idx}
                                    to={`/tournaments/view/${t.id}`}
                                    className="bt-row"
                                >
                                    <div className="bt-row-info">
                                        <div className="bt-row-name">
                                            {t.privado && (
                                                <span title={intl.formatMessage({ id: 'project.tournaments.Detail.privado', defaultMessage: 'Torneo privado' })}>
                                                    🔒
                                                </span>
                                            )}
                                            {t.nombre}
                                        </div>
                                        <div className="bt-row-meta">
                                            <span>
                                                <FormattedMessage id="project.tournaments.Browse.organizer" defaultMessage="Organizador: {name}" values={{ name: t.organizadorNombre }} />
                                            </span>
                                            <span>
                                                <FormattedMessage id="project.tournaments.Browse.teamsCount" defaultMessage="{count} equipo(s)" values={{ count: t.numEquiposInscritos || 0 }} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bt-row-right">
                                        <span
                                            className="bt-status-badge"
                                            style={{
                                                background: estadoInfo.bg,
                                                color: estadoInfo.color
                                            }}
                                        >
                                            <span className="bt-status-dot" style={{ background: estadoInfo.color }} />
                                            {getEstadoLabel(t.estado)}
                                        </span>
                                        <i className="fa-solid fa-chevron-right bt-chevron" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {(page > 0 || existMoreItems) && (
                        <div className="bt-pager">
                            <button
                                className="bt-pager-btn"
                                disabled={page <= 0}
                                onClick={handlePreviousPage}
                            >
                                <i className="fa-solid fa-chevron-left" />
                                <FormattedMessage id="project.global.buttons.back" defaultMessage="Anterior" />
                            </button>
                            <button
                                className="bt-pager-btn"
                                disabled={!existMoreItems}
                                onClick={handleNextPage}
                            >
                                <FormattedMessage id="project.global.buttons.next" defaultMessage="Siguiente" />
                                <i className="fa-solid fa-chevron-right" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="bt-empty">
                    <span className="bt-empty-icon">🔍</span>
                    <h3 className="bt-empty-title">
                        {searchTerm || statusFilter ? (
                            <FormattedMessage id="project.tournaments.Browse.noResults" defaultMessage="No se encontraron torneos con los filtros seleccionados" />
                        ) : (
                            <FormattedMessage id="project.tournaments.Browse.noTournaments" defaultMessage="No hay torneos disponibles" />
                        )}
                    </h3>
                    <p className="bt-empty-desc">
                        {searchTerm || statusFilter ? (
                            <FormattedMessage id="project.tournaments.Browse.noResultsHelp" defaultMessage="Prueba con otros términos o limpia los filtros" />
                        ) : (
                            <FormattedMessage id="project.tournaments.Browse.noTournamentsHelp" defaultMessage="Cuando alguien cree un torneo, aparecerá aquí" />
                        )}
                    </p>
                    {(searchTerm || statusFilter) && (
                        <button className="bt-clear-btn" onClick={handleClearSearch}>
                            <i className="fa-solid fa-xmark" />
                            <FormattedMessage id="project.tournaments.Browse.clearFilter" defaultMessage="Limpiar filtros" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseTournaments;
