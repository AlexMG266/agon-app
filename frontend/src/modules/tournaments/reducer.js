import { combineReducers } from 'redux';
import * as actionTypes from './actionTypes';

const initialState = {
    error: null,
    userTournaments: []
};

const error = (state = initialState.error, action) => {
    switch (action.type) {
        case actionTypes.TOURNAMENTS_ERROR:
            return action.error;
        case actionTypes.CLEAR_TOURNAMENT_ERROR:
            return null;
        default:
            return state;
    }
};

const userTournaments = (state = initialState.userTournaments, action) => {
    switch (action.type) {
        case actionTypes.GET_MY_TOURNAMENTS_COMPLETED:
            return action.userTournaments;
        default:
            return state;
    }
};

const reducer = combineReducers({
    error,
    userTournaments
});

export default reducer;
