import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import backend from '../../../backend';

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

    // Resetear el formulario cada vez que se abre con un encuentro distinto.
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
        }
    }, [show, encuentro]);

    if (!encuentro) return null;

    const fecha = encuentro.fechaRealizacion ? new Date(encuentro.fechaRealizacion) : null;
    const fechaStr = fecha
        ? fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '';
    const horaStr = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
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

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            contentClassName="border-0 rounded-4 shadow"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
        >
            <Modal.Header closeButton className="border-0 pb-0" style={{ background: 'linear-gradient(180deg, #f5f7fb 0%, #ffffff 100%)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                <Modal.Title as="h5" className="fw-bold d-flex align-items-center">
                    <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 30, height: 30, borderRadius: 9, background: '#0071e3', color: '#fff' }}>
                        <i className="fa-solid fa-volleyball" style={{ fontSize: '0.85rem' }} />
                    </span>
                    <FormattedMessage id="project.encuentro.title" defaultMessage="Detalle del encuentro" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 pt-2">
                {success ? (
                    <div className="text-center py-4">
                        <i className="fa-solid fa-circle-check text-success mb-2" style={{ fontSize: '2.5rem' }} />
                        <p className="fw-semibold mb-1">
                            <FormattedMessage id="project.encuentro.success" defaultMessage="Resultado registrado" />
                        </p>
                        <p className="small text-muted m-0">
                            <FormattedMessage id="project.encuentro.successDetail" defaultMessage="El resultado del encuentro se ha guardado correctamente." />
                        </p>
                        <Button
                            variant="outline-dark"
                            size="sm"
                            className="rounded-pill mt-3"
                            onClick={onHide}
                        >
                            <FormattedMessage id="project.encuentro.close" defaultMessage="Cerrar" />
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Cabecera: fecha / estado */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {fecha && (
                                <span className="small text-muted text-capitalize">
                                    <i className="fa-regular fa-calendar me-1" />
                                    {fechaStr} · {horaStr}
                                </span>
                            )}
                            {estado && (
                                <span
                                    className="badge rounded-pill text-uppercase"
                                    style={{
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        background: encuentro.estado === 'JUGADO' ? '#e8f8ee' : '#e8f1ff',
                                        color: encuentro.estado === 'JUGADO' ? '#1a7d36' : '#0071e3',
                                        padding: '0.25rem 0.6rem',
                                    }}
                                >
                                    <FormattedMessage id={estado.labelId} defaultMessage={estado.label} />
                                </span>
                            )}
                        </div>

                        {/* Enfrentamiento */}
                        <div className="d-flex align-items-center justify-content-center gap-3 py-2 mb-1">
                            <div className="text-center" style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                    style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,113,227,0.1)', color: '#0071e3', fontSize: '1.15rem' }}
                                >
                                    <i className="fa-solid fa-shield-halved" />
                                </div>
                                <div
                                    className="fw-semibold text-truncate"
                                    style={{ fontSize: '0.95rem', color: '#1d1d1f' }}
                                    title={encuentro.equipoLocalNombre || ''}
                                >
                                    {encuentro.equipoLocalNombre || '—'}
                                </div>
                            </div>
                            <div
                                className="text-center d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: '50%',
                                    background: jugado ? '#e8f8ee' : '#f2f2f7',
                                    color: jugado ? '#1a7d36' : '#8e8e93',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                }}
                            >
                                {jugado ? encuentro.resultado : 'vs'}
                            </div>
                            <div className="text-center" style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                    style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(110,110,115,0.08)', color: '#6e6e73', fontSize: '1.15rem' }}
                                >
                                    <i className="fa-solid fa-shield-halved" />
                                </div>
                                <div
                                    className="fw-semibold text-truncate"
                                    style={{ fontSize: '0.95rem', color: '#1d1d1f' }}
                                    title={encuentro.equipoVisitanteNombre || ''}
                                >
                                    {encuentro.equipoVisitanteNombre || '—'}
                                </div>
                            </div>
                        </div>

                        {/* Detalle de sets ya registrados */}
                        {jugado && encuentro.sets && encuentro.sets.length > 0 && (
                            <div className="mt-3">
                                <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                                    <FormattedMessage id="project.encuentro.setsDetail" defaultMessage="Sets" />
                                </div>
                                <div className="d-flex flex-column gap-1">
                                    {encuentro.sets.map((set, idx) => (
                                        <div
                                            key={`${set.numeroSet}-${idx}`}
                                            className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
                                            style={{ background: '#f9f9fb', border: '1px solid #eef0f3' }}
                                        >
                                            <span className="small text-muted">
                                                <FormattedMessage id="project.encuentro.set" defaultMessage="Set" /> {set.numeroSet}
                                            </span>
                                            <span
                                                className="small fw-bold px-2 py-0 rounded-2"
                                                style={{
                                                    background: set.golesLocal > set.golesVisitante ? 'rgba(0,113,227,0.1)' : 'rgba(110,110,115,0.08)',
                                                    color: set.golesLocal > set.golesVisitante ? '#0071e3' : '#6e6e73',
                                                }}
                                            >
                                                {set.golesLocal} - {set.golesVisitante}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario de registro (solo capitanes y encuentro no jugado) */}
                        {puedeRegistrar && (
                            <Form onSubmit={handleSubmit} className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-semibold text-uppercase d-flex align-items-center gap-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em', color: '#8e8e93' }}>
                                        <i className="fa-regular fa-pen-to-square" />
                                        <FormattedMessage id="project.encuentro.registerTitle" defaultMessage="Registrar resultado" />
                                    </span>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="rounded-pill"
                                            style={{ fontSize: '0.7rem', width: 30, height: 30, padding: 0 }}
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
                                            className="rounded-pill"
                                            style={{ fontSize: '0.7rem', width: 30, height: 30, padding: 0 }}
                                            onClick={handleAddSet}
                                            disabled={sets.length >= 5}
                                            type="button"
                                            title={intl.formatMessage({ id: 'project.encuentro.addSet', defaultMessage: 'Añadir set' })}
                                        >
                                            <i className="fa-regular fa-plus" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-2">
                                    {sets.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                                            style={{ background: '#f9f9fb', border: '1px solid #eef0f3' }}
                                        >
                                            <span className="small text-muted fw-semibold" style={{ width: 44, flexShrink: 0 }}>
                                                <FormattedMessage id="project.encuentro.set" defaultMessage="Set" /> {s.numeroSet}
                                            </span>
                                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                <Form.Label className="mb-0 small text-muted" style={{ fontSize: '0.6rem' }}>
                                                    Local
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    value={s.golesLocal}
                                                    onChange={e => handleSetChange(idx, 'golesLocal', e.target.value)}
                                                    className="text-center"
                                                    style={{ maxWidth: 80, fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <span className="text-muted small">—</span>
                                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                <Form.Label className="mb-0 small text-muted" style={{ fontSize: '0.6rem' }}>
                                                    Visitante
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    value={s.golesVisitante}
                                                    onChange={e => handleSetChange(idx, 'golesVisitante', e.target.value)}
                                                    className="text-center"
                                                    style={{ maxWidth: 80, fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0" style={{ fontSize: '0.78rem' }}>
                                        <i className="fa-regular fa-triangle-exclamation me-1" />
                                        {error}
                                    </div>
                                )}

                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <Button variant="light" className="rounded-pill" onClick={onHide} disabled={saving}>
                                        <FormattedMessage id="project.encuentro.cancel" defaultMessage="Cancelar" />
                                    </Button>
                                    <Button type="submit" variant="dark" className="rounded-pill px-4" disabled={saving}>
                                        {saving ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <>
                                                <i className="fa-regular fa-check me-1" />
                                                <FormattedMessage id="project.encuentro.register" defaultMessage="Registrar resultado" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {/* Mensaje si está jugado y no puede registrarse */}
                        {jugado && (
                            <div className="text-center small text-muted mt-3">
                                <FormattedMessage id="project.encuentro.played" defaultMessage="Este encuentro ya se ha disputado." />
                            </div>
                        )}

                        {!jugado && !esCapitan && (
                            <div className="text-center small text-muted mt-3">
                                <FormattedMessage id="project.encuentro.noCaptain" defaultMessage="Solo los capitanes de los equipos pueden registrar el resultado." />
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EncuentroModal;
