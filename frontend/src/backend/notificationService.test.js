import { getNotifications, getNotification, markAsRead, NOTIFICATIONS_UPDATED_EVENT } from './notificationService';

const BACKEND = 'http://backend.test';

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: name => (name === 'content-type' ? 'application/json' : null) },
  json: async () => payload
});

describe('notificationService', () => {
  const notificacion = { id: 1, asunto: 'partido', leido: false };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('getNotifications pide GET /notifications', async () => {
    fetch.mockResolvedValue(jsonResponse([notificacion]));
    const response = await getNotifications();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications`, expect.anything());
    expect(response.payload).toEqual([notificacion]);
  });

  it('getNotification pide GET /notifications/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse(notificacion));
    const response = await getNotification(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications/1`, expect.anything());
    expect(response.payload).toEqual(notificacion);
  });

  it('markAsRead envia PUT y emite el evento al leer', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await markAsRead(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications/1`, expect.objectContaining({ method: 'PUT' }));
    const evento = window.dispatchEvent.mock.calls.find(([e]) => e.type === NOTIFICATIONS_UPDATED_EVENT);
    expect(evento).toBeDefined();
  });

  it('markAsRead no emite el evento si falla', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 403));
    await markAsRead(1);
    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });
});
