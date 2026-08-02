import store from './index';
import app from '../modules/app';
import users from '../modules/users';
import teams from '../modules/teams';
import tournaments from '../modules/tournaments';

describe('store/index', () => {
  it('crea el store con los reductores registrados', () => {
    const state = store.getState();
    expect(state.app).toBeDefined();
    expect(state.users).toBeDefined();
    expect(state.teams).toBeDefined();
    expect(state.tournaments).toBeDefined();
  });

  it('despacha LOGOUT y deja el usuario en null', () => {
    store.dispatch(users.actions.loginCompleted({ user: { id: 1, nombre: 'ana' } }));
    expect(store.getState().users.user).toEqual({ id: 1, nombre: 'ana' });
    store.dispatch(users.actions.logout());
    expect(store.getState().users.user).toBeNull();
  });

  it('permite despachar la accion de error de app', () => {
    const error = new Error('fallo');
    store.dispatch(app.actions.error(error));
    expect(store.getState().app.error).toBe(error);
  });

  it('los selectores devuelven valores coherentes', () => {
    expect(teams.selectors).toBeDefined();
    expect(tournaments.selectors).toBeDefined();
  });
});
