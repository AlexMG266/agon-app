import reducer from './reducer';
import * as actionTypes from './actionTypes';

const user = { id: 1, userName: 'ana', elo: 1000 };

describe('users reducer', () => {
  it('devuelve el estado inicial', () => {
    expect(reducer(undefined, {})).toEqual({ user: null });
  });

  it('guarda el usuario en SIGN_UP_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.SIGN_UP_COMPLETED, authenticatedUser: { user } }))
      .toEqual({ user });
  });

  it('guarda el usuario en LOGIN_COMPLETED', () => {
    expect(reducer(undefined, { type: actionTypes.LOGIN_COMPLETED, authenticatedUser: { user } }))
      .toEqual({ user });
  });

  it('limpia el usuario en LOGOUT', () => {
    expect(reducer({ user }, { type: actionTypes.LOGOUT })).toEqual({ user: null });
  });

  it('actualiza el perfil en UPDATE_PROFILE_COMPLETED', () => {
    const actualizado = { ...user, userName: 'ana2' };
    expect(reducer({ user }, { type: actionTypes.UPDATE_PROFILE_COMPLETED, user: actualizado }))
      .toEqual({ user: actualizado });
  });
});
