import { useState, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import backend from '../../../backend';
import users from '../../users';
import EncuentroModal from './EncuentroModal';
import './MyMatches.css';

const ESTADOS = {
    PENDIENTE: { labelId: 'project.matches.estado.pendiente', label: 'Pendiente', css: 'mm-badge--pending' },
    JUGADO: { labelId: 'project.matches.estado.jugado', label: 'Jugado', css: 'mm-badge--played' },
    APLAZADO: { labelId: 'project.matches.estado.aplazado', label: 'Aplazado', css: 'mm-badge--postponed' },
    SOLICITADO_APLAZAMIENTO: { labelId: 'project.matches.estado.solicitadoAplazamiento', label: 'Aplazamiento solicitado', css: 'mm-badge--requested' },
};

const formatDateLong = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateShort = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const MyMatches = ({ embedded = false }) => {
    const carouselRef = useRef(null);
    const loggedUser = useSelector(users.selectors.getUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fechas, setFechas] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [capitanTeamIds, setCapitanTeamIds] = useState([]);
    const [selectedEncuentro, setSelectedEncuentro] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError(false);
                const response = await backend.tournamentService.getMyMatches();
                if (response.ok) {
                    // Ordenar por fecha ascendente (la más próxima primero no; cronológica ascendente)
                    const data = (response.payload || []).slice().sort((a, b) => {
                        if (!a.fecha) return 1;
                        if (!b.fecha) return -1;
                        return new Date(a.fecha) - new Date(b.fecha);
                    });
                    setFechas(data);
                    setCurrentIdx(0);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Equipos donde el usuario es miembro (cualquier miembro puede registrar resultados).
    useEffect(() => {
        const loadCapitanTeams = async () => {
            if (!loggedUser) return;
            try {
                const response = await backend.teamService.getMyTeams();
                if (response.ok) {
                    const ids = (response.payload || []).map(t => t.id);
                    setCapitanTeamIds(ids);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadCapitanTeams();
    }, [loggedUser]);

    // Desplazar la ventana del carrusel para centrar la fecha seleccionada:
    // las cards de la izquierda salen por la izquierda y entran nuevas por la derecha.
    useEffect(() => {
        if (!carouselRef.current) return;
        const track = carouselRef.current;
        const active = track.querySelector('.mm-carousel-item--active');
        if (!active) return;
        const trackRect = track.getBoundingClientRect();
        const chipRect = active.getBoundingClientRect();
        const offset = chipRect.left - trackRect.left - (trackRect.width - chipRect.width) / 2;
        track.scrollBy({ left: offset, behavior: 'smooth' });
    }, [currentIdx]);

    const handleEncuentroClick = (enc) => setSelectedEncuentro(enc);

    const handleRegistered = () => {
        // Refrescar los encuentros tras registrar un resultado.
        const init = async () => {
            try {
                const response = await backend.tournamentService.getMyMatches();
                if (response.ok) {
                    const data = (response.payload || []).slice().sort((a, b) => {
                        if (!a.fecha) return 1;
                        if (!b.fecha) return -1;
                        return new Date(a.fecha) - new Date(b.fecha);
                    });
                    setFechas(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        init();
    };

    const current = fechas[currentIdx];

    const totalEncuentros = fechas.reduce((acc, f) => acc + (f.encuentros ? f.encuentros.length : 0), 0);
    const pendientes = fechas.reduce(
        (acc, f) => acc + (f.encuentros ? f.encuentros.filter(e => e.estado === 'PENDIENTE').length : 0),
        0
    );

    return (
        <div className={`mm-container${embedded ? ' mm-container--embedded' : ''}`}>
            {!embedded && (
                <div className="mm-header">
                    <div>
                        <h1 className="mm-title">
                            <i className="fa-regular fa-calendar-days me-2" />
                            <FormattedMessage id="project.matches.title" defaultMessage="Mis Partidos" />
                        </h1>
                        <p className="mm-subtitle">
                            <FormattedMessage id="project.matches.subtitle" defaultMessage="Tus encuentros organizados por fecha" />
                        </p>
                    </div>
                </div>
            )}

            {!loading && !error && fechas.length > 0 && (
                <div className="mm-summary">
                    <div className="mm-summary-item">
                        <span className="mm-summary-value">{totalEncuentros}</span>
                        <span className="mm-summary-label">
                            <FormattedMessage id="project.matches.summaryTotal" defaultMessage="Partidos" />
                        </span>
                    </div>
                    <div className="mm-summary-item">
                        <span className="mm-summary-value">{pendientes}</span>
                        <span className="mm-summary-label">
                            <FormattedMessage id="project.matches.summaryPending" defaultMessage="Pendientes" />
                        </span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="mm-loading">
                    <Spinner animation="border" variant="secondary" />
                    <p className="small text-muted mt-2 mb-0">
                        <FormattedMessage id="project.matches.loading" defaultMessage="Cargando partidos…" />
                    </p>
                </div>
            ) : error ? (
                <div className="mm-empty">
                    <i className="fa-solid fa-triangle-exclamation mb-3" style={{ fontSize: '2rem', color: '#ff9500' }} />
                    <span>
                        <FormattedMessage id="project.matches.error" defaultMessage="No se pudieron cargar tus partidos. Inténtalo de nuevo." />
                    </span>
                </div>
            ) : fechas.length === 0 ? (
                <div className="mm-empty">
                    <i className="fa-regular fa-calendar-xmark mb-3" style={{ fontSize: '2rem', color: '#8e8e93' }} />
                    <span>
                        <FormattedMessage id="project.matches.empty" defaultMessage="Aún no tienes partidos programados." />
                    </span>
                </div>
            ) : (
                <>
                    <div className="mm-carousel">
                        <button
                            className="mm-carousel-btn"
                            disabled={currentIdx <= 0}
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            aria-label="Fecha anterior"
                        >
                            <i className="fa-regular fa-chevron-left" />
                        </button>
                        <div className="mm-carousel-track" ref={carouselRef}>
                            {fechas.map((f, idx) => {
                                const fechaStr = formatDateShort(f.fecha);
                                const isToday = f.fecha && new Date(f.fecha).toDateString() === new Date().toDateString();
                                return (
                                    <div
                                        key={f.fecha || idx}
                                        className={`mm-carousel-item${idx === currentIdx ? ' mm-carousel-item--active' : ''}`}
                                        onClick={() => setCurrentIdx(idx)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCurrentIdx(idx); }}
                                    >
                                        <span className="mm-carousel-item-day">
                                            {f.fecha ? new Date(f.fecha).toLocaleDateString('es-ES', { day: 'numeric' }) : '—'}
                                        </span>
                                        <span className="mm-carousel-item-date">{fechaStr}</span>
                                        {isToday && (
                                            <span className="mm-carousel-item-today">
                                                <FormattedMessage id="project.matches.today" defaultMessage="Hoy" />
                                            </span>
                                        )}
                                        <span className="mm-carousel-item-count">{f.encuentros.length}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mm-mobile-select-wrapper">
                            <select
                                className="mm-mobile-select"
                                value={currentIdx}
                                onChange={e => setCurrentIdx(parseInt(e.target.value))}
                                aria-label="Seleccionar fecha"
                            >
                                {fechas.map((f, idx) => (
                                    <option key={f.fecha || idx} value={idx}>
                                        {formatDateLong(f.fecha)} ({f.encuentros.length})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="mm-carousel-btn"
                            disabled={currentIdx >= fechas.length - 1}
                            onClick={() => setCurrentIdx(prev => Math.min(fechas.length - 1, prev + 1))}
                            aria-label="Fecha siguiente"
                        >
                            <i className="fa-regular fa-chevron-right" />
                        </button>
                    </div>

                    {current && (
                        <div className="mm-day-section">
                            <div className="mm-day-header">
                                <i className="fa-regular fa-calendar me-2" />
                                <span className="mm-day-title">{formatDateLong(current.fecha)}</span>
                                <span className="mm-day-count">
                                    <FormattedMessage
                                        id="project.matches.count"
                                        defaultMessage="{count, plural, one {# partido} other {# partidos}}"
                                        values={{ count: current.encuentros.length }}
                                    />
                                </span>
                            </div>

                            {current.encuentros.length > 0 ? (
                                <div className="mm-grid">
                                    {current.encuentros.map(enc => {
                                        const fecha = enc.fechaRealizacion ? new Date(enc.fechaRealizacion) : null;
                                        const fechaStr = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                        const horaStr = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                                        const estado = ESTADOS[enc.estado] || null;
                                        const jugado = enc.estado === 'JUGADO';
                                        return (
                                            <div
                                                key={enc.id}
                                                className="mm-partido-card"
                                                onClick={() => handleEncuentroClick(enc)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleEncuentroClick(enc); }}
                                            >
                                                <div className="mm-partido-card-teams">
                                                    <div className="mm-partido-card-team">
                                                        <i className="fa-regular fa-shield-halved mm-partido-card-shield" />
                                                        <span className="mm-partido-card-team-name">{enc.equipoLocalNombre || '—'}</span>
                                                        {jugado && (
                                                            <span className="mm-partido-card-score">{enc.resultado ? enc.resultado.split('-')[0] : '—'}</span>
                                                        )}
                                                    </div>
                                                    <div className="mm-partido-card-team">
                                                        <i className="fa-regular fa-shield-halved mm-partido-card-shield" />
                                                        <span className="mm-partido-card-team-name">{enc.equipoVisitanteNombre || '—'}</span>
                                                        {jugado && (
                                                            <span className="mm-partido-card-score">{enc.resultado ? enc.resultado.split('-')[1] : '—'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mm-partido-card-datetime">
                                                    {fecha && (
                                                        <>
                                                            <span className="mm-partido-card-date">{fechaStr}</span>
                                                            <span className="mm-partido-card-time">{horaStr}</span>
                                                        </>
                                                    )}
                                                    {estado && (
                                                        <span className={`mm-partido-card-badge ${estado.css}`}>
                                                            <FormattedMessage id={estado.labelId} defaultMessage={estado.label} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mm-empty">
                                    <FormattedMessage id="project.matches.noEncuentros" defaultMessage="No hay encuentros en esta fecha." />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de detalle del encuentro */}
            <EncuentroModal
                show={!!selectedEncuentro}
                encuentro={selectedEncuentro}
                capitanTeamIds={capitanTeamIds}
                onHide={() => setSelectedEncuentro(null)}
                onRegistered={handleRegistered}
            />
        </div>
    );
};

export default MyMatches;
