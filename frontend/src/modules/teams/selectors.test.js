import { getError } from './selectors';

describe('teams selectors', () => {
  it('lee el error de state.app (comportamiento actual)', () => {
    expect(getError({ app: { error: 'fallo de app' } })).toBe('fallo de app');
  });

  it('no lee el error de state.teams', () => {
    expect(getError({ app: { error: null }, teams: { error: 'fallo de teams' } })).toBeNull();
  });
});
