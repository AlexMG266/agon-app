import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { Errors } from '../../common';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import backend from '../../../backend';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Format from './Step2Format';
import Step3Rules from './Step3Rules';
import Step4Calendar from './Step4Calendar';
import Step5Summary from './Step5Summary';
import './CreateTournament.css';

const TOTAL_STEPS = 5;

const STEP_KEYS = [
    { key: 1, labelId: 'project.tournaments.CreateTournament.step1.short', label: 'Información Básica' },
    { key: 2, labelId: 'project.tournaments.CreateTournament.step2.short', label: 'Formato' },
    { key: 3, labelId: 'project.tournaments.CreateTournament.step3.short', label: 'Reglas' },
    { key: 4, labelId: 'project.tournaments.CreateTournament.step4.short', label: 'Calendario' },
    { key: 5, labelId: 'project.tournaments.CreateTournament.step5.short', label: 'Resumen' },
];

const INITIAL_DATA = {
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    fechaLimiteInscripcion: '',
    tipoTorneo: 'LIGA_UNICA',
    numGrupos: 1,
    equiposPorGrupo: 4,
    tienePlayoff: false,
    idaVueltaPlayoff: false,
    puntosVictoria: 3,
    puntosEmpate: 1,
    puntosDerrota: 0,
    formatoPartidos: '4_SETS',
    criterioDesempate: 'PUNTOS',
    diasDisponibles: [],
    horaInicio: '16:00',
    horaFin: '22:00',
    duracionPartido: 45,
    fechasExcluidas: [],
    estrategiaDistribucion: 'JORNADAS',
};

