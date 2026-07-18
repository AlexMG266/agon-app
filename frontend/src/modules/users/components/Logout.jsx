import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { FormattedMessage } from 'react-intl';

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
            title={<FormattedMessage id="project.users.Logout.title" defaultMessage="¿Cerrar sesión?" />}
            description={<FormattedMessage id="project.users.Logout.description" defaultMessage="Tendrás que volver a introducir tus credenciales para acceder a tus estadísticas y torneos." />}
            confirmText={<FormattedMessage id="project.users.Logout.confirm" defaultMessage="Cerrar sesión" />}
            isSubmitting={isSubmitting}
            variant="danger"
        />
    );
};

export default Logout;