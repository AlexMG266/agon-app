import * as actionTypes from './actionTypes';

export const createTournament = (tournamentData, onSuccess, onErrors) => ({
    type: actionTypes.CREATE_TOURNAMENT_COMPLETED,
    payload: tournamentData,
    onSuccess,
    onErrors
});

export const clearTournamentError = () => ({
    type: actionTypes.CLEAR_TOURNAMENT_ERROR
});
