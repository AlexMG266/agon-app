import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import backend from '../../../backend';
import AplazarEncuentroModal from './AplazarEncuentroModal';
import './EncuentroModal.css';

const ESTADOS = {
    PENDIENTE: { labelId: 'project.matches.estado.pendiente', label: 'Pendiente' },
    JUGADO: { labelId: 'project.matches.estado.jugado', label: 'Jugado' },
    APLAZADO: { labelId: 'project.matches.estado.aplazado', label: 'Aplazado' },
    SOLICITADO_APLAZAMIENTO: { labelId: 'project.matches.estado.solicitadoAplazamiento', label: 'Aplazamiento solicitado' },
};

const EncuentroModal = ({ show, encuentro, capitanTeamIds = [], onHide, onRegistered }) => {
    const intl = useIntl();
    const [sets, setSets] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [aplazarModal, setAplazarModal] = useState(false);

    useEffect(() => {
        if (show && encuentro) {
            const numSets = (encuentro.sets && encuentro.sets.length) || 4;
            const rows = Array.from({ length: Math.min(Math.max(numSets, 4), 5) }, (_, i) => {
                const existing = encuentro.sets && encuentro.sets[i];
                return {
                    numeroSet: i + 1,
                    golesLocal: existing ? existing.golesLocal : 0,
                    golesVisitante: existing ? existing.golesVisitante : 0,
                };
            });
            setSets(rows);
            setError(null);
            setSuccess(false);
            setAplazarModal(false);
        }
    }, [show, encuentro]);

    if (!encuentro) return null;

    const fecha = encuentro.fechaRealizacion ? new Date(encuentro.fechaRealizacion) : null;
    const fechaStr = fecha
        ? intl.formatDate(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '';
    const horaStr = fecha ? intl.formatTime(fecha, { hour: '2-digit', minute: '2-digit' }) : '';
    const estado = ESTADOS[encuentro.estado] || null;

    const jugado = encuentro.estado === 'JUGADO';
    const esCapitan = capitanTeamIds.includes(encuentro.equipoLocalId) || capitanTeamIds.includes(encuentro.equipoVisitanteId);
    const puedeRegistrar = !jugado && esCapitan;

    const handleSetChange = (idx, field, value) => {
        setSets(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: parseInt(value) || 0 } : s)));
    };

    const handleAddSet = () => {
        setSets(prev => {
            if (prev.length >= 5) return prev;
            return [...prev, { numeroSet: prev.length + 1, golesLocal: 0, golesVisitante: 0 }];
        });
    };

    const handleRemoveSet = () => {
        setSets(prev => {
            if (prev.length <= 1) return prev;
            return prev.slice(0, -1);
        });
    };

    const validateSets = () => {
        if (!sets.length) return intl.formatMessage({ id: 'project.encuentro.error.noSets', defaultMessage: 'Debes indicar al menos un set.' });
        for (const s of sets) {
            if (s.golesLocal === s.golesVisitante) {
                return intl.formatMessage({ id: 'project.encuentro.error.draw', defaultMessage: 'Un set no puede terminar en empate.' });
            }
            if (s.golesLocal < 0 || s.golesVisitante < 0) {
                return intl.formatMessage({ id: 'project.encuentro.error.negative', defaultMessage: 'Los puntos no pueden ser negativos.' });
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateSets();
        if (validationError) {
            setError(validationError);
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = sets.map(s => ({
                numeroSet: s.numeroSet,
                golesLocal: s.golesLocal,
                golesVisitante: s.golesVisitante,
            }));
            const response = await backend.tournamentService.registerResult(encuentro.id, payload);
            if (response.ok) {
                setSuccess(true);
                if (onRegistered) onRegistered(encuentro.id);
            } else {
                const msg =
                    (response.payload && (response.payload.message || response.payload.error)) ||
                    response.error ||
                    intl.formatMessage({ id: 'project.encuentro.error.registro', defaultMessage: 'No se pudo registrar el resultado.' });
                setError(msg);
            }
        } catch (err) {
            setError(err.message || intl.formatMessage({ id: 'project.encuentro.error.registro', defaultMessage: 'No se pudo registrar el resultado.' }));
        } finally {
            setSaving(false);
        }
    };

    const handleAplazarEnviado = (encuentroId) => {
        if (onRegistered) onRegistered(encuentroId);
    };

    if (aplazarModal) {
        return (
            <AplazarEncuentroModal
                show
                encuentro={encuentro}
                onHide={() => setAplazarModal(false)}
                onEnviado={handleAplazarEnviado}
                onSuccessClose={() => {
                    setAplazarModal(false);
                    onHide();
                }}
            />
        );
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            backdropClassName="enm-backdrop"
            dialogClassName="enm-dialog"
            contentClassName="enm-content"
        >
            <Modal.Header closeButton className="enm-header">
                <Modal.Title className="enm-title">
                    <span className="enm-title-icon">
                        <i className="fa-solid fa-volleyball" />
                    </span>
                    <FormattedMessage id="project.encuentro.title" defaultMessage="Detalle del encuentro" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="enm-body">
                {success ? (
                    <div className="enm-success">
                        <i className="fa-solid fa-circle-check enm-success-icon" />
                        <p className="enm-success-title">
                            <FormattedMessage id="project.encuentro.success" defaultMessage="Resultado registrado" />
                        </p>
                        <p className="enm-success-detail">
                            <FormattedMessage id="project.encuentro.successDetail" defaultMessage="El resultado del encuentro se ha guardado correctamente." />
                        </p>
                        <Button variant="outline-dark" size="sm" className="enm-btn enm-btn-cancel" onClick={onHide}>
                            <FormattedMessage id="project.encuentro.close" defaultMessage="Cerrar" />
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Cabecera: fecha / estado */}
                        <div className="enm-meta">
                            {fecha && (
                                <span className="enm-date">
                                    <i className="fa-regular fa-calendar" />
                                    {fechaStr} · {horaStr}
                                </span>
                            )}
                            {estado && (
                                <span className={`enm-badge ${encuentro.estado === 'JUGADO' ? 'enm-badge-played' : ''}`}>
                                    <FormattedMessage id={estado.labelId} defaultMessage={estado.label} />
                                </span>
                            )}
                        </div>

                        {/* Enfrentamiento */}
                        <div className="enm-scoreboard">
                            <div className="enm-team">
                                <div className="enm-team-icon enm-team-icon-local">
                                    <i className="fa-solid fa-shield-halved" />
                                </div>
                                <div className="enm-team-name" title={encuentro.equipoLocalNombre || ''}>
                                    {encuentro.equipoLocalNombre || '—'}
                                </div>
                            </div>
                            <div className={`enm-vs ${jugado ? 'enm-vs-played' : ''}`}>
                                {jugado ? encuentro.resultado : <FormattedMessage id="project.matches.vs" defaultMessage="vs" />}
                            </div>
                            <div className="enm-team">
                                <div className="enm-team-icon enm-team-icon-visitor">
                                    <i className="fa-solid fa-shield-halved" />
                                </div>
                                <div className="enm-team-name" title={encuentro.equipoVisitanteNombre || ''}>
                                    {encuentro.equipoVisitanteNombre || '—'}
                                </div>
                            </div>
                        </div>

                        {/* Detalle de sets ya registrados */}
                        {jugado && encuentro.sets && encuentro.sets.length > 0 && (
                            <div>
                                <div className="enm-section-label">
                                    <i className="fa-solid fa-list-ol" />
                                    <FormattedMessage id="project.encuentro.setsDetail" defaultMessage="Sets" />
                                </div>
                                <div className="enm-sets-list">
                                    {encuentro.sets.map((set, idx) => (
                                        <div key={`${set.numeroSet}-${idx}`} className="enm-set-row">
                                            <span className="enm-set-num">
                                                <FormattedMessage id="project.encuentro.set" defaultMessage="Set" /> {set.numeroSet}
                                            </span>
                                            <span className={`enm-set-score ${set.golesLocal > set.golesVisitante ? 'enm-set-score-win' : ''}`}>
                                                {set.golesLocal} - {set.golesVisitante}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario de registro (solo capitanes y encuentro no jugado) */}
                        {puedeRegistrar && (
                            <Form onSubmit={handleSubmit} className="enm-card">
                                <div className="enm-card-header">
                                    <span className="enm-section-label enm-section-label-inline">
                                        <i className="fa-regular fa-pen-to-square" />
                                        <FormattedMessage id="project.encuentro.registerTitle" defaultMessage="Registrar resultado" />
                                    </span>
                                    <div className="enm-row-tools">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="enm-tool-btn"
                                            onClick={handleRemoveSet}
                                            disabled={sets.length <= 1}
                                            type="button"
                                            title={intl.formatMessage({ id: 'project.encuentro.removeSet', defaultMessage: 'Quitar set' })}
                                        >
                                            <i className="fa-regular fa-minus" />
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="enm-tool-btn"
                                            onClick={handleAddSet}
                                            disabled={sets.length >= 5}
                                            type="button"
                                            title={intl.formatMessage({ id: 'project.encuentro.addSet', defaultMessage: 'Añadir set' })}
                                        >
                                            <i className="fa-regular fa-plus" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    {sets.map((s, idx) => (
                                        <div key={idx} className="enm-set-input-row">
                                            <span className="enm-set-tag">
                                                <FormattedMessage id="project.encuentro.set" defaultMessage="Set" /> {s.numeroSet}
                                            </span>
                                            <div className="enm-score-side">
                                                <span className="enm-score-label">
                                                    <FormattedMessage id="project.encuentro.local" defaultMessage="Local" />
                                                </span>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    value={s.golesLocal}
                                                    onChange={e => handleSetChange(idx, 'golesLocal', e.target.value)}
                                                    className="enm-score-input"
                                                />
                                            </div>
                                            <span className="enm-divider">—</span>
                                            <div className="enm-score-side">
                                                <span className="enm-score-label">
                                                    <FormattedMessage id="project.encuentro.visitor" defaultMessage="Visitante" />
                                                </span>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    value={s.golesVisitante}
                                                    onChange={e => handleSetChange(idx, 'golesVisitante', e.target.value)}
                                                    className="enm-score-input"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div className="enm-alert" role="alert">
                                        <i className="fa-regular fa-triangle-exclamation" />
                                        {error}
                                    </div>
                                )}

                                <div className="enm-actions">
                                    <Button variant="light" className="enm-btn enm-btn-cancel" onClick={onHide} disabled={saving}>
                                        <FormattedMessage id="project.encuentro.cancel" defaultMessage="Cancelar" />
                                    </Button>
                                    <Button type="submit" variant="dark" className="enm-btn enm-btn-primary" disabled={saving}>
                                        {saving ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <>
                                                <i className="fa-regular fa-check" />
                                                <FormattedMessage id="project.encuentro.register" defaultMessage="Registrar resultado" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {/* Mensaje si está jugado y no puede registrarse */}
                        {jugado && (
                            <div className="enm-note">
                                <i className="fa-regular fa-circle-check" />
                                <FormattedMessage id="project.encuentro.played" defaultMessage="Este encuentro ya se ha disputado." />
                            </div>
                        )}

                        {!jugado && !esCapitan && (
                            <div className="enm-note">
                                <i className="fa-regular fa-user" />
                                <FormattedMessage id="project.encuentro.noCaptain" defaultMessage="Solo los capitanes de los equipos pueden registrar el resultado." />
                            </div>
                        )}

                        {/* solicitud de aplazamiento (solo capitanes y encuentro no jugado) */}
                        {!jugado && esCapitan && encuentro.estado !== 'SOLICITADO_APLAZAMIENTO' && (
                            <div className="enm-aplazar">
                                <Button
                                    variant="outline-secondary"
                                    className="enm-btn enm-btn-aplazar"
                                    onClick={() => setAplazarModal(true)}
                                >
                                    <i className="fa-regular fa-calendar-plus" />
                                    <FormattedMessage id="project.encuentro.aplazarButton" defaultMessage="Solicitar aplazamiento" />
                                </Button>
                            </div>
                        )}

                        {/* estado de solicitud pendiente */}
                        {!jugado && esCapitan && encuentro.estado === 'SOLICITADO_APLAZAMIENTO' && (
                            <div className="enm-pending">
                                <i className="fa-regular fa-hourglass-half" />
                                <FormattedMessage id="project.encuentro.aplazarPendiente" defaultMessage="Hay una solicitud de aplazamiento pendiente de confirmar por el otro capitán." />
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EncuentroModal;
