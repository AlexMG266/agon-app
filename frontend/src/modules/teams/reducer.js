// src/modules/teams/reducer.js
import { combineReducers } from 'redux';
import * as actionTypes from './actionTypes';

const initialState = {
    error: null,
    userTeams: []
};

const error = (state = initialState.error, action) => {
    switch (action.type) {
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
        case actionTypes.UPDATE_TEAM_SUCCESS:
            return state.map(team =>
                team.id === action.payload.id ? action.payload : team
            );
        case actionTypes.DELETE_TEAM_SUCCESS:
        case actionTypes.LEAVE_TEAM_SUCCESS:
            return state.filter(team => team.id !== action.payload);
        default:
            return state;
    }
};

const reducer = combineReducers({
    error,
    userTeams
});

export default reducer;