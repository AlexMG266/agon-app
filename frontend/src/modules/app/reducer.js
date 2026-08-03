import {combineReducers} from 'redux';

import * as actionTypes from './actionTypes';
import { SUPPORTED_LOCALES, getInitialLocale } from '../../i18n';

const initialState = {
    error: null,
    locale: getInitialLocale()
};

const error = (state = initialState.error, action) => {

    switch (action.type) {

        case actionTypes.ERROR:
            return action.error;

        default:
            return state;

    }

}

const locale = (state = initialState.locale, action) => {

    switch (action.type) {

        case actionTypes.SET_LOCALE:
            return SUPPORTED_LOCALES.includes(action.locale) ? action.locale : state;

        default:
            return state;

    }

}

const reducer = combineReducers({
    error,
    locale
});

export default reducer;