const CreateTournament = () => {
    const navigate = useNavigate();
    const intl = useIntl();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ ...INITIAL_DATA });
    const [errors, setErrors] = useState({});
    const [backendErrors, setBackendErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const validateStep = useCallback((step, data) => {
        const newErrors = {};

        switch (step) {
            case 1: {
                if (!data.nombre?.trim()) newErrors.nombre = intl.formatMessage({ id: 'project.global.validator.required' });
                else if (data.nombre.trim().length > 100) newErrors.nombre = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.nameTooLong', defaultMessage: 'El nombre no puede superar los 100 caracteres' });

                if (!data.fechaInicio) newErrors.fechaInicio = intl.formatMessage({ id: 'project.global.validator.required' });
                else if (data.fechaInicio < todayStr) newErrors.fechaInicio = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.startInPast', defaultMessage: 'La fecha de inicio no puede ser en el pasado' });

                if (!data.fechaFin) newErrors.fechaFin = intl.formatMessage({ id: 'project.global.validator.required' });

                if (!data.fechaLimiteInscripcion) newErrors.fechaLimiteInscripcion = intl.formatMessage({ id: 'project.global.validator.required' });
                else if (data.fechaLimiteInscripcion < todayStr) newErrors.fechaLimiteInscripcion = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.inscriptionInPast', defaultMessage: 'La fecha límite de inscripción no puede ser en el pasado' });

                if (data.fechaInicio && data.fechaFin && data.fechaInicio > data.fechaFin) {
                    newErrors.fechaFin = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.endBeforeStart', defaultMessage: 'La fecha de fin debe ser posterior a la fecha de inicio' });
                }
                if (data.fechaLimiteInscripcion && data.fechaInicio && data.fechaLimiteInscripcion > data.fechaInicio) {
                    newErrors.fechaLimiteInscripcion = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.inscriptionAfterStart', defaultMessage: 'La fecha límite de inscripción debe ser anterior a la fecha de inicio' });
                }
                if (data.fechaLimiteInscripcion && data.fechaFin && data.fechaLimiteInscripcion > data.fechaFin) {
                    newErrors.fechaLimiteInscripcion = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.inscriptionAfterEnd', defaultMessage: 'La fecha límite de inscripción debe ser anterior a la fecha de fin' });
                }
                break;
            }
            case 2: {
                if (!data.tipoTorneo) newErrors.tipoTorneo = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.tipoTorneo !== 'ELIMINATORIAS') {
                    if (!data.numGrupos || data.numGrupos < 1) newErrors.numGrupos = intl.formatMessage({ id: 'project.global.validator.required' });
                    else if (data.numGrupos > 32) newErrors.numGrupos = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.numGroupsTooHigh', defaultMessage: 'Máximo 32 grupos' });
                    if (!data.equiposPorGrupo || data.equiposPorGrupo < 2) newErrors.equiposPorGrupo = intl.formatMessage({ id: 'project.global.validator.required' });
                    else if (data.equiposPorGrupo > 32) newErrors.equiposPorGrupo = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.teamsPerGroupTooHigh', defaultMessage: 'Máximo 32 equipos por grupo' });
                }
                break;
            }
            case 3: {
                if (data.puntosVictoria === undefined || data.puntosVictoria < 0) newErrors.puntosVictoria = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.puntosEmpate === undefined || data.puntosEmpate < 0) newErrors.puntosEmpate = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.puntosDerrota === undefined || data.puntosDerrota < 0) newErrors.puntosDerrota = intl.formatMessage({ id: 'project.global.validator.required' });
                if (!data.formatoPartidos) newErrors.formatoPartidos = intl.formatMessage({ id: 'project.global.validator.required' });
                if (!data.criterioDesempate) newErrors.criterioDesempate = intl.formatMessage({ id: 'project.global.validator.required' });
                break;
            }
            case 4: {
                if (!data.diasDisponibles || data.diasDisponibles.length === 0) {
                    newErrors.diasDisponibles = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.atLeastOneDay', defaultMessage: 'Selecciona al menos un día disponible' });
                }
                if (!data.horaInicio) newErrors.horaInicio = intl.formatMessage({ id: 'project.global.validator.required' });
                if (!data.horaFin) newErrors.horaFin = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.horaInicio && data.horaFin && data.horaInicio >= data.horaFin) {
                    newErrors.horaFin = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.endTimeBeforeStart', defaultMessage: 'La hora de fin debe ser posterior a la hora de inicio' });
                }
                if (!data.duracionPartido || data.duracionPartido < 15) newErrors.duracionPartido = intl.formatMessage({ id: 'project.global.validator.required' });
                else if (data.duracionPartido > 120) newErrors.duracionPartido = intl.formatMessage({ id: 'project.tournaments.CreateTournament.error.durationTooLong', defaultMessage: 'La duración máxima es de 120 minutos' });
                if (!data.estrategiaDistribucion) newErrors.estrategiaDistribucion = intl.formatMessage({ id: 'project.global.validator.required' });
                break;
            }
        }

        return newErrors;
    }, [intl, todayStr]);

    const handleStepChange = useCallback((newData) => {
        setFormData(newData);
        setErrors({});
    }, []);

    const handleNext = useCallback(() => {
        const stepErrors = validateStep(currentStep, formData);
        setErrors(stepErrors);

        if (Object.keys(stepErrors).length === 0) {
            if (currentStep === TOTAL_STEPS) {
                setShowConfirmModal(true);
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    }, [currentStep, formData, validateStep]);

    const handlePrevious = useCallback(() => {
        setErrors({});
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigate(-1);
        }
    }, [currentStep, navigate]);

    const handleConfirmCreate = useCallback(async () => {
        setIsSubmitting(true);
        setBackendErrors(null);

        try {
            const response = await backend.tournamentService.createTournament(formData);
            if (response.ok) {
                setIsSubmitting(false);
                setShowConfirmModal(false);
                const tournamentId = response.payload?.id;
                if (tournamentId) {
                    navigate(`/tournaments/view/${tournamentId}`);
                } else {
                    navigate('/');
                }
            } else {
                const errorData = response.payload;
                if (errorData?.globalErrors) {
                    setBackendErrors(errorData.globalErrors);
                } else if (errorData?.fieldErrors) {
                    setErrors(errorData.fieldErrors);
                } else {
                    setBackendErrors(intl.formatMessage({ id: 'project.global.exceptions.NetworkError' }));
                }
                setIsSubmitting(false);
                setShowConfirmModal(false);
            }
        } catch {
            setBackendErrors(intl.formatMessage({ id: 'project.global.exceptions.NetworkError' }));
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    }, [formData, navigate, intl]);

    const renderStep = () => {
        const stepProps = { data: formData, onChange: handleStepChange, errors };

        switch (currentStep) {
            case 1: return <Step1BasicInfo {...stepProps} />;
            case 2: return <Step2Format {...stepProps} />;
            case 3: return <Step3Rules {...stepProps} />;
            case 4: return <Step4Calendar {...stepProps} />;
            case 5: return <Step5Summary data={formData} />;
            default: return null;
        }
    };

    const isLastStep = currentStep === TOTAL_STEPS;

    return (
        <div className="profile-container">
            <Container className="mt-5 py-2" style={{ maxWidth: '900px' }}>
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Card className="border rounded-4 shadow-sm" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <span
                                        className="badge rounded-pill bg-light text-dark border px-3 py-1 mb-3 fw-semibold text-uppercase"
                                        style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}
                                    >
                                        <FormattedMessage
                                            id="project.tournaments.CreateTournament.badge"
                                            defaultMessage="Creación de torneo"
                                        />
                                    </span>
                                    <h3
                                        className="font-weight-bold text-dark mb-1"
                                        style={{ fontSize: '1.4rem', letterSpacing: '-0.02em', fontWeight: '700' }}
                                    >
                                        <FormattedMessage
                                            id="project.tournaments.CreateTournament.title"
                                            defaultMessage="Crear un nuevo torneo"
                                        />
                                    </h3>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
                                        <FormattedMessage
                                            id="project.tournaments.CreateTournament.subtitle"
                                            defaultMessage="Configura todos los aspectos de tu competición en unos pocos pasos."
                                        />
                                    </p>
                                </div>

                                {/* Step Indicator */}
                                <div className="step-indicator-container">
                                    {STEP_KEYS.map((step, index) => (
                                        <div key={step.key} className="step-indicator">
                                            <div
                                                className={`step-indicator__circle ${currentStep === step.key ? 'active' : ''} ${currentStep > step.key ? 'completed' : ''}`}
                                            >
                                                {currentStep > step.key ? (
                                                    <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i>
                                                ) : (
                                                    step.key
                                                )}
                                            </div>
                                            <span
                                                className={`step-indicator__label ${currentStep === step.key ? 'active' : ''} ${currentStep > step.key ? 'completed' : ''}`}
                                            >
                                                <FormattedMessage id={step.labelId} defaultMessage={step.label} />
                                            </span>
                                            {index < STEP_KEYS.length - 1 && (
                                                <div className={`step-indicator__connector ${currentStep > step.key ? 'completed' : ''}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                                <div className="wizard-step-content">
                                    {renderStep()}
                                </div>

                                <div className="d-flex gap-3 justify-content-between pt-4 border-top mt-4">
                                    <Button
                                        variant="light"
                                        onClick={handlePrevious}
                                        className="rounded-pill border px-4 text-dark bg-white py-2"
                                        style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                        disabled={isSubmitting}
                                    >
                                        <i className="fa-solid fa-chevron-left me-2" style={{ fontSize: '0.75rem' }}></i>
                                        <FormattedMessage id="project.global.buttons.back" defaultMessage="Anterior" />
                                    </Button>

                                    <Button
                                        onClick={handleNext}
                                        className={`rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 ${isLastStep ? 'btn-success' : 'btn-apple-dark'}`}
                                        style={{ minWidth: '140px', fontWeight: '500' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                <span><FormattedMessage id="project.global.buttons.processing" defaultMessage="Procesando..." /></span>
                                            </>
                                        ) : isLastStep ? (
                                            <>
                                                <i className="fa-solid fa-check me-1"></i>
                                                <FormattedMessage id="project.tournaments.CreateTournament.create" defaultMessage="Crear torneo" />
                                            </>
                                        ) : (
                                            <>
                                                <FormattedMessage id="project.global.buttons.next" defaultMessage="Siguiente" />
                                                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.75rem' }}></i>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => !isSubmitting && setShowConfirmModal(false)}
                onConfirm={handleConfirmCreate}
                title={
                    <FormattedMessage
                        id="project.tournaments.CreateTournament.confirm.title"
                        defaultMessage="¿Confirmar creación del torneo?"
                    />
                }
                description={
                    <FormattedMessage
                        id="project.tournaments.CreateTournament.confirm.description"
                        defaultMessage="Revisa todos los datos antes de crear el torneo. Una vez creado, podrás gestionar las inscripciones y el calendario."
                    />
                }
                confirmText={
                    <FormattedMessage
                        id="project.tournaments.CreateTournament.confirm.button"
                        defaultMessage="Crear Torneo"
                    />
                }
                isSubmitting={isSubmitting}
                variant="success"
            />
        </div>
    );
};

export default CreateTournament;
