import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import backend from '../../../backend';
import users from '../../users';

import { ErrorDialog } from '../../common';
import * as actions from '../actions';
import * as selectors from '../selectors';

const ConnectedErrorDialog = () => {

    const error = useSelector(selectors.getError);
    const dispatch = useDispatch();

    return <ErrorDialog error={error}
                onClose={() => dispatch(actions.error(null))}/>

};

const AppGlobalComponents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        backend.init(() => {
            console.error('Error de red');
        });

        backend.setReauthenticationCallback(() => {
            dispatch(users.actions.logout());
            navigate('/users/login');
        });

    }, [navigate, dispatch]);

    return (
        <div>
            <ConnectedErrorDialog />
        </div>
    );
};

export default AppGlobalComponents;