import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {useNavigate} from 'react-router';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import {Errors} from '../../common';
import * as actions from '../actions';
import backend from '../../../backend';

const SignUp = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail]  = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    let form;

    const handleSubmit = async event => {

        event.preventDefault();

        if (form.checkValidity() && checkConfirmPassword()) {

            const user = {
                userName: userName.trim(),
                password: password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim()
            };

            const response = await backend.userService.signUp(user, () => {
                navigate('/users/login');
                dispatch(actions.logout());
            });

            if (response.ok) {
                dispatch(actions.signUpCompleted(response.payload));
                navigate('/');
            } else {
                setBackendErrors(response.payload);
            }

        } else {

            setBackendErrors(null);
            setFormValidated(true);

        }

    }

    const checkConfirmPassword = () => {

        if (password !== confirmPassword) {

            setPasswordsDoNotMatch(true);

            return false;

        } else {
            return true;
        }

    }

    const handleConfirmPasswordChange = value => {

        setConfirmPassword(value);
        setPasswordsDoNotMatch(false);
    
    }

    return (
        <div className="col-md-10 mx-auto">
            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)}/>
            <Card className="bg-light border-dark">
                <Card.Header as="h5">
                    <FormattedMessage id="project.users.SignUp.title"/>
                </Card.Header>
                <Card.Body>
                    <Form ref={node => form = node}
                          noValidate validated={formValidated} onSubmit={e => handleSubmit(e)}>
                        <Form.Group as={Row} className="mb-3" controlId="userName">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.global.fields.userName"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control type="text"
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    autoFocus
                                    autoComplete="username"
                                    required/>
                                <Form.Control.Feedback type="invalid">
                                    <FormattedMessage id='project.global.validator.required'/>
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="password">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.global.fields.password"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required/>
                                <Form.Control.Feedback type="invalid">
                                    <FormattedMessage id='project.global.validator.required'/>
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="confirmPassword">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.users.SignUp.fields.confirmPassword"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => handleConfirmPasswordChange(e.target.value)}
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
                        <Form.Group as={Row} className="mb-3" controlId="firstName">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.global.fields.firstName"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required/>
                                <Form.Control.Feedback type="invalid">
                                    <FormattedMessage id='project.global.validator.required'/>
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="lastName">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.global.fields.lastName"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control type="text"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required/>
                                <Form.Control.Feedback type="invalid">
                                    <FormattedMessage id='project.global.validator.required'/>
                                </Form.Control.Feedback>
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
                        <Form.Group as={Row}>
                            <Col md={{ span: 4, offset: 3 }}>
                                <Button type="submit">
                                    <FormattedMessage id="project.users.SignUp.title"/>
                                </Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );

}

export default SignUp;
