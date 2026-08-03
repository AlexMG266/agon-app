import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import backend from '../../../backend';
import users from '../../users';
import './EloStats.css';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 42 };

/**
 * Sección de estadísticas de ELO del panel de control.
 * Muestra un gráfico de líneas (estilo chess.com) con la evolución del ELO
 * a lo largo del tiempo, junto a un resumen de partidas y variaciones.
 */
const EloStats = () => {
    const intl = useIntl();
    const user = useSelector(users.selectors.getUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const init = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(false);
                const response = await backend.userService.getEloHistory(user.id);
                if (response.ok) {
                    setHistory(response.payload || []);
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
    }, [user?.id]);

    // Puntos del gráfico: comienza en el ELO anterior del primer registro (o 800 si no hay historial).
    const chartData = useMemo(() => {
        if (!history.length) return [];
        const points = [];
        let elo = history[0].eloAnterior != null ? history[0].eloAnterior : 800;
        points.push({ fecha: null, elo });
        history.forEach(entry => {
            elo = entry.eloNuevo != null ? entry.eloNuevo : elo;
            points.push({ fecha: entry.fecha, elo });
        });
        return points;
    }, [history]);

    const { pathD, areaPathD, minElo, maxElo } = useMemo(() => {
        if (!chartData.length) return { pathD: '', areaPathD: '', minElo: 0, maxElo: 0 };
        const innerW = CHART_WIDTH - PAD.left - PAD.right;
        const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;

        const elos = chartData.map(p => p.elo);
        let min = Math.min(...elos);
        let max = Math.max(...elos);
        if (min === max) {
            min -= 10;
            max += 10;
        }
        const range = max - min;
        const padV = range * 0.12;

        const xFor = i => PAD.left + (innerW * i) / Math.max(1, chartData.length - 1);
        const yFor = elo => PAD.top + innerH - (innerH * (elo - (min - padV))) / (range + 2 * padV);

        let path = '';
        let areaPath = '';
        chartData.forEach((p, i) => {
            const x = xFor(i);
            const y = yFor(p.elo);
            if (i === 0) {
                path = `M ${x} ${y}`;
                areaPath = `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
                areaPath += ` L ${x} ${y}`;
            }
        });
        areaPath += ` L ${xFor(chartData.length - 1)} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`;

        return { pathD: path, areaPathD: areaPath, minElo: Math.floor(min - padV), maxElo: Math.ceil(max + padV) };
    }, [chartData]);

    const summary = useMemo(() => {
        const total = history.length;
        const wins = history.filter(h => h.resultado === 'VICTORIA').length;
        const losses = history.filter(h => h.resultado === 'DERROTA').length;
        const draws = history.filter(h => h.resultado === 'EMPATE').length;
        const gained = history.filter(h => h.variacion > 0).reduce((acc, h) => acc + h.variacion, 0);
        const lost = history.filter(h => h.variacion < 0).reduce((acc, h) => acc + Math.abs(h.variacion), 0);
        const currentElo = history.length ? history[history.length - 1].eloNuevo : (user?.elo ?? 800);
        return { total, wins, losses, draws, gained, lost, currentElo };
    }, [history, user]);

    const formatShortDate = fecha => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) return '';
        return intl.formatDate(d, { day: 'numeric', month: 'short' });
    };

    const renderChart = () => {
        if (loading) {
            return (
                <div className="elostats-center">
                    <Spinner animation="border" variant="secondary" size="sm" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="elostats-center elostats-muted">
                    <FormattedMessage id="project.app.Home.eloStats.error" defaultMessage="No se pudieron cargar las estadísticas de ELO" />
                </div>
            );
        }
        if (!history.length) {
            return (
                <div className="elostats-center">
                    <div className="elostats-empty-icon">📈</div>
                    <div className="elostats-empty-text">
                        <FormattedMessage id="project.app.Home.eloStats.empty" defaultMessage="Aún no hay datos de ELO" />
                    </div>
                    <div className="elostats-empty-help">
                        <FormattedMessage id="project.app.Home.eloStats.emptyHelp" defaultMessage="Registra resultados de tus partidos para ver la evolución de tu ELO" />
                    </div>
                </div>
            );
        }

        const innerW = CHART_WIDTH - PAD.left - PAD.right;
        const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;

        const yTicks = 4;
        const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
            Math.round(minElo + ((maxElo - minElo) * i) / yTicks));

        const xLabels = chartData.map((p, i) => (
            <text key={i} x={PAD.left + (innerW * i) / Math.max(1, chartData.length - 1)}
                y={CHART_HEIGHT - 8} textAnchor="middle" className="elostats-axis-label">
                {formatShortDate(p.fecha)}
            </text>
        ));

        return (
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="elostats-chart" role="img"
                aria-label={intl.formatMessage({ id: 'project.app.Home.eloStats.chartAria', defaultMessage: 'Gráfico de evolución del ELO' })}>
                {yTickValues.map(v => {
                    const y = PAD.top + innerH - (innerH * (v - minElo)) / (maxElo - minElo);
                    return (
                        <g key={v}>
                            <line x1={PAD.left} x2={CHART_WIDTH - PAD.right} y1={y} y2={y} className="elostats-grid-line" />
                            <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="elostats-axis-label">{v}</text>
                        </g>
                    );
                })}
                <path d={areaPathD} className="elostats-area" />
                <path d={pathD} className="elostats-line" fill="none" />
                {chartData.map((p, i) => {
                    if (i === 0) return null;
                    const x = PAD.left + (innerW * i) / Math.max(1, chartData.length - 1);
                    const y = PAD.top + innerH - (innerH * (p.elo - minElo)) / (maxElo - minElo);
                    const up = p.elo >= chartData[i - 1].elo;
                    return <circle key={i} cx={x} cy={y} r="3.5"
                        className={up ? 'elostats-dot-up' : 'elostats-dot-down'} />;
                })}
                {xLabels}
            </svg>
        );
    };

    const renderSummary = () => {
        if (loading || error || !history.length) return null;
        return (
            <div className="elostats-summary">
                <div className="elostats-summary-main">
                    <div className="elostats-current-elo">{summary.currentElo}</div>
                    <div className="elostats-current-label">
                        <FormattedMessage id="project.app.Home.eloStats.currentElo" defaultMessage="ELO actual" />
                    </div>
                </div>
                <div className="elostats-summary-grid">
                    <div className="elostats-summary-item">
                        <div className="elostats-summary-value">{summary.total}</div>
                        <div className="elostats-summary-label">
                            <FormattedMessage id="project.app.Home.eloStats.matches" defaultMessage="Partidos" />
                        </div>
                    </div>
                    <div className="elostats-summary-item elostats-up">
                        <div className="elostats-summary-value">+{summary.gained}</div>
                        <div className="elostats-summary-label">
                            <FormattedMessage id="project.app.Home.eloStats.gained" defaultMessage="ELO ganado" />
                        </div>
                    </div>
                    <div className="elostats-summary-item elostats-down">
                        <div className="elostats-summary-value">-{summary.lost}</div>
                        <div className="elostats-summary-label">
                            <FormattedMessage id="project.app.Home.eloStats.lost" defaultMessage="ELO perdido" />
                        </div>
                    </div>
                </div>
                <div className="elostats-summary-row">
                    <span className="elostats-badge elostats-badge-win">
                        <FormattedMessage id="project.app.Home.eloStats.wins" defaultMessage="{count} victorias" values={{ count: summary.wins }} />
                    </span>
                    <span className="elostats-badge elostats-badge-draw">
                        <FormattedMessage id="project.app.Home.eloStats.draws" defaultMessage="{count} empates" values={{ count: summary.draws }} />
                    </span>
                    <span className="elostats-badge elostats-badge-loss">
                        <FormattedMessage id="project.app.Home.eloStats.losses" defaultMessage="{count} derrotas" values={{ count: summary.losses }} />
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="elostats-section">
            <div className="section-header">
                <h5>
                    <FormattedMessage id="project.app.Home.eloStats.title" defaultMessage="Estadísticas de ELO" />
                </h5>
                <span className="elostats-update">
                    <FormattedMessage id="project.app.Home.eloStats.updated" defaultMessage="Actualizado con cada resultado" />
                </span>
            </div>
            <div className="elostats-body">
                {renderSummary()}
                {renderChart()}
            </div>
        </div>
    );
};

export default EloStats;
