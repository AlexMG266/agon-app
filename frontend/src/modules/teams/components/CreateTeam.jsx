import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { Errors } from '../../common';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import * as actions from '../actions';
import './CreateTeam.css';

const CreateTeamModal = ({ show, onHide, onCreated }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const formRef = useRef(null);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [createdTeam, setCreatedTeam] = useState(null);

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setFormValidated(false);
        setBackendErrors(null);
        setIsSubmitting(false);
        setShowConfirmModal(false);
        setCreatedTeam(null);
    };

    const handleHide = () => {
        if (!isSubmitting) {
            resetForm();
            onHide();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (formRef.current && formRef.current.checkValidity()) {
            setBackendErrors(null);
            setShowConfirmModal(true);
        } else {
            setBackendErrors(null);
            setFormValidated(true);
        }
    };

    const handleConfirmCreate = () => {
        setIsSubmitting(true);
        dispatch(
            actions.createTeam(
                nombre.trim(),
                descripcion.trim(),
                (team) => {
                    setIsSubmitting(false);
                    setShowConfirmModal(false);
                    setCreatedTeam(team);
                    if (onCreated) {
                        onCreated(team);
                    }
                },
                (errors) => {
                    setBackendErrors(errors);
                    setIsSubmitting(false);
                    setShowConfirmModal(false);
                }
            )
        );
    };

    const handleViewTeam = () => {
        if (createdTeam) {
            resetForm();
            onHide();
            navigate(`/teams/view/${createdTeam.id}`);
        }
    };

    const codigoEquipo =
        createdTeam?.codigoEquipo || createdTeam?.codigoInvitacion || createdTeam?.codigo;

    return (
        <>
            <Modal
                show={show}
                onHide={handleHide}
                centered
                size="md"
                backdrop="static"
                backdropClassName="ct-modal-backdrop"
                dialogClassName="ct-modal-dialog"
                contentClassName="ct-modal-content"
            >
                <Modal.Header closeButton onHide={handleHide} className="ct-modal-header">
                    <Modal.Title as="h6" className="fw-bold">
                        <span className="ct-modal-title-icon">
                            <i className="fa-solid fa-shield-halved"></i>
                        </span>
                        <FormattedMessage id="project.teams.CreateTeam.title" defaultMessage="Crear un nuevo equipo" />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="ct-modal-body">
                    {createdTeam ? (
                        <div className="ct-success">
                            <div className="ct-success-icon">
                                <i className="fa-regular fa-circle-check"></i>
                            </div>
                            <div className="ct-success-text">
                                <FormattedMessage id="project.teams.CreateTeam.success.title" defaultMessage="¡Equipo creado con éxito!" />
                            </div>
                            <div className="ct-success-desc">
                                <FormattedMessage id="project.teams.CreateTeam.success.description" defaultMessage="Tu equipo está listo para competir. Comparte este código con tu compañero para que se una:" />
                            </div>
                            {codigoEquipo && (
                                <div className="ct-success-code">
                                    <span className="ct-success-code-label">
                                        <FormattedMessage id="project.teams.CreateTeam.success.codeLabel" defaultMessage="Código de invitación" />
                                    </span>
                                    <code>{codigoEquipo}</code>
                                </div>
                            )}
                            <div className="ct-success-actions">
                                <Button
                                    variant="light"
                                    className="ct-success-btn ct-success-btn-close"
                                    onClick={handleHide}
                                >
                                    <FormattedMessage id="project.global.buttons.close" defaultMessage="Cerrar" />
                                </Button>
                                <Button
                                    variant="dark"
                                    className="ct-success-btn ct-success-btn-view"
                                    onClick={handleViewTeam}
                                >
                                    <i className="fa-solid fa-shield-halved me-2"></i>
                                    <FormattedMessage id="project.teams.CreateTeam.success.view" defaultMessage="Ver equipo" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted small mb-3">
                                <FormattedMessage id="project.teams.CreateTeam.subtitle" defaultMessage="Comienza tu camino competitivo. Crea un equipo, obtén tu código único de invitación y recluta a tu compañero de juego." />
                            </p>

                            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                            <Form
                                ref={formRef}
                                noValidate
                                validated={formValidated}
                                onSubmit={handleSubmit}
                            >
                                <Form.Group className="mb-3" controlId="teamName">
                                    <Form.Label className="text-secondary small fw-medium mb-2">
                                        <FormattedMessage id="project.teams.fields.name" defaultMessage="Nombre del Equipo" />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        required
                                        maxLength={30}
                                        placeholder="Ej. Los Reyes de la Mesa"
                                        className="form-control-apple"
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid" className="small">
                                        <FormattedMessage id='project.global.validator.required' defaultMessage="Este campo es obligatorio." />
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="teamDescription">
                                    <Form.Label className="text-secondary small fw-medium mb-2">
                                        <FormattedMessage id="project.teams.fields.description" defaultMessage="Descripción o Lema" />
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value)}
                                        required
                                        maxLength={150}
                                        placeholder="Escribe una breve presentación del equipo..."
                                        className="form-control-apple"
                                        style={{ resize: 'none' }}
                                        disabled={isSubmitting}
                                    />
                                    <Form.Control.Feedback type="invalid" className="small">
                                        <FormattedMessage id='project.global.validator.required' defaultMessage="Este campo es obligatorio." />
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-flex gap-3 justify-content-end pt-3 border-top mt-3">
                                    <Button
                                        variant="light"
                                        onClick={handleHide}
                                        className="rounded-pill border px-4 text-dark bg-white py-2"
                                        style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                        disabled={isSubmitting}
                                    >
                                        <FormattedMessage id="project.global.buttons.cancel" defaultMessage="Cancelar" />
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="btn-apple-dark rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                                        style={{ minWidth: '140px', fontWeight: '500' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                <span><FormattedMessage id="project.teams.CreateTeam.saving" defaultMessage="Guardando..." /></span>
                                            </>
                                        ) : (
                                            <FormattedMessage id="project.teams.buttons.create" defaultMessage="Crear equipo" />
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => !isSubmitting && setShowConfirmModal(false)}
                onConfirm={handleConfirmCreate}
                title={
                    <FormattedMessage
                        id="project.teams.CreateTeam.confirm.title"
                        defaultMessage="¿Confirmar creación de equipo?"
                    />
                }
                description={
                    <FormattedMessage
                        id="project.teams.CreateTeam.confirm.description"
                        defaultMessage="Estás a punto de fundar tu equipo en Agón. Asegúrate de que el nombre y el lema representen vuestro legado antes de continuar."
                    />
                }
                confirmText={
                    <FormattedMessage
                        id="project.teams.CreateTeam.confirm.button"
                        defaultMessage="Crear Equipo"
                    />
                }
                isSubmitting={isSubmitting}
                variant="primary"
            />
        </>
    );
};

export default CreateTeamModal;
