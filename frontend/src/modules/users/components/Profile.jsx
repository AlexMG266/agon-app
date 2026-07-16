// src/modules/users/components/Profile.jsx
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

    const [profileImage, setProfileImage] = useState(user.imagenPerfil || '');
    const [email, setEmail] = useState(user.email || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(user.fechaNacimiento || '');
    const [profileFormValidated, setProfileFormValidated] = useState(false);
    const [profileBackendErrors, setProfileBackendErrors] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(false);

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
                <Row className="g-4">
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
                        <p className="profile-email-text">{user.email}</p>
                    </Col>

                    <Col lg={8}>
                        <div className="profile-stats-row">
                            <div className="profile-stat-item">
                                <span className="profile-stat-icon">🎯</span>
                                <div>
                                    <div className="profile-stat-label">ELO Actual</div>
                                    <div className="profile-stat-value">{user.elo || 800}</div>
                                    {user.eloProvisional && (
                                        <div className="profile-stat-sub">Provisional</div>
                                    )}
                                </div>
                            </div>
                            <div className="profile-stat-item">
                                <span className="profile-stat-icon">👥</span>
                                <div>
                                    <div className="profile-stat-label">Equipos</div>
                                    <div className="profile-stat-value">{user.equipos?.length || 0}</div>
                                    <div className="profile-stat-sub">Activos</div>
                                </div>
                            </div>
                            <div className="profile-stat-item">
                                <span className="profile-stat-icon">🏆</span>
                                <div>
                                    <div className="profile-stat-label">Victorias</div>
                                    <div className="profile-stat-value">{user.victorias || 0}</div>
                                    <div className="profile-stat-sub">Esta temporada</div>
                                </div>
                            </div>
                        </div>

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
                                <h3 className="profile-form-title">
                                    <FormattedMessage id="project.users.UpdateProfile.title" />
                                </h3>
                                
                                {profileSuccess && (
                                    <div className="profile-success-alert">
                                        <span><FormattedMessage id="project.users.Profile.success.profileUpdated" /></span>
                                        <button type="button" className="btn-close shadow-none small" onClick={() => setProfileSuccess(false)}></button>
                                    </div>
                                )}
                                <Errors errors={profileBackendErrors} onClose={() => setProfileBackendErrors(null)} />

                                <Form ref={node => profileForm = node} noValidate validated={profileFormValidated} onSubmit={e => handleProfileSubmit(e)}>

                                    <Form.Group as={Row} className="profile-form-group" controlId="profileImage">
                                        <Form.Label column md={4} className="profile-form-label">
                                            <FormattedMessage id="project.users.Profile.fields.profileImage" />
                                        </Form.Label>
                                        <Col md={8} className="d-flex align-items-center gap-3 flex-wrap">
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProfileImageChange}
                                                    className="form-control-apple-file"
                                                />
                                                <Button variant="light" className="profile-upload-btn">
                                                    <i className="fa-solid fa-cloud-arrow-up me-2 text-secondary"></i>Subir foto
                                                </Button>
                                            </div>
                                            {profileImage && (
                                                <Button variant="link" className="profile-remove-btn" onClick={handleRemoveProfileImage}>
                                                    <FormattedMessage id="project.users.Profile.buttons.removeImage" />
                                                </Button>
                                            )}
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="profile-form-group" controlId="email">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
                                            <FormattedMessage id="project.global.fields.email" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.email' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="profile-form-group" controlId="fechaNacimiento">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
                                            <FormattedMessage id="project.global.fields.fechaNacimiento" defaultMessage="Fecha de Nacimiento" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="profile-form-group" controlId="userName">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
                                            <FormattedMessage id="project.global.fields.userName" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="text" value={user.nombre} disabled className="form-control-apple bg-light opacity-75" />
                                            <Form.Text className="profile-hint">
                                                <i className="fa-solid fa-circle-info me-1 opacity-70"></i> <FormattedMessage id="project.users.Profile.fields.userNameDisabled" />
                                            </Form.Text>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row}>
                                        <Col md={{ span: 8, offset: 4 }}>
                                            <Button type="submit" className="profile-save-btn">
                                                <FormattedMessage id="project.global.buttons.save" />
                                            </Button>
                                        </Col>
                                    </Form.Group>
                                </Form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-form-wrapper">
                                <h3 className="profile-form-title">
                                    <FormattedMessage id="project.users.ChangePassword.title" />
                                </h3>
                                
                                {passwordSuccess && (
                                    <div className="profile-success-alert">
                                        <span><FormattedMessage id="project.users.Profile.success.passwordChanged" /></span>
                                        <button type="button" className="btn-close shadow-none small" onClick={() => setPasswordSuccess(false)}></button>
                                    </div>
                                )}
                                <Errors errors={passwordBackendErrors} onClose={() => setPasswordBackendErrors(null)} />

                                <Form ref={node => passwordForm = node} noValidate validated={passwordFormValidated} onSubmit={e => handlePasswordSubmit(e)}>

                                    <Form.Group as={Row} className="profile-form-group" controlId="oldPassword">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
                                            <FormattedMessage id="project.users.ChangePassword.fields.oldPassword" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoFocus autoComplete="current-password" required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="profile-form-group" controlId="newPassword">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
                                            <FormattedMessage id="project.users.ChangePassword.fields.newPassword" />
                                        </Form.Label>
                                        <Col md={8}>
                                            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required className="form-control-apple" />
                                            <Form.Control.Feedback type="invalid" className="small">
                                                <FormattedMessage id='project.global.validator.required' />
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="profile-form-group" controlId="confirmNewPassword">
                                        <Form.Label column md={4} className="profile-form-label pt-2">
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
                                            <Button type="submit" className="profile-save-btn">
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