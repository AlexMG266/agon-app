import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; 

import users from '../../users';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [show, setShow] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await dispatch(users.actions.logout());
            setShow(false);
            navigate('/');
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (isSubmitting) return; // evitar el cancelar a mitad de proceso
        setShow(false);
        navigate(-1); 
    };

    return (
        <Modal 
            show={show} 
            onHide={handleCancel}
            centered
            backdrop="static"
            keyboard={false}
            contentClassName="border-0 rounded-4 shadow"
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
        >
            <Modal.Body className="p-4 text-center">
                <h5 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>
                    ¿Cerrar sesión?
                </h5>
                <p className="text-secondary small mb-4">
                    Tendrás que volver a introducir tus credenciales para acceder a tus estadísticas y torneos.
                </p>
                
                <div className="d-flex gap-2 justify-content-center">
                    <Button 
                        variant="light" 
                        className="rounded-pill px-4 fw-medium text-secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting} 
                        style={{ fontSize: '0.88rem', border: '1px solid #d2d2d7' }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="danger" 
                        className="rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center"
                        onClick={handleConfirm}
                        disabled={isSubmitting} 
                        style={{ fontSize: '0.88rem', backgroundColor: '#ff3b30', borderColor: '#ff3b30' }}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Procesando...
                            </>
                        ) : (
                            'Cerrar sesión'
                        )}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Logout;