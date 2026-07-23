import { FormattedMessage } from 'react-intl';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const TORNEO_TIPOS = [
    { value: 'LIGA_UNICA', labelId: 'project.tournaments.CreateTournament.step2.type.league', label: 'Liga única' },
    { value: 'GRUPOS_PLAYOFF', labelId: 'project.tournaments.CreateTournament.step2.type.groupsPlayoff', label: 'Grupos + Playoff' },
    { value: 'ELIMINATORIAS', labelId: 'project.tournaments.CreateTournament.step2.type.knockout', label: 'Eliminatorias directas' },
];

const GRUPO_OPTIONS = [1, 2, 4, 8];
const EQUIPOS_POR_GRUPO_OPTIONS = [4, 5, 6, 8];

const Step2Format = ({ data, onChange, errors }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const tipo = data.tipoTorneo || 'LIGA_UNICA';
    const isGroupsPlayoff = tipo === 'GRUPOS_PLAYOFF';
    const showGroupConfig = tipo === 'LIGA_UNICA' || tipo === 'GRUPOS_PLAYOFF';

    return (
        <div>
            <h5 className="fw-bold mb-1">
                <FormattedMessage id="project.tournaments.CreateTournament.step2.title" defaultMessage="Formato de la Competición" />
            </h5>
            <p className="text-muted small mb-4">
                <FormattedMessage id="project.tournaments.CreateTournament.step2.subtitle" defaultMessage="Elige el tipo de torneo y configura la estructura de grupos." />
            </p>

            <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-medium mb-2">
                    <FormattedMessage id="project.tournaments.CreateTournament.step2.type" defaultMessage="Tipo de torneo" />
                    <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="d-flex flex-column gap-2">
                    {TORNEO_TIPOS.map(tipoOpt => (
                        <Form.Check
                            key={tipoOpt.value}
                            type="radio"
                            id={`tipo-${tipoOpt.value}`}
                            name="tipoTorneo"
                            label={<FormattedMessage id={tipoOpt.labelId} defaultMessage={tipoOpt.label} />}
                            value={tipoOpt.value}
                            checked={data.tipoTorneo === tipoOpt.value}
                            onChange={e => handleChange('tipoTorneo', e.target.value)}
                            isInvalid={!!errors?.tipoTorneo}
                        />
                    ))}
                    {errors?.tipoTorneo && (
                        <div className="text-danger small">{errors.tipoTorneo}</div>
                    )}
                </div>
            </Form.Group>

            {showGroupConfig && (
                <>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Label className="text-secondary small fw-medium mb-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step2.numGroups" defaultMessage="Número de grupos" />
                                {isGroupsPlayoff && <span className="text-danger ms-1">*</span>}
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {GRUPO_OPTIONS.map(n => (
                                    <Button
                                        key={n}
                                        variant={data.numGrupos === n ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        className="rounded-pill px-3"
                                        onClick={() => handleChange('numGrupos', n)}
                                    >
                                        {n}
                                    </Button>
                                ))}
                            </div>
                            {errors?.numGrupos && (
                                <div className="text-danger small mt-1">{errors.numGrupos}</div>
                            )}
                        </Col>
                        <Col md={6}>
                            <Form.Label className="text-secondary small fw-medium mb-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step2.teamsPerGroup" defaultMessage="Equipos por grupo" />
                                {isGroupsPlayoff && <span className="text-danger ms-1">*</span>}
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {EQUIPOS_POR_GRUPO_OPTIONS.map(n => (
                                    <Button
                                        key={n}
                                        variant={data.equiposPorGrupo === n ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        className="rounded-pill px-3"
                                        onClick={() => handleChange('equiposPorGrupo', n)}
                                    >
                                        {n}
                                    </Button>
                                ))}
                            </div>
                            {errors?.equiposPorGrupo && (
                                <div className="text-danger small mt-1">{errors.equiposPorGrupo}</div>
                            )}
                        </Col>
                    </Row>

                    {isGroupsPlayoff && (
                        <>
                            <Form.Check
                                type="checkbox"
                                id="tienePlayoff"
                                label={<FormattedMessage id="project.tournaments.CreateTournament.step2.playoffAfterGroups" defaultMessage="Playoff después de fase de grupos" />}
                                checked={data.tienePlayoff || false}
                                onChange={e => handleChange('tienePlayoff', e.target.checked)}
                                className="mb-2"
                            />
                            {data.tienePlayoff && (
                                <Form.Check
                                    type="checkbox"
                                    id="idaVueltaPlayoff"
                                    label={<FormattedMessage id="project.tournaments.CreateTournament.step2.homeAwayPlayoff" defaultMessage="Partidos de ida y vuelta en playoffs" />}
                                    checked={data.idaVueltaPlayoff || false}
                                    onChange={e => handleChange('idaVueltaPlayoff', e.target.checked)}
                                    className="mb-3 ms-4"
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Step2Format;
