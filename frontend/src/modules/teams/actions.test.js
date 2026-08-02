import * as actionTypes from './actionTypes';
import { createTeam, getMyTeams, updateTeamSuccess, deleteTeamSuccess, leaveTeamSuccess } from './actions';
import backend from '../../backend';

vi.mock('../../backend', () => ({
  default: {
    teamService: {
      createTeam: vi.fn(),
      getMyTeams: vi.fn()
    }
  }
}));

describe('teams actions', () => {
  const dispatch = vi.fn();
  const equipo = { id: 1, nombreEquipo: 'los cracks' };

  beforeEach(() => {
    dispatch.mockClear();
    backend.teamService.createTeam.mockReset();
    backend.teamService.getMyTeams.mockReset();
  });

  it('createTeam envia la accion y llama onSuccess cuando ok', async () => {
    backend.teamService.createTeam.mockResolvedValue({ ok: true, payload: equipo });
    const onSuccess = vi.fn();
    const onError = vi.fn();
    await createTeam('los cracks', 'desc', onSuccess, onError)(dispatch);
    expect(backend.teamService.createTeam).toHaveBeenCalledWith('los cracks', 'desc');
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.CREATE_TEAM_COMPLETED, team: equipo });
    expect(onSuccess).toHaveBeenCalledWith(equipo);
    expect(onError).not.toHaveBeenCalled();
  });

  it('createTeam emite error y llama onError cuando falla', async () => {
    backend.teamService.createTeam.mockResolvedValue({ ok: false, payload: 'fallo' });
    const onSuccess = vi.fn();
    const onError = vi.fn();
    await createTeam('los cracks', 'desc', onSuccess, onError)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.TEAMS_ERROR, error: 'fallo' });
    expect(onError).toHaveBeenCalledWith('fallo');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('getMyTeams guarda los equipos cuando ok', async () => {
    backend.teamService.getMyTeams.mockResolvedValue({ ok: true, payload: [equipo] });
    await getMyTeams()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.GET_MY_TEAMS_COMPLETED, userTeams: [equipo] });
  });

  it('getMyTeams emite error cuando no ok', async () => {
    backend.teamService.getMyTeams.mockResolvedValue({ ok: false, payload: 'fallo' });
    await getMyTeams()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.TEAMS_ERROR, error: 'fallo' });
  });

  it('updateTeamSuccess crea la accion con el equipo', () => {
    expect(updateTeamSuccess(equipo)).toEqual({ type: actionTypes.UPDATE_TEAM_SUCCESS, payload: equipo });
  });

  it('deleteTeamSuccess crea la accion con el id', () => {
    expect(deleteTeamSuccess(1)).toEqual({ type: actionTypes.DELETE_TEAM_SUCCESS, payload: 1 });
  });

  it('leaveTeamSuccess crea la accion con el id', () => {
    expect(leaveTeamSuccess(1)).toEqual({ type: actionTypes.LEAVE_TEAM_SUCCESS, payload: 1 });
  });
});
