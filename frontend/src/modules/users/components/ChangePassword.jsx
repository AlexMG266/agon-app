import {useState} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {useNavigate} from 'react-router';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import {Errors} from '../../common';
import * as selectors from '../selectors';
import backend from '../../../backend';

const ChangePassword = () => {

    const user = useSelector(selectors.getUser);
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    let form;

    const handleSubmit = async event => {

        event.preventDefault();

        if (form.checkValidity() && checkConfirmNewPassword()) {

            const response = await backend.userService.changePassword(user.id, oldPassword, newPassword);

            if (response.ok) {
                navigate('/');
            } else {
                setBackendErrors(response.payload);
            }


        } else {

            setBackendErrors(null);
            setFormValidated(true);
            
        }

    }

    const checkConfirmNewPassword = () => {

        if (newPassword !== confirmNewPassword) {

            setPasswordsDoNotMatch(true);

            return false;

        } else {
            return true;
        }

    }

    const handleConfirmNewPasswordChange = value => {

        setConfirmNewPassword(value);
        setPasswordsDoNotMatch(false);

    }

    return (
        <div className="col-md-10 mx-auto">
            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)}/>
            <Card className="bg-light border-dark">
                <Card.Header as="h5">
                    <FormattedMessage id="project.users.ChangePassword.title"/>
                </Card.Header>
                <Card.Body>
                    <Form ref={node => form = node}
                          noValidate validated={formValidated} onSubmit={e => handleSubmit(e)}>
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
                                <Button type="submit">
                                    <FormattedMessage id="project.global.buttons.save"/>
                                </Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );

}

export default ChangePassword;
