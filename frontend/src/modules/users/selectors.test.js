import { getUser, isLoggedIn, getUserName } from './selectors';

const user = { id: 1, userName: 'ana', elo: 1000 };

describe('users selectors', () => {
  it('getUser devuelve el usuario', () => {
    expect(getUser({ users: { user } })).toBe(user);
  });

  it('isLoggedIn es false sin usuario', () => {
    expect(isLoggedIn({ users: { user: null } })).toBe(false);
  });

  it('isLoggedIn es true con usuario', () => {
    expect(isLoggedIn({ users: { user } })).toBe(true);
  });

  it('getUserName devuelve el nombre', () => {
    expect(getUserName({ users: { user } })).toBe('ana');
  });

  it('getUserName devuelve null sin sesion', () => {
    expect(getUserName({ users: { user: null } })).toBeNull();
  });
});
