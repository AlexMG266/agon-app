import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import users from '../../users';
import ConfirmationModal from '../../common/components/ConfirmationModal';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [show, setShow] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await dispatch(users.actions.logout());
        setShow(false);
        navigate('/');
    };

    const handleCancel = () => {
        if (isSubmitting) return;
        setShow(false);
        navigate(-1);
    };

    return (
        <ConfirmationModal
            show={show}
            onHide={handleCancel}
            onConfirm={handleConfirm}
            title="¿Cerrar sesión?"
            description="Tendrás que volver a introducir tus credenciales para acceder a tus estadísticas y torneos."
            confirmText="Cerrar sesión"
            isSubmitting={isSubmitting}
            variant="danger"
        />
    );
};

export default Logout;