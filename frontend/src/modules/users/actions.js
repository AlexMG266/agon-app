import * as actionTypes from './actionTypes';
import backend from '../../backend';

export const signUpCompleted = authenticatedUser => ({
    type: actionTypes.SIGN_UP_COMPLETED,
    authenticatedUser
});

export const loginCompleted = authenticatedUser => ({
    type: actionTypes.LOGIN_COMPLETED,
    authenticatedUser
});

export const logout = () => {

    backend.userService.logout();

    return {type: actionTypes.LOGOUT};

};

export const updateProfileCompleted = user => ({
    type: actionTypes.UPDATE_PROFILE_COMPLETED,
    user
});
