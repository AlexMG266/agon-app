import * as actionTypes from './actionTypes';

export const error = error => ({
    type: actionTypes.ERROR,
    error
});

export const setLocale = locale => ({
    type: actionTypes.SET_LOCALE,
    locale
});
