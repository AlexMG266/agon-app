import { getNotifications, getUnreadCount, getNotification, markAsRead, NOTIFICATIONS_UPDATED_EVENT } from './notificationService';

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

  it('getNotifications pide GET /notifications con paginacion', async () => {
    fetch.mockResolvedValue(jsonResponse({ items: [notificacion], existMoreItems: false }));
    const response = await getNotifications(2, 10);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications?page=2&size=10`, expect.anything());
    expect(response.payload).toEqual({ items: [notificacion], existMoreItems: false });
  });

  it('getNotifications usa pagina y tamaño por defecto', async () => {
    fetch.mockResolvedValue(jsonResponse({ items: [], existMoreItems: false }));
    await getNotifications();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications?page=0&size=10`, expect.anything());
  });

  it('getUnreadCount pide GET /notifications/unread-count', async () => {
    fetch.mockResolvedValue(jsonResponse(3));
    const response = await getUnreadCount();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/notifications/unread-count`, expect.anything());
    expect(response.payload).toBe(3);
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
