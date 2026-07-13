import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { Errors } from '../../common';
import * as actions from '../actions';
import * as selectors from '../selectors';
import backend from '../../../backend';
import './Profile.css';

const Profile = () => {

    const user = useSelector(selectors.getUser);
    const dispatch = useDispatch();

    // Profile info state
    const [profileImage, setProfileImage] = useState(user.imagenPerfil || '');
    const [email, setEmail] = useState(user.email || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(user.fechaNacimiento || '');
    const [profileFormValidated, setProfileFormValidated] = useState(false);
    const [profileBackendErrors, setProfileBackendErrors] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(false);

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordFormValidated, setPasswordFormValidated] = useState(false);
    const [passwordBackendErrors, setPasswordBackendErrors] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);

    const [activeTab, setActiveTab] = useState('profile');

    let profileForm;
    let passwordForm;

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfileImage = () => {
        setProfileImage('');
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        if (profileForm.checkValidity()) {
            const updatedUser = {
                id: user.id,
                nombre: user.nombre,
                email: email.trim(),
                imagenPerfil: profileImage || null,
                fechaNacimiento: fechaNacimiento
            };

            const response = await backend.userService.updateProfile(updatedUser);

            if (response.ok) {
                dispatch(actions.updateProfileCompleted(response.payload));
                setProfileSuccess(true);
                setTimeout(() => setProfileSuccess(false), 3000);
                setProfileBackendErrors(null);
            } else {
                setProfileBackendErrors(response.payload);
                setProfileSuccess(false);
            }
        } else {
            setProfileBackendErrors(null);
            setProfileFormValidated(true);
        }
    };

    const checkConfirmNewPassword = () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordsDoNotMatch(true);
            return false;
        } else {
            return true;
        }
    };

    const handleConfirmNewPasswordChange = (value) => {
        setConfirmNewPassword(value);
        setPasswordsDoNotMatch(false);
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (passwordForm.checkValidity() && checkConfirmNewPassword()) {
            const response = await backend.userService.changePassword(user.id, oldPassword, newPassword);

            if (response.ok) {
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPasswordBackendErrors(null);
                setPasswordFormValidated(false);
            } else {
                setPasswordBackendErrors(response.payload);
                setPasswordSuccess(false);
            }
        } else {
            setPasswordBackendErrors(null);
            setPasswordFormValidated(true);
        }
    };

    const getProfileImageUrl = () => {
        if (profileImage) {
            return profileImage;
        }
        return null;
    };

    return (
        <div className="profile-container">
            <Container className="mt-4 py-2" style={{ maxWidth: '1000px' }}>
                <Row className="g-5">
                    {/* Panel Izquierdo */}
                    <Col lg={4} className="text-center d-flex flex-column align-items-center">
                        <div className="profile-image-container">
                            {getProfileImageUrl() ? (
                                <img
                                    src={getProfileImageUrl()}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            ) : (
                                <div className="profile-image-placeholder">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}
                        </div>
                        <h2 className="profile-display-name mt-3">{user.nombre}</h2>
                        <p className="text-muted small mb-4">{user.email}</p>
                        
                        {user.elo !== undefined && (
                            <div className="profile-elo-card border rounded-4 bg-white p-3 shadow-sm text-center w-100">
                                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                    Mi Puntuación ELO
                                </span>
                                <h3 className="m-0 mt-1 fw-bold text-dark" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                                    {user.elo}
                                </h3>
                                {user.eloProvisional && (
                                    <span className="badge rounded-pill bg-light text-secondary border mt-2 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                        Provisional
                                    </span>
                                )}
                            </div>
                        )}
                    </Col>

                    {/* Panel Derecho Sin Card Envolvente */}
                    <Col lg={8}>
                        <div className="segmented-control p-1 mb-4 rounded-3 d-flex">
                            <button
                                className={`segmented-btn flex-grow-1 border-0 py-2 rounded-3 text-center transition-all ${activeTab === 'profile' ? 'active shadow-sm fw-medium text-dark' : 'text-secondary'}`}
                                onClick={() => setActiveTab('profile')}
                                role="tab"
                            >
                                <FormattedMessage id="project.users.Profile.tabs.profileInfo" />
                            </button>
                            <button
                                className={`segmented-btn flex-grow-1 border-0 py-2 rounded-3 text-center transition-all ${activeTab === 'password' ? 'active shadow-sm fw-medium text-dark' : 'text-secondary'}`}
                                onClick={() => setActiveTab('password')}
                                role="tab"
                            >
                                <FormattedMessage id="project.users.Profile.tabs.changePassword" />
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className="profile-form-wrapper">
                                <h3 className="pb-3 font-weight-bold text-dark border-bottom mb-4" style={{ fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                                    <FormattedMessage id="project.users.UpdateProfile.title" />
                                </h3>
                                
                                {profileSuccess && (
                                    <div className="alert alert-success border-0 rounded-3 shadow-sm py-2 px-3 small d-flex justify-content-between align-items-center mb-4" role="alert" style={{ backgroundColor: '#e2f6ea', color: '#146c3e' }}>
                                        <span><FormattedMessage id="project.users.Profile.success.profileUpdated" /></span>
                                        <button type="button" className="btn-close shadow-none small" onClick={() => setProfileSuccess(false)} style={{ fontSize: '0.75rem' }}></button>
                                    </div>
                                )}
                                <Errors errors={profileBackendErrors} onClose={() => setProfileBackendErrors(null)} />

                                <Form ref={node => profileForm = node} noValidate validated={profileFormValidated} onSubmit={e => handleProfileSubmit(e)}>

                                    <Form.Group as={Row} className="mb-3 align-items-center" controlId="profileImage">
                                        <Form.Label column md={4} className="text-secondary small fw-medium">
                                            <FormattedMessage id="project.users.Profile.fields.profileImage" />
                                        </Form.Label>
                                        <Col md={8} className="d-flex align-items-center gap-3">
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProfileImageChange}
                                                    className="form-control-apple-file"
                                                />
                                                <Button variant="light" className="btn-sm rounded-pill border px-3 text-dark bg-white" style={{ fontSize: '0.85rem' }}>
                                                    <i className="fa-solid fa-cloud-arrow-up me-2 text-secondary"></i>Subir foto
                                                </Button>
                                            </div>
                                            {profileImage && (
                                                <Button variant="link" className="text-danger text-decoration-none small p-0 ms-2" onClick={handleRemoveProfileImage} style={{ fontSize: '0.85rem' }}>
                                                    <FormattedMessage id="project.users.Profile.buttons.removeImage" />
                                                </Button>
                                            )}
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3" controlId="email">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.global.fields.email" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.email' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3" controlId="fechaNacimiento">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.global.fields.fechaNacimiento" defaultMessage="Fecha de Nacimiento" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-4" controlId="userName">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.global.fields.userName" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="text" value={user.nombre} disabled className="form-control-apple bg-light opacity-75" />
                                            <Form.Text className="text-muted mt-2 d-block" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                                <i className="fa-solid fa-circle-info me-1 opacity-70"></i> <FormattedMessage id="project.users.Profile.fields.userNameDisabled" />
                                            </Form.Text>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row}>
                                        <Col md={{ span: 8, offset: 4 }}>
                                        <Button type="submit" className="btn-apple-dark rounded-pill px-4 py-2">
                                            <FormattedMessage id="project.global.buttons.save" />
                                        </Button>
                                        </Col>
                                    </Form.Group>
                                </Form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-form-wrapper">
                                <h3 className="pb-3 font-weight-bold text-dark border-bottom mb-4" style={{ fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                                    <FormattedMessage id="project.users.ChangePassword.title" />
                                </h3>
                                
                                {passwordSuccess && (
                                    <div className="alert alert-success border-0 rounded-3 shadow-sm py-2 px-3 small d-flex justify-content-between align-items-center mb-4" role="alert" style={{ backgroundColor: '#e2f6ea', color: '#146c3e' }}>
                                        <span><FormattedMessage id="project.users.Profile.success.passwordChanged" /></span>
                                        <button type="button" className="btn-close shadow-none small" onClick={() => setPasswordSuccess(false)} style={{ fontSize: '0.75rem' }}></button>
                                    </div>
                                )}
                                <Errors errors={passwordBackendErrors} onClose={() => setPasswordBackendErrors(null)} />

                                <Form ref={node => passwordForm = node} noValidate validated={passwordFormValidated} onSubmit={e => handlePasswordSubmit(e)}>

                                    <Form.Group as={Row} className="mb-3" controlId="oldPassword">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.users.ChangePassword.fields.oldPassword" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoFocus autoComplete="current-password" required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-3" controlId="newPassword">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.users.ChangePassword.fields.newPassword" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-4" controlId="confirmNewPassword">
                                        <Form.Label column md={4} className="text-secondary small fw-medium pt-2">
                                            <FormattedMessage id="project.users.SignUp.fields.confirmPassword" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="password" value={confirmNewPassword} onChange={e => handleConfirmNewPasswordChange(e.target.value)} autoComplete="new-password" isInvalid={passwordsDoNotMatch} required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                {passwordsDoNotMatch ?
                                                    <FormattedMessage id='project.global.validator.passwordsDoNotMatch' /> :
                                                    <FormattedMessage id='project.global.validator.required' />}
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                        <Form.Group as={Row}>
                                            <Col md={{ span: 8, offset: 4 }}>
                                                <Button type="submit" className="btn-dark rounded-pill px-4 py-2" style={{ backgroundColor: '#000', border: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                                                    <FormattedMessage id="project.global.buttons.save" />
                                                </Button>
                                            </Col>
                                        </Form.Group>
                                </Form>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;