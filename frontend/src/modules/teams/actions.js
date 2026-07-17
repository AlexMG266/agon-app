// src/modules/teams/actions.js
import * as actionTypes from './actionTypes';
import backend from '../../backend';

export const createTeam = (nombre, descripcion, onSuccess, onError) => dispatch => {
    backend.teamService.createTeam(nombre, descripcion).then(response => {
        if (response.ok) {
            dispatch({ type: actionTypes.CREATE_TEAM_COMPLETED, team: response.payload });
            if (onSuccess) {
                onSuccess(response.payload);
            }
        } else {
            dispatch({ type: actionTypes.TEAMS_ERROR, error: response.payload });
            if (onError) {
                onError(response.payload);
            }
        }
    });
};

export const getMyTeams = () => dispatch => {
    backend.teamService.getMyTeams()
        .then(response => {
            console.log("Datos recibidos del servidor:", response);
            if (response.ok) {
                dispatch({ type: actionTypes.GET_MY_TEAMS_COMPLETED, userTeams: response.payload });
            } else {
                dispatch({ type: actionTypes.TEAMS_ERROR, error: response.payload });
            }
        })
        .catch(err => {
            console.error("Error al obtener equipos", err);
        });
};

export const updateTeamSuccess = (team) => ({
    type: actionTypes.UPDATE_TEAM_SUCCESS,
    payload: team
});

export const deleteTeamSuccess = (id) => ({
    type: actionTypes.DELETE_TEAM_SUCCESS,
    payload: id
});

export const leaveTeamSuccess = (id) => ({
    type: actionTypes.LEAVE_TEAM_SUCCESS,
    payload: id
});