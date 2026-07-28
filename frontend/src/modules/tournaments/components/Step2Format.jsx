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
        // Auto-set tienePlayoff based on tournament type
        const updated = { ...data, [field]: value };
        if (field === 'tipoTorneo') {
            if (value === 'GRUPOS_PLAYOFF' || value === 'ELIMINATORIAS') {
                updated.tienePlayoff = true;
            } else {
                updated.tienePlayoff = false;
            }
        }
        onChange(updated);
    };

    const tipo = data.tipoTorneo || 'LIGA_UNICA';
    const isGroupsPlayoff = tipo === 'GRUPOS_PLAYOFF';
    const hasPlayoff = tipo === 'GRUPOS_PLAYOFF' || tipo === 'ELIMINATORIAS';

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

            {/* Groups config — only for GRUPOS_PLAYOFF */}
            {isGroupsPlayoff && (
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step2.numGroups" defaultMessage="Número de grupos" />
                            <span className="text-danger ms-1">*</span>
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
                            <span className="text-danger ms-1">*</span>
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
            )}

            {/* Playoff config — for GRUPOS_PLAYOFF and ELIMINATORIAS */}
            {hasPlayoff && (
                <>
                    <hr className="my-3" />
                    <h6 className="fw-semibold mb-2">
                        <FormattedMessage id="project.tournaments.CreateTournament.step2.playoffSection" defaultMessage="Configuración de Playoff" />
                    </h6>

                    <Form.Check
                        type="checkbox"
                        id="idaVueltaPlayoff"
                        label={<FormattedMessage id="project.tournaments.CreateTournament.step2.homeAwayPlayoff" defaultMessage="Partidos de ida y vuelta en playoffs" />}
                        checked={data.idaVueltaPlayoff || false}
                        onChange={e => handleChange('idaVueltaPlayoff', e.target.checked)}
                        className="mb-2"
                    />

                    <Form.Group className="mb-3">
                        <Form.Label className="text-secondary small fw-medium mb-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step2.playoffDistribution" defaultMessage="Distribución de playoff" />
                        </Form.Label>
                        <Form.Select
                            value={data.estrategiaPlayoff || 'RAPIDO'}
                            onChange={e => handleChange('estrategiaPlayoff', e.target.value)}
                            style={{ maxWidth: '300px' }}
                        >
                            <option value="RAPIDO">
                                <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution.fast" defaultMessage="Rápido" />
                            </option>
                            <option value="JORNADAS">
                                <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution.matchdays" defaultMessage="Jornadas" />
                            </option>
                            <option value="UNIFORME">
                                <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution.uniform" defaultMessage="Uniforme" />
                            </option>
                        </Form.Select>
                    </Form.Group>

                    {data.estrategiaPlayoff === 'JORNADAS' && (
                        <Form.Group className="mb-3" controlId="diasEntrePlayoff">
                            <Form.Label className="text-secondary small fw-medium mb-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step4.daysBetweenMatchdays" defaultMessage="Días entre rondas" />
                            </Form.Label>
                            <div className="d-flex align-items-center gap-3" style={{ maxWidth: '300px' }}>
                                <Form.Range
                                    min={1}
                                    max={14}
                                    step={1}
                                    value={data.diasEntrePlayoff ?? 7}
                                    onChange={e => handleChange('diasEntrePlayoff', parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span className="fw-semibold text-nowrap" style={{ minWidth: '60px', fontSize: '0.9rem' }}>
                                    {data.diasEntrePlayoff ?? 7} <FormattedMessage id="project.tournaments.CreateTournament.step4.days" defaultMessage="días" />
                                </span>
                            </div>
                        </Form.Group>
                    )}
                </>
            )}
        </div>
    );
};

export default Step2Format;
