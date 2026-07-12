import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import {Errors} from '../../common';
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
                fechaNacimiento: user.fechaNacimiento
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
            <Container className="py-4">
                <Row>
                    <Col lg={3} className="text-center mb-4">
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
                        <h4 className="mt-3">{user.nombre}</h4>
                        <p className="text-muted">{user.email}</p>
                        {user.elo !== undefined && (
                            <p className="text-info"><strong>Elo: {user.elo}</strong></p>
                        )}
                    </Col>

                    <Col lg={9}>
                        <div className="profile-tabs">
                            <div className="nav nav-tabs" role="tablist">
                                <button 
                                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                    role="tab"
                                >
                                    <FormattedMessage id="project.users.Profile.tabs.profileInfo"/>
                                </button>
                                <button 
                                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('password')}
                                    role="tab"
                                >
                                    <FormattedMessage id="project.users.Profile.tabs.changePassword"/>
                                </button>
                            </div>

                            {activeTab === 'profile' && (
                                <Card className="mt-3">
                                    <Card.Header as="h5">
                                        <FormattedMessage id="project.users.UpdateProfile.title"/>
                                    </Card.Header>
                                    <Card.Body>
                                        {profileSuccess && (
                                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                <FormattedMessage id="project.users.Profile.success.profileUpdated"/>
                                                <button type="button" className="btn-close" onClick={() => setProfileSuccess(false)}></button>
                                            </div>
                                        )}
                                        <Errors errors={profileBackendErrors} onClose={() => setProfileBackendErrors(null)}/>
                                        
                                        <Form ref={node => profileForm = node}
                                              noValidate validated={profileFormValidated} onSubmit={e => handleProfileSubmit(e)}>
                                            
                                            <Form.Group as={Row} className="mb-3" controlId="profileImage">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.users.Profile.fields.profileImage"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control 
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleProfileImageChange}
                                                    />
                                                    {profileImage && (
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
                                                            className="mt-2"
                                                            onClick={handleRemoveProfileImage}
                                                        >
                                                            <FormattedMessage id="project.users.Profile.buttons.removeImage"/>
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3" controlId="email">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.global.fields.email"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control type="email"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        required/>
                                                    <Form.Control.Feedback type="invalid">
                                                        <FormattedMessage id='project.global.validator.email'/>
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3" controlId="userName">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.global.fields.userName"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control type="text"
                                                        value={user.nombre}
                                                        disabled/>
                                                    <Form.Text className="text-muted">
                                                        <FormattedMessage id="project.users.Profile.fields.userNameDisabled"/>
                                                    </Form.Text>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row}>
                                                <Col md={{ span: 4, offset: 3 }}>
                                                    <Button type="submit" variant="primary">
                                                        <FormattedMessage id="project.global.buttons.save"/>
                                                    </Button>
                                                </Col>
                                            </Form.Group>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}

                            {activeTab === 'password' && (
                                <Card className="mt-3">
                                    <Card.Header as="h5">
                                        <FormattedMessage id="project.users.ChangePassword.title"/>
                                    </Card.Header>
                                    <Card.Body>
                                        {passwordSuccess && (
                                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                <FormattedMessage id="project.users.Profile.success.passwordChanged"/>
                                                <button type="button" className="btn-close" onClick={() => setPasswordSuccess(false)}></button>
                                            </div>
                                        )}
                                        <Errors errors={passwordBackendErrors} onClose={() => setPasswordBackendErrors(null)}/>
                                        
                                        <Form ref={node => passwordForm = node}
                                              noValidate validated={passwordFormValidated} onSubmit={e => handlePasswordSubmit(e)}>
                                            
                                            <Form.Group as={Row} className="mb-3" controlId="oldPassword">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.users.ChangePassword.fields.oldPassword"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control type="password"
                                                        value={oldPassword}
                                                        onChange={e => setOldPassword(e.target.value)}
                                                        autoFocus
                                                        autoComplete="current-password"
                                                        required/>
                                                    <Form.Control.Feedback type="invalid">
                                                        <FormattedMessage id='project.global.validator.required'/>
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3" controlId="newPassword">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.users.ChangePassword.fields.newPassword"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control type="password"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        autoComplete="new-password"
                                                        required/>
                                                    <Form.Control.Feedback type="invalid">
                                                        <FormattedMessage id='project.global.validator.required'/>
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3" controlId="confirmNewPassword">
                                                <Form.Label column md={3}>
                                                    <FormattedMessage id="project.users.SignUp.fields.confirmPassword"/>
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="password"
                                                        value={confirmNewPassword}
                                                        onChange={e => handleConfirmNewPasswordChange(e.target.value)}
                                                        autoComplete="new-password"
                                                        isInvalid={passwordsDoNotMatch}
                                                        required/>
                                                    <Form.Control.Feedback type="invalid">
                                                        {passwordsDoNotMatch ?
                                                            <FormattedMessage id='project.global.validator.passwordsDoNotMatch'/> :
                                                            <FormattedMessage id='project.global.validator.required'/>}
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row}>
                                                <Col md={{ span: 4, offset: 3 }}>
                                                    <Button type="submit" variant="primary">
                                                        <FormattedMessage id="project.global.buttons.save"/>
                                                    </Button>
                                                </Col>
                                            </Form.Group>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
