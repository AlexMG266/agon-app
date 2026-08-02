import * as teamService from './teamService';

const BACKEND = 'http://backend.test';

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: name => (name === 'content-type' ? 'application/json' : null) },
  json: async () => payload
});

describe('teamService', () => {
  const equipo = { id: 1, nombreEquipo: 'los cracks' };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createTeam envia POST con nombre y descripcion', async () => {
    fetch.mockResolvedValue(jsonResponse(equipo));
    const response = await teamService.createTeam('los cracks', 'equipo nuevo');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nombreEquipo: 'los cracks', descripcion: 'equipo nuevo' })
    }));
    expect(response.payload).toEqual(equipo);
  });

  it('getMyTeams pide GET /teams', async () => {
    fetch.mockResolvedValue(jsonResponse([equipo]));
    await teamService.getMyTeams();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams`, expect.objectContaining({ method: 'GET' }));
  });

  it('getTeam pide GET /teams/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse(equipo));
    await teamService.getTeam(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1`, expect.objectContaining({ method: 'GET' }));
  });

  it('getTeamByCode pide GET /teams/by-code/{codigo}', async () => {
    fetch.mockResolvedValue(jsonResponse(equipo));
    await teamService.getTeamByCode('ABC123');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/by-code/ABC123`, expect.objectContaining({ method: 'GET' }));
  });

  it('updateTeam envia PUT con los datos', async () => {
    fetch.mockResolvedValue(jsonResponse(equipo));
    await teamService.updateTeam(1, { descripcion: 'nueva' });
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1`, expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ descripcion: 'nueva' })
    }));
  });

  it('deleteTeam envia DELETE', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.deleteTeam(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1`, expect.objectContaining({ method: 'DELETE' }));
  });

  it('requestJoinWithCode envia POST con el codigo como query', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.requestJoinWithCode('ABC123');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/peticiones?codigoEquipo=ABC123`, expect.objectContaining({ method: 'POST' }));
  });

  it('leaveTeam envia POST /teams/{id}/leave', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.leaveTeam(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1/leave`, expect.objectContaining({ method: 'POST' }));
  });

  it('dissolveTeam envia POST /teams/{id}/disband', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.dissolveTeam(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1/disband`, expect.objectContaining({ method: 'POST' }));
  });

  it('respondToRequest envia POST con aceptar', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.respondToRequest(7, true);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/solicitudes/7/responder`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ aceptar: true })
    }));
  });

  it('kickMember envia POST /teams/{id}/members/{memberId}/kick', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await teamService.kickMember(1, 2);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/teams/1/members/2/kick`, expect.objectContaining({ method: 'POST' }));
  });
});
