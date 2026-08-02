import reducer from './reducer';
import * as actionTypes from './actionTypes';

const team1 = { id: 1, nombreEquipo: 'equipo a' };
const team2 = { id: 2, nombreEquipo: 'equipo b' };

describe('teams reducer', () => {
  it('devuelve el estado inicial', () => {
    expect(reducer(undefined, {})).toEqual({ error: null, userTeams: [] });
  });

  it('guarda el error en TEAMS_ERROR', () => {
    const error = 'no tienes permisos';
    expect(reducer(undefined, { type: actionTypes.TEAMS_ERROR, error }))
      .toEqual({ error, userTeams: [] });
  });

  it('guarda los equipos en GET_MY_TEAMS_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.GET_MY_TEAMS_COMPLETED, userTeams: [team1, team2] }))
      .toEqual({ error: null, userTeams: [team1, team2] });
  });

  it('actualiza un equipo en UPDATE_TEAM_SUCCESS', () => {
    const editado = { ...team1, nombreEquipo: 'equipo a editado' };
    const state = { error: null, userTeams: [team1, team2] };
    expect(reducer(state, { type: actionTypes.UPDATE_TEAM_SUCCESS, payload: editado }).userTeams)
      .toEqual([editado, team2]);
  });

  it('elimina un equipo en DELETE_TEAM_SUCCESS', () => {
    const state = { error: null, userTeams: [team1, team2] };
    expect(reducer(state, { type: actionTypes.DELETE_TEAM_SUCCESS, payload: 1 }).userTeams)
      .toEqual([team2]);
  });

  it('elimina un equipo en LEAVE_TEAM_SUCCESS', () => {
    const state = { error: null, userTeams: [team1, team2] };
    expect(reducer(state, { type: actionTypes.LEAVE_TEAM_SUCCESS, payload: 2 }).userTeams)
      .toEqual([team1]);
  });
});
