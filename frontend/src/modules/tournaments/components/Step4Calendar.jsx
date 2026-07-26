import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

const DAYS_OF_WEEK = [
    { key: 'L', labelId: 'project.tournaments.CreateTournament.step4.day.mon', label: 'L' },
    { key: 'M', labelId: 'project.tournaments.CreateTournament.step4.day.tue', label: 'M' },
    { key: 'X', labelId: 'project.tournaments.CreateTournament.step4.day.wed', label: 'X' },
    { key: 'J', labelId: 'project.tournaments.CreateTournament.step4.day.thu', label: 'J' },
    { key: 'V', labelId: 'project.tournaments.CreateTournament.step4.day.fri', label: 'V' },
    { key: 'S', labelId: 'project.tournaments.CreateTournament.step4.day.sat', label: 'S' },
    { key: 'D', labelId: 'project.tournaments.CreateTournament.step4.day.sun', label: 'D' },
];

const DISTRIBUCION_OPTS = [
    { value: 'JORNADAS', labelId: 'project.tournaments.CreateTournament.step4.distribution.matchdays', label: 'Jornadas' },
    { value: 'UNIFORME', labelId: 'project.tournaments.CreateTournament.step4.distribution.uniform', label: 'Uniforme' },
    { value: 'RAPIDO', labelId: 'project.tournaments.CreateTournament.step4.distribution.fast', label: 'Rápido' },
];

const Step4Calendar = ({ data, onChange, errors }) => {
    const intl = useIntl();
    const [excludedDateInput, setExcludedDateInput] = useState('');

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const toggleDay = (dayKey) => {
        const current = data.diasDisponibles || [];
        const updated = current.includes(dayKey)
            ? current.filter(d => d !== dayKey)
            : [...current, dayKey];
        handleChange('diasDisponibles', updated);
    };

    const addExcludedDate = () => {
        if (excludedDateInput && !(data.fechasExcluidas || []).includes(excludedDateInput)) {
            const updated = [...(data.fechasExcluidas || []), excludedDateInput];
            handleChange('fechasExcluidas', updated);
            setExcludedDateInput('');
        }
    };

    const removeExcludedDate = (date) => {
        const updated = (data.fechasExcluidas || []).filter(d => d !== date);
        handleChange('fechasExcluidas', updated);
    };

    return (
        <div className="ct-step-fields">

            <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step4.availableDays" defaultMessage="Días disponibles" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="d-flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => {
                        const isSelected = (data.diasDisponibles || []).includes(day.key);
                        return (
                            <Button
                                key={day.key}
                                variant={isSelected ? 'dark' : 'outline-secondary'}
                                size="sm"
                                className="rounded-circle"
                                style={{ width: '44px', height: '44px', fontWeight: '600' }}
                                onClick={() => toggleDay(day.key)}
                            >
                                {day.label}
                            </Button>
                        );
                    })}
                </div>
                {errors?.diasDisponibles && (
                    <div className="text-danger small mt-1">{errors.diasDisponibles}</div>
                )}
            </Form.Group>

            <Row className="mb-4">
                <Col md={4}>
                    <Form.Group controlId="horaInicio">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.startTime" defaultMessage="Hora de inicio" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="time"
                            value={data.horaInicio || '16:00'}
                            onChange={e => handleChange('horaInicio', e.target.value)}
                            required
                            isInvalid={!!errors?.horaInicio}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.horaInicio || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="horaFin">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.endTime" defaultMessage="Hora de fin" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="time"
                            value={data.horaFin || '22:00'}
                            onChange={e => handleChange('horaFin', e.target.value)}
                            required
                            isInvalid={!!errors?.horaFin}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.horaFin || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="duracionPartido">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.matchDuration" defaultMessage="Duración del partido" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center gap-3">
                            <Form.Range
                                min={15}
                                max={120}
                                step={5}
                                value={data.duracionPartido || 45}
                                onChange={e => handleChange('duracionPartido', parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span className="fw-semibold text-nowrap" style={{ minWidth: '60px', fontSize: '0.9rem' }}>
                                {data.duracionPartido || 45} <FormattedMessage id="project.tournaments.CreateTournament.step4.minutes" defaultMessage="min" />
                            </span>
                        </div>
                        {errors?.duracionPartido && (
                            <div className="text-danger small mt-1">{errors.duracionPartido}</div>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step4.excludedDates" defaultMessage="Fechas excluidas" />
                </Form.Label>
                <div className="d-flex gap-2 mb-2">
                    <Form.Control
                        type="date"
                        value={excludedDateInput}
                        onChange={e => setExcludedDateInput(e.target.value)}
                        className="form-control-apple"
                        style={{ maxWidth: '220px' }}
                    />
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={addExcludedDate}
                        disabled={!excludedDateInput}
                    >
                        <FormattedMessage id="project.tournaments.CreateTournament.step4.addDate" defaultMessage="Añadir" />
                    </Button>
                </div>
                {(data.fechasExcluidas || []).length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                        {(data.fechasExcluidas || []).map(date => (
                            <Badge
                                key={date}
                                bg="light"
                                text="dark"
                                className="d-flex align-items-center gap-1 border px-3 py-2"
                                style={{ fontWeight: 'normal' }}
                            >
                                {date}
                                <button
                                    type="button"
                                    className="btn-close btn-close-sm ms-1"
                                    style={{ fontSize: '0.6rem' }}
                                    onClick={() => removeExcludedDate(date)}
                                    aria-label={intl.formatMessage({ id: 'project.tournaments.CreateTournament.step4.removeDate', defaultMessage: 'Eliminar' })}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution" defaultMessage="Estrategia de distribución" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="d-flex flex-column gap-2">
                    {DISTRIBUCION_OPTS.map(opt => (
                        <Form.Check
                            key={opt.value}
                            type="radio"
                            id={`dist-${opt.value}`}
                            name="estrategiaDistribucion"
                            label={<FormattedMessage id={opt.labelId} defaultMessage={opt.label} />}
                            value={opt.value}
                            checked={data.estrategiaDistribucion === opt.value}
                            onChange={e => handleChange('estrategiaDistribucion', e.target.value)}
                            isInvalid={!!errors?.estrategiaDistribucion}
                        />
                    ))}
                    {errors?.estrategiaDistribucion && (
                        <div className="text-danger small mt-1">{errors.estrategiaDistribucion}</div>
                    )}
                </div>

                {data.estrategiaDistribucion === 'JORNADAS' && (
                    <Form.Group className="mt-3" controlId="diasEntreJornadas">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.daysBetweenMatchdays" defaultMessage="Días entre jornadas" />
                        </Form.Label>
                        <div className="d-flex align-items-center gap-3">
                            <Form.Range
                                min={1}
                                max={14}
                                step={1}
                                value={data.diasEntreJornadas ?? 7}
                                onChange={e => handleChange('diasEntreJornadas', parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span className="fw-semibold text-nowrap" style={{ minWidth: '60px', fontSize: '0.9rem' }}>
                                {data.diasEntreJornadas ?? 7} <FormattedMessage id="project.tournaments.CreateTournament.step4.days" defaultMessage="días" />
                            </span>
                        </div>
                    </Form.Group>
                )}
            </Form.Group>
        </div>
    );
};

export default Step4Calendar;
