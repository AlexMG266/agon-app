import * as actionTypes from './actionTypes';
import backend from '../../backend';

export const createTournament = (tournamentData, onSuccess, onErrors) => ({
    type: actionTypes.CREATE_TOURNAMENT_COMPLETED,
    payload: tournamentData,
    onSuccess,
    onErrors
});

export const getMyTournaments = () => dispatch => {
    backend.tournamentService.getMyTournaments()
        .then(response => {
            if (response.ok) {
                dispatch({ type: actionTypes.GET_MY_TOURNAMENTS_COMPLETED, userTournaments: response.payload });
            } else {
                dispatch({ type: actionTypes.TOURNAMENTS_ERROR, error: response.payload });
            }
        })
        .catch(err => {
            console.error("Error al obtener torneos", err);
        });
};

export const clearTournamentError = () => ({
    type: actionTypes.CLEAR_TOURNAMENT_ERROR
});

export const getFollowedTournaments = () => dispatch => {
    backend.tournamentService.getFollowedTournaments()
        .then(response => {
            if (response.ok) {
                dispatch({ type: actionTypes.GET_FOLLOWED_TOURNAMENTS_COMPLETED, followedTournaments: response.payload });
            }
        })
        .catch(err => {
            console.error("Error al obtener torneos seguidos", err);
        });
};

export const getEnrolledTournaments = () => dispatch => {
    backend.tournamentService.getEnrolledTournaments()
        .then(response => {
            if (response.ok) {
                dispatch({ type: actionTypes.GET_ENROLLED_TOURNAMENTS_COMPLETED, enrolledTournaments: response.payload });
            }
        })
        .catch(err => {
            console.error("Error al obtener torneos inscritos", err);
        });
};
