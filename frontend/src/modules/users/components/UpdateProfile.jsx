import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {useNavigate} from 'react-router';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Errors} from '../../common';
import * as actions from '../actions';
import * as selectors from '../selectors';
import backend from '../../../backend';

const UpdateProfile = () => {

    const user = useSelector(selectors.getUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail]  = useState(user.email);
    const [formValidated, setFormValidated] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);
    let form;

    const handleSubmit = async event => {

        event.preventDefault();

        if (form.checkValidity()) {

            const newUserProfile = {
                id: user.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim()
            };
            
            const response = await backend.userService.updateProfile(newUserProfile);

            if (response.ok) {
                dispatch(actions.updateProfileCompleted(response.payload));
                navigate('/');
            } else {
                setBackendErrors(response.payload);
            }

        } else {

            setBackendErrors(null);
            setFormValidated(true);

        }

    }

    return (
        <div className="col-md-10 mx-auto">
            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)}/>
            <Card className="bg-light border-dark">
                <Card.Header as="h5">
                    <FormattedMessage id="project.users.UpdateProfile.title"/>
                </Card.Header>
                <Card.Body>
                    <Form ref={node => form = node}
                        noValidate validated={formValidated} onSubmit={e => handleSubmit(e)}>
                        <Form.Group as={Row} className="mb-3" controlId="firstName">
                            <Form.Label column md={3}>
                                <FormattedMessage id="project.global.fields.firstName"/>
                            </Form.Label>
                            <Col md={4}>
                                <Form.Control type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    autoFocus
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

export default UpdateProfile;
