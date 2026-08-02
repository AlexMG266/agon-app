import * as actionTypes from './actionTypes';
import { signUpCompleted, loginCompleted, logout, updateProfileCompleted } from './actions';
import backend from '../../backend';

vi.mock('../../backend', () => ({
  default: {
    userService: {
      logout: vi.fn()
    }
  }
}));

describe('users actions', () => {
  const user = { id: 1, nombre: 'ana' };

  beforeEach(() => {
    backend.userService.logout.mockClear();
  });

  it('signUpCompleted crea la accion con el usuario', () => {
    expect(signUpCompleted(user)).toEqual({ type: actionTypes.SIGN_UP_COMPLETED, authenticatedUser: user });
  });

  it('loginCompleted crea la accion con el usuario', () => {
    expect(loginCompleted(user)).toEqual({ type: actionTypes.LOGIN_COMPLETED, authenticatedUser: user });
  });

  it('updateProfileCompleted crea la accion con el usuario', () => {
    expect(updateProfileCompleted(user)).toEqual({ type: actionTypes.UPDATE_PROFILE_COMPLETED, user });
  });

  it('logout borra el token y emite LOGOUT', () => {
    const action = logout();
    expect(backend.userService.logout).toHaveBeenCalled();
    expect(action).toEqual({ type: actionTypes.LOGOUT });
  });
});
