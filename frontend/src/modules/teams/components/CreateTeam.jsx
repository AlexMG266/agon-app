import { useState, useRef } from 'react'; // Importamos useRef
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';

import { Errors } from '../../common';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import * as actions from '../actions';

const CreateTeam = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const formRef = useRef(null);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (formRef.current && formRef.current.checkValidity()) {
            setBackendErrors(null);
            setShowConfirmModal(true); // Abrimos el modal si es válido
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
                () => {
                    setIsSubmitting(false);
                    setShowConfirmModal(false);
                    navigate('/teams');
                },
                (errors) => {
                    setBackendErrors(errors);
                    setIsSubmitting(false);
                    setShowConfirmModal(false);
                }
            )
        );
    };

    return (
        <div className="profile-container">
            <Container className="mt-5 py-2" style={{ maxWidth: '1100px' }}>
                <Row className="g-5 align-items-center">

                    <Col lg={5} className="d-none d-lg-block">
                        <div className="pe-4">
                            <span
                                className="badge rounded-pill bg-light text-dark border px-3 py-1 mb-3 fw-semibold text-uppercase"
                                style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}
                            >
                                Creación de equipo
                            </span>
                            <h2 className="display-6 font-weight-bold text-dark mb-3" style={{ fontWeight: '700', letterSpacing: '-0.03em' }}>
                                Tu equipo en Agón
                            </h2>
                            <p className="text-secondary mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                                Para empezar a competir necesitas consolidar tu pareja de juego. Este proceso consta de tres pasos sencillos:
                            </p>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex gap-3 align-items-start">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: '600', fontSize: '0.9rem' }}>
                                        1
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Elige la identidad</h6>
                                        <p className="small text-muted mb-0">Define el nombre y el lema que os representará en los torneos.</p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 align-items-start">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: '600', fontSize: '0.9rem' }}>
                                        2
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Obtén tu código</h6>
                                        <p className="small text-muted mb-0">Al crear el equipo, el sistema generará un código único de invitación para tu equipo.</p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 align-items-start">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: '600', fontSize: '0.9rem' }}>
                                        3
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Suma a tu compañero</h6>
                                        <p className="small text-muted mb-0">Comparte el código con tu pareja para completar el equipo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={7} md={12}>
                        <Card className="border rounded-4 shadow-sm" style={{ borderColor: '#d2d2d7', backgroundColor: '#ffffff' }}>
                            <Card.Body className="p-4 p-md-5">
                                <h3
                                    className="pb-2 font-weight-bold text-dark mb-2"
                                    style={{ fontSize: '1.3rem', letterSpacing: '-0.02em', fontWeight: '700' }}
                                >
                                    <FormattedMessage id="project.teams.CreateTeam.title" defaultMessage="Crear un nuevo equipo" />
                                </h3>

                                <p className="text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                                    <FormattedMessage
                                        id="project.teams.CreateTeam.subtitle"
                                        defaultMessage="Comienza tu camino competitivo. Crea un equipo, obtén tu código único de invitación y recluta a tu compañero de juego."
                                    />
                                </p>

                                <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                                <Form
                                    ref={formRef}
                                    noValidate
                                    validated={formValidated}
                                    onSubmit={handleSubmit}
                                >
                                    <Form.Group className="mb-4" controlId="teamName">
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

                                    <Form.Group className="mb-4" controlId="teamDescription">
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

                                    <div className="d-flex gap-3 justify-content-end pt-3 border-top mt-4">
                                        <Button
                                            variant="light"
                                            onClick={() => navigate(-1)}
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
                                                    <span>Guardando...</span>
                                                </>
                                            ) : (
                                                <FormattedMessage id="project.teams.buttons.create" defaultMessage="Crear equipo" />
                                            )}
                                        </Button>
                                    </div>
                                </Form>
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
        </div>
    );
};

export default CreateTeam;