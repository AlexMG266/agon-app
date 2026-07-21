import { FormattedMessage, useIntl } from 'react-intl';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Step1BasicInfo = ({ data, onChange, errors }) => {
    const intl = useIntl();

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div>
            <h5 className="fw-bold mb-1">
                <FormattedMessage id="project.tournaments.CreateTournament.step1.title" defaultMessage="Información Básica" />
            </h5>
            <p className="text-muted small mb-4">
                <FormattedMessage id="project.tournaments.CreateTournament.step1.subtitle" defaultMessage="Define el nombre y las fechas clave del torneo." />
            </p>

            <Form.Group className="mb-4" controlId="tournamentName">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step1.name" defaultMessage="Nombre del torneo" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={data.nombre || ''}
                    onChange={e => handleChange('nombre', e.target.value)}
                    required
                    maxLength={100}
                    placeholder={intl.formatMessage({ id: 'project.tournaments.CreateTournament.step1.namePlaceholder', defaultMessage: 'Ej. Copa de Primavera' })}
                    isInvalid={!!errors?.nombre}
                    className="form-control-apple"
                />
                <Form.Control.Feedback type="invalid">
                    {errors?.nombre || <FormattedMessage id="project.global.validator.required" />}
                </Form.Control.Feedback>
            </Form.Group>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="tournamentStartDate">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.startDate" defaultMessage="Fecha de inicio" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={data.fechaInicio || ''}
                            onChange={e => handleChange('fechaInicio', e.target.value)}
                            required
                            isInvalid={!!errors?.fechaInicio}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.fechaInicio || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="tournamentEndDate">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.endDate" defaultMessage="Fecha de fin" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={data.fechaFin || ''}
                            onChange={e => handleChange('fechaFin', e.target.value)}
                            required
                            isInvalid={!!errors?.fechaFin}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.fechaFin || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3" controlId="tournamentInscriptionDeadline">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.inscriptionDeadline" defaultMessage="Fecha límite de inscripción" />
                            <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={data.fechaLimiteInscripcion || ''}
                            onChange={e => handleChange('fechaLimiteInscripcion', e.target.value)}
                            required
                            isInvalid={!!errors?.fechaLimiteInscripcion}
                            className="form-control-apple"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors?.fechaLimiteInscripcion || <FormattedMessage id="project.global.validator.required" />}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default Step1BasicInfo;
