import { getTournamentError, getUserTournaments, getFollowedTournaments, getEnrolledTournaments } from './selectors';

const torneo = { id: 1, nombre: 'liga' };

describe('tournaments selectors', () => {
  it('obtiene el error', () => {
    expect(getTournamentError({ tournaments: { error: 'fallo' } })).toBe('fallo');
  });

  it('obtiene los torneos del usuario', () => {
    expect(getUserTournaments({ tournaments: { userTournaments: [torneo] } })).toEqual([torneo]);
  });

  it('obtiene los seguidos', () => {
    expect(getFollowedTournaments({ tournaments: { followedTournaments: [torneo] } })).toEqual([torneo]);
  });

  it('obtiene los inscritos', () => {
    expect(getEnrolledTournaments({ tournaments: { enrolledTournaments: [torneo] } })).toEqual([torneo]);
  });
});
