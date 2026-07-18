import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, Link } from 'react-router';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";

import { Errors } from '../../common';
import * as actions from '../actions';
import backend from '../../../backend';

const SignUp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const intl = useIntl();
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    const formRef = useRef(null);

    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async event => {
        event.preventDefault();
        const form = formRef.current;

        if (form && form.checkValidity() && checkConfirmPassword()) {
            setIsSubmitting(true);
            setBackendErrors(null);

            const user = {
                nombre: nombre.trim(),
                password: password,
                email: email.trim(),
                fechaNacimiento: fechaNacimiento || null
            };

            try {
                const response = await backend.userService.signUp(user, () => {
                    navigate('/users/login');
                    dispatch(actions.logout());
                });

                if (response.ok) {
                    dispatch(actions.signUpCompleted(response.payload));
                    navigate('/');
                } else {
                    setBackendErrors(response.payload);
                    setIsSubmitting(false);
                }
            } catch {
                setBackendErrors({ globalError: intl.formatMessage({ id: 'project.users.SignUp.error.connection', defaultMessage: 'Error de conexión con el servidor' }) });
                setIsSubmitting(false);
            }
        } else {
            setBackendErrors(null);
            setFormValidated(true);
        }
    };

    const checkConfirmPassword = () => {
        if (password !== confirmPassword) {
            setPasswordsDoNotMatch(true);
            return false;
        } else {
            return true;
        }
    };

    const handleConfirmPasswordChange = value => {
        setConfirmPassword(value);
        setPasswordsDoNotMatch(false);
    };

    const getNombreErrorMessage = () => {
        if (!nombre) return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.required', defaultMessage: 'El nombre es obligatorio.' });
        if (nombre.length < 3) return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.minLength', defaultMessage: 'El nombre debe tener al menos 3 caracteres.' });
        if (nombre.length > 15) return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.maxLength', defaultMessage: 'El nombre no puede superar los 15 caracteres.' });
        if (/^\d/.test(nombre)) return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.startsWithNumber', defaultMessage: 'El nombre no puede empezar con un número.' });
        if (/^\d+$/.test(nombre)) return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.onlyNumbers', defaultMessage: 'El nombre no puede estar compuesto solo por números.' });
        return intl.formatMessage({ id: 'project.users.SignUp.error.nombre.invalid', defaultMessage: 'Formato de nombre inválido.' });
    };

    const getPasswordErrorMessage = () => {
        if (!password) return intl.formatMessage({ id: 'project.users.SignUp.error.password.required', defaultMessage: 'La contraseña es obligatoria.' });
        if (password.length < 8) return intl.formatMessage({ id: 'project.users.SignUp.error.password.minLength', defaultMessage: 'Debe tener al menos 8 caracteres.' });
        if (!/[A-Z]/.test(password)) return intl.formatMessage({ id: 'project.users.SignUp.error.password.uppercase', defaultMessage: 'Debe incluir al menos una mayúscula.' });
        if (!/[a-z]/.test(password)) return intl.formatMessage({ id: 'project.users.SignUp.error.password.lowercase', defaultMessage: 'Debe incluir al menos una minúscula.' });
        if (!/\d/.test(password)) return intl.formatMessage({ id: 'project.users.SignUp.error.password.number', defaultMessage: 'Debe incluir al menos un número.' });
        if (!/[@$!%*?&._\-+={\[\]}()^~\/]/.test(password)) return intl.formatMessage({ id: 'project.users.SignUp.error.password.symbol', defaultMessage: 'Debe incluir al menos un símbolo (ej. @, $, !, %).' });
        return intl.formatMessage({ id: 'project.users.SignUp.error.password.invalid', defaultMessage: 'Formato de contraseña inválido.' });
    };

    return (
        <Container fluid className="p-0 w-100 position-absolute start-0 end-0 bottom-0 fade-in-page"
                   style={{
                       fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                       backgroundColor: '#ffffff',
                       top: '0',
                       overflow: 'hidden'
                   }}>
            <Row className="g-0 h-100 align-items-stretch">

                {/* COLUMNA IZQUIERDA: Panel de Características Centrado */}
                <Col lg={6} className="d-none d-lg-flex flex-column justify-content-between p-5"
                     style={{ backgroundColor: '#f5f5f7', borderRight: '1px solid #e2e2e7' }}>

                    <div></div>

                    <div className="w-100 my-auto mx-auto d-flex flex-column align-items-center justify-content-center px-4" style={{ maxWidth: '540px' }}>
                        <div className="w-100 text-start">
                            <h1 className="fw-bold text-dark mb-4" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: '1.15', fontWeight: '700' }}>
                                <FormattedMessage id="project.users.Login.hero.title" defaultMessage="Organiza, inscríbete{br}y domina la mesa." values={{ br: <br /> }} />
                            </h1>
                            <p className="text-secondary mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.5', color: '#86868b' }}>
                                <FormattedMessage id="project.users.Login.hero.description" defaultMessage="La plataforma definitiva para la gestión de tus partidas de futbolín. Toma el control de la competición con herramientas diseñadas para llevar tu comunidad al siguiente nivel." />
                            </p>
                        </div>

                        <Row className="g-3 mt-2 w-100">
                            <Col sm={6}>
                                <div className="bg-white p-3 h-100 rounded-4 border border-light shadow-sm">
                                    <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center mb-2" style={{ width: '36px', height: '36px' }}>
                                        <i className="fa-solid fa-trophy" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <div className="text-dark small fw-bold mb-1"><FormattedMessage id="project.users.Login.hero.feature1.title" defaultMessage="Gestión de Torneos" /></div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}><FormattedMessage id="project.users.Login.hero.feature1.desc" defaultMessage="Crea formatos competitivos a tu medida fácilmente." /></div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div className="bg-white p-3 h-100 rounded-4 border border-light shadow-sm">
                                    <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center mb-2" style={{ width: '36px', height: '36px' }}>
                                        <i className="fa-solid fa-file-signature" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <div className="text-dark small fw-bold mb-1"><FormattedMessage id="project.users.Login.hero.feature2.title" defaultMessage="Inscripción Inmediata" /></div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}><FormattedMessage id="project.users.Login.hero.feature2.desc" defaultMessage="Explora las mesas activas y asegura tu plaza con un clic." /></div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div className="bg-white p-3 h-100 rounded-4 border border-light shadow-sm">
                                    <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center mb-2" style={{ width: '36px', height: '36px' }}>
                                        <i className="fa-solid fa-chart-simple" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <div className="text-dark small fw-bold mb-1"><FormattedMessage id="project.users.Login.hero.feature3.title" defaultMessage="Sistema ELO Nativo" /></div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}><FormattedMessage id="project.users.Login.hero.feature3.desc" defaultMessage="Cálculo preciso de tu nivel tras cada enfrentamiento." /></div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div className="bg-white p-3 h-100 rounded-4 border border-light shadow-sm">
                                    <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center mb-2" style={{ width: '36px', height: '36px' }}>
                                        <i className="fa-solid fa-users" style={{ fontSize: '0.9rem' }}></i>
                                    </div>
                                    <div className="text-dark small fw-bold mb-1"><FormattedMessage id="project.users.Login.hero.feature4.title" defaultMessage="Perfil de Jugador" /></div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}><FormattedMessage id="project.users.Login.hero.feature4.desc" defaultMessage="Historial centralizado con todas tus estadísticas." /></div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="text-muted small w-100 text-start" style={{ fontSize: '0.75rem' }}>
                        <FormattedMessage id="project.users.Login.footer" defaultMessage="© {year} Agón Arena." values={{ year: new Date().getFullYear() }} />
                    </div>
                </Col>

                {/* COLUMNA DERECHA: Formulario de Registro */}
                <Col lg={6} className="d-flex align-items-center justify-content-center p-4 bg-white" style={{ overflowY: 'auto' }}>
                    <div className="w-100 my-auto" style={{ maxWidth: '380px' }}>

                        <div className="mb-4 text-start">
                            <h2 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.03em', fontSize: '1.75rem', fontWeight: '700' }}>
                                <FormattedMessage id="project.users.SignUp.title" defaultMessage="Crea una cuenta" />
                            </h2>
                            <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', color: '#86868b' }}>
                                <FormattedMessage id="project.users.SignUp.subtitle" defaultMessage="Completa el formulario para registrarte en Agón." />
                            </p>
                        </div>

                        <div className="mb-3">
                            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
                        </div>

                        <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmit}>

                            <FloatingLabel controlId="nombre" label={<FormattedMessage id="project.global.fields.firstName" />} className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    disabled={isSubmitting}
                                    autoFocus
                                    autoComplete="username"
                                    className="bg-white border rounded-3 shadow-none custom-input"
                                    style={{ fontSize: '0.92rem', borderColor: '#d2d2d7', height: '50px', color: '#1d1d1f' }}
                                    required
                                    minLength={3}
                                    maxLength={15}
                                    pattern="^(?![0-9])(?![0-9]+$)[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+(?: [a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$"
                                />
                                <Form.Control.Feedback type="invalid" className="small mt-1 text-danger" style={{ fontSize: '0.75rem' }}>
                                    {getNombreErrorMessage()}
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel controlId="email" label={<FormattedMessage id="project.global.fields.email" />} className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-white border rounded-3 shadow-none custom-input"
                                    style={{ fontSize: '0.92rem', borderColor: '#d2d2d7', height: '50px', color: '#1d1d1f' }}
                                    required
                                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                />
                                <Form.Control.Feedback type="invalid" className="small mt-1 text-danger" style={{ fontSize: '0.75rem' }}>
                                    {!email ? intl.formatMessage({ id: 'project.users.SignUp.error.email.required', defaultMessage: 'El correo electrónico es obligatorio.' }) : intl.formatMessage({ id: 'project.users.SignUp.error.email.invalid', defaultMessage: 'Introduce una dirección de correo válida (ejemplo@dominio.com).' })}
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel controlId="fechaNacimiento" label={<FormattedMessage id="project.global.fields.fechaNacimiento" defaultMessage="Fecha de Nacimiento" />} className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                <Form.Control
                                    type="date"
                                    placeholder="Fecha de Nacimiento"
                                    value={fechaNacimiento}
                                    onChange={e => setFechaNacimiento(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-white border rounded-3 shadow-none custom-input"
                                    style={{ fontSize: '0.92rem', borderColor: '#d2d2d7', height: '50px', color: '#1d1d1f' }}
                                    required
                                    max={today}
                                />
                                <Form.Control.Feedback type="invalid" className="small mt-1 text-danger" style={{ fontSize: '0.75rem' }}>
                                    {!fechaNacimiento ? intl.formatMessage({ id: 'project.users.SignUp.error.fechaNacimiento.required', defaultMessage: 'La fecha de nacimiento es obligatoria.' }) : intl.formatMessage({ id: 'project.users.SignUp.error.fechaNacimiento.future', defaultMessage: 'La fecha de nacimiento no puede ser una fecha futura.' })}
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel controlId="password" label={<FormattedMessage id="project.global.fields.password" />} className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                <Form.Control
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    className="bg-white border rounded-3 shadow-none custom-input"
                                    style={{ fontSize: '0.92rem', borderColor: '#d2d2d7', height: '50px', color: '#1d1d1f' }}
                                    required
                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-\#\+\=\[\]\{\}\(\)\^\~\/])[A-Za-z\d@$!%*?&._\-\#\+\=\[\]\{\}\(\)\^\~\/]{8,}$"
                                />
                                <Form.Control.Feedback type="invalid" className="small mt-1 text-danger" style={{ fontSize: '0.75rem' }}>
                                    {getPasswordErrorMessage()}
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel controlId="confirmPassword" label={<FormattedMessage id="project.users.SignUp.fields.confirmPassword" />} className="mb-4 text-muted" style={{ fontSize: '0.85rem' }}>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirmar Contraseña"
                                    value={confirmPassword}
                                    onChange={e => handleConfirmPasswordChange(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    isInvalid={passwordsDoNotMatch}
                                    className="bg-white border rounded-3 shadow-none custom-input"
                                    style={{ fontSize: '0.92rem', borderColor: '#d2d2d7', height: '50px', color: '#1d1d1f' }}
                                    required
                                />
                                <Form.Control.Feedback type="invalid" className="small mt-1 text-danger" style={{ fontSize: '0.75rem' }}>
                                    {passwordsDoNotMatch ?
                                        <FormattedMessage id='project.global.validator.passwordsDoNotMatch' /> :
                                        <FormattedMessage id='project.global.validator.required' />}
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <Button
                                type="submit"
                                className="w-100 btn-primary rounded-pill fw-medium d-flex align-items-center justify-content-center"
                                disabled={isSubmitting}
                                style={{ fontSize: '0.92rem', height: '44px', transition: 'background-color 0.2s ease' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        <FormattedMessage id="project.global.buttons.processing" defaultMessage="Procesando..." />
                                    </>
                                ) : (
                                    <FormattedMessage id="project.users.SignUp.title" defaultMessage="Registrarse" />
                                )}
                            </Button>
                        </Form>

                        <p className="mt-4 small text-secondary text-center" style={{ fontSize: '0.82rem', color: '#86868b' }}>
                            <FormattedMessage id="project.users.SignUp.hasAccount" defaultMessage="¿Ya tienes una cuenta?" />{' '}
                            <Link to="/users/login" className="text-decoration-none fw-semibold ms-1" style={{ color: '#0066cc' }}>
                                <FormattedMessage id="project.users.Login.title" defaultMessage="Identifícate" />
                            </Link>
                        </p>
                    </div>
                </Col>
            </Row>

            <style>{`
                .fade-in-page {
                    animation: fadeInPage 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                @keyframes fadeInPage {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .custom-input {
                    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
                }
                .custom-input:focus {
                    border-color: #86868b !important;
                    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04) !important;
                }
                .form-floating > .form-control:focus ~ label::after {
                    background-color: transparent !important;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px white inset !important;
                    -webkit-text-fill-color: #1d1d1f !important;
                }
            `}</style>
        </Container>
    );
};

export default SignUp;