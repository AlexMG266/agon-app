import * as actionTypes from './actionTypes';
import backend from '../../backend';

export const createTeam = (nombre, descripcion, onSuccess, onError) => dispatch => {
    backend.teamService.createTeam(nombre, descripcion).then(response => {
        if (response.ok) {
            dispatch({ type: actionTypes.CREATE_TEAM_COMPLETED, team: response.payload });
            onSuccess();
        } else {
            dispatch({ type: actionTypes.TEAMS_ERROR, error: response.payload });
            onError(response.payload);
        }
    });
};
