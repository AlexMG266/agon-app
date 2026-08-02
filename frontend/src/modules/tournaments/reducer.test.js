import reducer from './reducer';
import * as actionTypes from './actionTypes';

const torneo = { id: 1, nombre: 'liga' };

describe('tournaments reducer', () => {
  it('devuelve el estado inicial', () => {
    expect(reducer(undefined, {})).toEqual({
      error: null,
      userTournaments: [],
      followedTournaments: [],
      enrolledTournaments: []
    });
  });

  it('guarda el error en TOURNAMENTS_ERROR', () => {
    const error = 'fallo';
    expect(reducer(undefined, { type: actionTypes.TOURNAMENTS_ERROR, error }).error).toBe(error);
  });

  it('limpia el error en CLEAR_TOURNAMENT_ERROR', () => {
    const state = { error: 'fallo', userTournaments: [], followedTournaments: [], enrolledTournaments: [] };
    expect(reducer(state, { type: actionTypes.CLEAR_TOURNAMENT_ERROR }).error).toBeNull();
  });

  it('guarda los torneos en GET_MY_TOURNAMENTS_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.GET_MY_TOURNAMENTS_COMPLETED, userTournaments: [torneo] }).userTournaments)
      .toEqual([torneo]);
  });

  it('guarda los seguidos en GET_FOLLOWED_TOURNAMENTS_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.GET_FOLLOWED_TOURNAMENTS_COMPLETED, followedTournaments: [torneo] }).followedTournaments)
      .toEqual([torneo]);
  });

  it('guarda los inscritos en GET_ENROLLED_TOURNAMENTS_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.GET_ENROLLED_TOURNAMENTS_COMPLETED, enrolledTournaments: [torneo] }).enrolledTournaments)
      .toEqual([torneo]);
  });
});
