import * as userService from './userService';
import { getServiceToken, setServiceToken } from './appFetch';

const BACKEND = 'http://backend.test';

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: name => (name === 'content-type' ? 'application/json' : null) },
  json: async () => payload
});

describe('userService', () => {
  const usuario = { id: 1, userName: 'ana', elo: 1000 };
  const respuestaLogin = { serviceToken: 'token-1', user: usuario };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login envia POST y guarda el token', async () => {
    fetch.mockResolvedValue(jsonResponse(respuestaLogin));
    const response = await userService.login('ana', 'pass', () => {});
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/login`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nombre: 'ana', password: 'pass' })
    }));
    expect(getServiceToken()).toBe('token-1');
    expect(response.ok).toBe(true);
    expect(response.payload).toEqual(respuestaLogin);
  });

  it('login sin ok no guarda el token', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'credenciales incorrectas' }, 401));
    const response = await userService.login('ana', 'mal', () => {});
    expect(getServiceToken()).toBeNull();
    expect(response.ok).toBe(false);
  });

  it('tryLoginFromServiceToken devuelve ok false sin token', async () => {
    const response = await userService.tryLoginFromServiceToken(() => {});
    expect(response).toEqual({ ok: false, payload: null });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('tryLoginFromServiceToken devuelve la respuesta con token valido', async () => {
    setServiceToken('token-1');
    fetch.mockResolvedValue(jsonResponse({ user: usuario }));
    const response = await userService.tryLoginFromServiceToken(() => {});
    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/loginFromServiceToken`, expect.anything());
  });

  it('tryLoginFromServiceToken elimina el token si falla', async () => {
    setServiceToken('token-1');
    fetch.mockResolvedValue(jsonResponse({}, 401));
    const response = await userService.tryLoginFromServiceToken(() => {});
    expect(response).toEqual({ ok: false, payload: null });
    expect(getServiceToken()).toBeNull();
  });

  it('signUp envia POST y guarda el token', async () => {
    fetch.mockResolvedValue(jsonResponse({ serviceToken: 'token-2', user: usuario }));
    const response = await userService.signUp(usuario, () => {});
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/signup`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(usuario)
    }));
    expect(getServiceToken()).toBe('token-2');
    expect(response.ok).toBe(true);
  });

  it('logout elimina el token', () => {
    setServiceToken('token-1');
    userService.logout();
    expect(getServiceToken()).toBeNull();
  });

  it('updateProfile envia PUT con el usuario', async () => {
    fetch.mockResolvedValue(jsonResponse(usuario));
    await userService.updateProfile(usuario);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/1`, expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(usuario)
    }));
  });

  it('changePassword envia POST con las passwords', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await userService.changePassword(1, 'old', 'new');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/1/changePassword`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ oldPassword: 'old', newPassword: 'new' })
    }));
  });

  it('getEloHistory envia GET al historial de ELO', async () => {
    const historial = [
      { id: 1, encuentroId: 7, eloAnterior: 800, eloNuevo: 832, variacion: 32, resultado: 'VICTORIA' },
      { id: 2, encuentroId: 8, eloAnterior: 832, eloNuevo: 800, variacion: -32, resultado: 'DERROTA' }
    ];
    fetch.mockResolvedValue(jsonResponse(historial));
    const response = await userService.getEloHistory(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/users/1/elo-history`, expect.objectContaining({
      method: 'GET'
    }));
    expect(response.ok).toBe(true);
    expect(response.payload).toEqual(historial);
  });
});
