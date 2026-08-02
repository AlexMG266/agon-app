import * as actionTypes from './actionTypes';
import { createTournament, clearTournamentError, getMyTournaments, getFollowedTournaments, getEnrolledTournaments } from './actions';
import backend from '../../backend';

vi.mock('../../backend', () => ({
  default: {
    tournamentService: {
      getMyTournaments: vi.fn(),
      getFollowedTournaments: vi.fn(),
      getEnrolledTournaments: vi.fn()
    }
  }
}));

describe('tournaments actions', () => {
  const dispatch = vi.fn();
  const torneo = { id: 1, nombre: 'liga' };

  beforeEach(() => {
    dispatch.mockClear();
    backend.tournamentService.getMyTournaments.mockReset();
    backend.tournamentService.getFollowedTournaments.mockReset();
    backend.tournamentService.getEnrolledTournaments.mockReset();
  });

  it('createTournament crea la accion con los datos y callbacks', () => {
    const onSuccess = vi.fn();
    const onErrors = vi.fn();
    expect(createTournament(torneo, onSuccess, onErrors)).toEqual({
      type: actionTypes.CREATE_TOURNAMENT_COMPLETED,
      payload: torneo,
      onSuccess,
      onErrors
    });
  });

  it('clearTournamentError crea la accion', () => {
    expect(clearTournamentError()).toEqual({ type: actionTypes.CLEAR_TOURNAMENT_ERROR });
  });

  it('getMyTournaments guarda los torneos cuando ok', async () => {
    backend.tournamentService.getMyTournaments.mockResolvedValue({ ok: true, payload: [torneo] });
    await getMyTournaments()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.GET_MY_TOURNAMENTS_COMPLETED, userTournaments: [torneo] });
  });

  it('getMyTournaments emite error cuando no ok', async () => {
    backend.tournamentService.getMyTournaments.mockResolvedValue({ ok: false, payload: 'fallo' });
    await getMyTournaments()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.TOURNAMENTS_ERROR, error: 'fallo' });
  });

  it('getFollowedTournaments guarda los seguidos cuando ok', async () => {
    backend.tournamentService.getFollowedTournaments.mockResolvedValue({ ok: true, payload: [torneo] });
    await getFollowedTournaments()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.GET_FOLLOWED_TOURNAMENTS_COMPLETED, followedTournaments: [torneo] });
  });

  it('getEnrolledTournaments guarda los inscritos cuando ok', async () => {
    backend.tournamentService.getEnrolledTournaments.mockResolvedValue({ ok: true, payload: [torneo] });
    await getEnrolledTournaments()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.GET_ENROLLED_TOURNAMENTS_COMPLETED, enrolledTournaments: [torneo] });
  });
});
