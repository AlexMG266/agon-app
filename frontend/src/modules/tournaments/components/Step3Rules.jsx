import { FormattedMessage } from 'react-intl';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const DESEMPATE_OPTS = [
    { value: 'PUNTOS', labelId: 'project.tournaments.CreateTournament.step3.tiebreaker.points', label: 'Puntos' },
    { value: 'DIFERENCIA_SET', labelId: 'project.tournaments.CreateTournament.step3.tiebreaker.setDiff', label: 'Diferencia de sets' },
    { value: 'ENFRENTAMIENTO_DIRECTO', labelId: 'project.tournaments.CreateTournament.step3.tiebreaker.headToHead', label: 'Enfrentamiento directo' },
    { value: 'DIFERENCIA_JUEGOS', labelId: 'project.tournaments.CreateTournament.step3.tiebreaker.gameDiff', label: 'Diferencia de juegos' },
];

const Step3Rules = ({ data, onChange, errors }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="ct-step-fields">

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="puntosVictoria">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.winPoints" defaultMessage="Puntos por victoria" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            max={10}
                            value={data.puntosVictoria ?? 3}
                            onChange={e => handleChange('puntosVictoria', parseInt(e.target.value) || 0)}
                            required
                            isInvalid={!!errors?.puntosVictoria}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.puntosVictoria || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="puntosEmpate">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.drawPoints" defaultMessage="Puntos por empate" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            max={10}
                            value={data.puntosEmpate ?? 1}
                            onChange={e => handleChange('puntosEmpate', parseInt(e.target.value) || 0)}
                            required
                            isInvalid={!!errors?.puntosEmpate}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.puntosEmpate || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="puntosDerrota">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.lossPoints" defaultMessage="Puntos por derrota" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            max={10}
                            value={data.puntosDerrota ?? 0}
                            onChange={e => handleChange('puntosDerrota', parseInt(e.target.value) || 0)}
                            required
                            isInvalid={!!errors?.puntosDerrota}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.puntosDerrota || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat" defaultMessage="Formato de partidos" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="d-flex gap-4">
                    <Form.Check
                        type="radio"
                        id="formato-4sets"
                        name="formatoPartidos"
                        label={<FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat.4sets" defaultMessage="4 sets (liga)" />}
                        value="4_SETS"
                        checked={data.formatoPartidos === '4_SETS'}
                        onChange={e => handleChange('formatoPartidos', e.target.value)}
                        isInvalid={!!errors?.formatoPartidos}
                    />
                    <Form.Check
                        type="radio"
                        id="formato-5sets"
                        name="formatoPartidos"
                        label={<FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat.5sets" defaultMessage="5 sets (playoff)" />}
                        value="5_SETS"
                        checked={data.formatoPartidos === '5_SETS'}
                        onChange={e => handleChange('formatoPartidos', e.target.value)}
                        isInvalid={!!errors?.formatoPartidos}
                    />
                </div>
                {errors?.formatoPartidos && (
                    <div className="text-danger small mt-1">{errors.formatoPartidos}</div>
                )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="criterioDesempate">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step3.tiebreaker" defaultMessage="Criterio de desempate" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Select
                    value={data.criterioDesempate || 'PUNTOS'}
                    onChange={e => handleChange('criterioDesempate', e.target.value)}
                    isInvalid={!!errors?.criterioDesempate}
                    className="form-control-apple"
                    style={{ maxWidth: '300px' }}
                >
                    {DESEMPATE_OPTS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            <FormattedMessage id={opt.labelId} defaultMessage={opt.label} />
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors?.criterioDesempate || <FormattedMessage id="project.global.validator.required" />}
                </Form.Control.Feedback>
            </Form.Group>
        </div>
    );
};

export default Step3Rules;
