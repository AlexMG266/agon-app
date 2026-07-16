import { combineReducers } from 'redux';
import * as actionTypes from './actionTypes';

const initialState = {
    error: null,
    userTeams: []
};

const error = (state = initialState.error, action) => {
    switch (action.type) {
        case actionTypes.ERROR:
        case actionTypes.TEAMS_ERROR: 
            return action.error;
        default:
            return state;
    }
};

const userTeams = (state = initialState.userTeams, action) => {
    switch (action.type) {
        case actionTypes.GET_MY_TEAMS_COMPLETED:
            return action.userTeams; 
        default:
            return state;
    }
};

const reducer = combineReducers({
    error,
    userTeams
});

export default reducer;