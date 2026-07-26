import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { Errors } from '../../common';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import backend from '../../../backend';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Rules from './Step3Rules';
import Step3Calendar from './Step4Calendar';
import Step4Summary from './Step5Summary';
import './CreateTournament.css';

const TOTAL_STEPS = 4;

const STEPS = [
    { key: 1, labelId: 'project.tournaments.CreateTournament.step1.short', label: 'Información Básica', icon: 'fa-solid fa-info-circle' },
    { key: 2, labelId: 'project.tournaments.CreateTournament.step3.short', label: 'Reglas', icon: 'fa-solid fa-scale-balanced' },
    { key: 3, labelId: 'project.tournaments.CreateTournament.step4.short', label: 'Calendario', icon: 'fa-regular fa-calendar' },
    { key: 4, labelId: 'project.tournaments.CreateTournament.step5.short', label: 'Resumen', icon: 'fa-regular fa-rectangle-list' },
];

const INITIAL_DATA = {
    nombre: '',
    fechaInicio: '',
    fechaLimiteInscripcion: '',
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
    diasEntreJornadas: 7,
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
                if (data.puntosVictoria === undefined || data.puntosVictoria < 0) newErrors.puntosVictoria = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.puntosEmpate === undefined || data.puntosEmpate < 0) newErrors.puntosEmpate = intl.formatMessage({ id: 'project.global.validator.required' });
                if (data.puntosDerrota === undefined || data.puntosDerrota < 0) newErrors.puntosDerrota = intl.formatMessage({ id: 'project.global.validator.required' });
                if (!data.formatoPartidos) newErrors.formatoPartidos = intl.formatMessage({ id: 'project.global.validator.required' });
                if (!data.criterioDesempate) newErrors.criterioDesempate = intl.formatMessage({ id: 'project.global.validator.required' });
                break;
            }
            case 3: {
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
            case 2: return <Step2Rules {...stepProps} />;
            case 3: return <Step3Calendar {...stepProps} />;
            case 4: return <Step4Summary data={formData} />;
            default: return null;
        }
    };

    const isLastStep = currentStep === TOTAL_STEPS;

    return (
        <div className="ct-container">
            <Container style={{ maxWidth: '1000px' }}>
                <Row className="g-5">
                    {/* Left column: Vertical step indicator */}
                    <Col md={4} className="ct-sidebar-col">
                        <div className="ct-sidebar">
                            <div className="ct-sidebar-header">
                                <span className="ct-sidebar-badge">
                                    <FormattedMessage id="project.tournaments.CreateTournament.badge" defaultMessage="Creación de torneo" />
                                </span>
                                <h3 className="ct-sidebar-title">
                                    <FormattedMessage id="project.tournaments.CreateTournament.title" defaultMessage="Nuevo torneo" />
                                </h3>
                            </div>
                            <div className="ct-steps">
                                {STEPS.map((step, index) => {
                                    const isActive = currentStep === step.key;
                                    const isCompleted = currentStep > step.key;
                                    return (
                                        <div
                                            key={step.key}
                                            className={`ct-step ${isActive ? 'ct-step--active' : ''} ${isCompleted ? 'ct-step--completed' : ''}`}
                                        >
                                            <div className="ct-step-marker">
                                                {isCompleted ? (
                                                    <i className="fa-solid fa-check" />
                                                ) : (
                                                    <i className={step.icon} />
                                                )}
                                            </div>
                                            <div className="ct-step-body">
                                                <span className="ct-step-label">
                                                    <FormattedMessage id={step.labelId} defaultMessage={step.label} />
                                                </span>
                                                <span className="ct-step-num">
                                                    <FormattedMessage
                                                        id="project.tournaments.CreateTournament.stepCount"
                                                        defaultMessage="Paso {n} de {total}"
                                                        values={{ n: step.key, total: TOTAL_STEPS }}
                                                    />
                                                </span>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div className={`ct-step-line ${isCompleted ? 'ct-step-line--completed' : ''}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Col>

                    {/* Right column: Content (card-free) */}
                    <Col md={8}>
                        <div className="ct-content">
                            <div className="ct-content-header">
                                <h2 className="ct-content-title">
                                    {STEPS.find(s => s.key === currentStep)?.label}
                                </h2>
                                <p className="ct-content-desc">
                                    {currentStep === 1 && (
                                        <FormattedMessage id="project.tournaments.CreateTournament.step1.desc" defaultMessage="Define el nombre y las fechas clave del torneo" />
                                    )}
                                    {currentStep === 2 && (
                                        <FormattedMessage id="project.tournaments.CreateTournament.step3.desc" defaultMessage="Configura el sistema de puntuación y formato de partidos" />
                                    )}
                                    {currentStep === 3 && (
                                        <FormattedMessage id="project.tournaments.CreateTournament.step4.desc" defaultMessage="Establece los días, horarios y la duración de los partidos" />
                                    )}
                                    {currentStep === 4 && (
                                        <FormattedMessage id="project.tournaments.CreateTournament.step5.desc" defaultMessage="Revisa todos los datos antes de crear el torneo" />
                                    )}
                                </p>
                            </div>

                            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                            <div className="ct-step-content">
                                {renderStep()}
                            </div>

                            <div className="ct-actions">
                                <Button
                                    variant="light"
                                    onClick={handlePrevious}
                                    className="ct-btn ct-btn--back"
                                    disabled={isSubmitting}
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                    <FormattedMessage id="project.global.buttons.back" defaultMessage="Anterior" />
                                </Button>

                                <Button
                                    onClick={handleNext}
                                    className={`ct-btn ${isLastStep ? 'ct-btn--submit' : 'ct-btn--next'}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            <FormattedMessage id="project.global.buttons.processing" defaultMessage="Procesando..." />
                                        </>
                                    ) : isLastStep ? (
                                        <>
                                            <i className="fa-solid fa-check" />
                                            <FormattedMessage id="project.tournaments.CreateTournament.create" defaultMessage="Crear torneo" />
                                        </>
                                    ) : (
                                        <>
                                            <FormattedMessage id="project.global.buttons.next" defaultMessage="Siguiente" />
                                            <i className="fa-solid fa-chevron-right" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
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
