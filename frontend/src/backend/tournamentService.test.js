import * as tournamentService from './tournamentService';

const BACKEND = 'http://backend.test';

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: name => (name === 'content-type' ? 'application/json' : null) },
  json: async () => payload
});

describe('tournamentService', () => {
  const torneo = { id: 1, nombre: 'liga local' };
  const config = { tipoTorneo: 'LIGA_UNICA', numGrupos: 1 };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createTournament envia POST con los datos', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.createTournament(torneo);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(torneo)
    }));
  });

  it('getMyTournaments pide GET /tournaments/my', async () => {
    fetch.mockResolvedValue(jsonResponse([torneo]));
    await tournamentService.getMyTournaments();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/my`, expect.objectContaining({ method: 'GET' }));
  });

  it('getTournament pide GET /tournaments/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.getTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1`, expect.objectContaining({ method: 'GET' }));
  });

  it('getAllTournaments usa los parametros de paginacion', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getAllTournaments(2, 5, 'ACTIVO');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments?page=2&size=5&estado=ACTIVO`, expect.objectContaining({ method: 'GET' }));
  });

  it('getAllTournaments usa valores por defecto', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getAllTournaments();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments?page=0&size=10&estado=ALL`, expect.objectContaining({ method: 'GET' }));
  });

  it('searchTournaments codifica el filtro', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.searchTournaments('liga de prueba', 1, 20, 'ALL');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/search?filtro=liga%20de%20prueba&page=1&size=20&estado=ALL`, expect.objectContaining({ method: 'GET' }));
  });

  it('getTournamentByCode pide GET /tournaments/by-code/{codigo}', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.getTournamentByCode('ABC123');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/by-code/ABC123`, expect.objectContaining({ method: 'GET' }));
  });

  it('configureTournament envia POST con la config', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.configureTournament(1, config);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/configure`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(config)
    }));
  });

  it('closeTournament envia POST /tournaments/{id}/close', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.closeTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/close`, expect.objectContaining({ method: 'POST' }));
  });

  it('requestEnroll envia el equipo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.requestEnroll(1, 9);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/enroll`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ equipoId: 9 })
    }));
  });

  it('requestEnroll incluye el codigo si lo hay', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.requestEnroll(1, 9, 'SECRETO');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/enroll`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ equipoId: 9, codigoTorneo: 'SECRETO' })
    }));
  });

  it('getPendingRequests pide GET /tournaments/{id}/enrollment-requests', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getPendingRequests(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/enrollment-requests`, expect.objectContaining({ method: 'GET' }));
  });

  it('getSolicitud pide GET /tournaments/solicitud/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse({}));
    await tournamentService.getSolicitud(3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/solicitud/3`, expect.objectContaining({ method: 'GET' }));
  });

  it('approveEnrollment envia POST approve', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.approveEnrollment(1, 3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/enrollment-requests/3/approve`, expect.objectContaining({ method: 'POST' }));
  });

  it('rejectEnrollment envia POST reject', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.rejectEnrollment(1, 3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/enrollment-requests/3/reject`, expect.objectContaining({ method: 'POST' }));
  });

  it('getFollowedTournaments pide GET /tournaments/followed', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getFollowedTournaments();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/followed`, expect.objectContaining({ method: 'GET' }));
  });

  it('getEnrolledTournaments pide GET /tournaments/enrolled', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getEnrolledTournaments();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/enrolled`, expect.objectContaining({ method: 'GET' }));
  });

  it('followTournament envia POST follow', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.followTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/follow`, expect.objectContaining({ method: 'POST' }));
  });

  it('unfollowTournament envia DELETE follow', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.unfollowTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/follow`, expect.objectContaining({ method: 'DELETE' }));
  });

  it('updateTournament envia PUT con los datos', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.updateTournament(1, { nombre: 'editado' });
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1`, expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ nombre: 'editado' })
    }));
  });

  it('getTournamentJornadas pide GET /tournaments/{id}/jornadas', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getTournamentJornadas(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/jornadas`, expect.objectContaining({ method: 'GET' }));
  });

  it('getMyMatches pide GET /encuentros/mis-partidos', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getMyMatches();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/mis-partidos`, expect.objectContaining({ method: 'GET' }));
  });

  it('registerResult envia POST con los sets', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    const sets = [{ numeroSet: 1, golesLocal: 25, golesVisitante: 20 }];
    await tournamentService.registerResult(1, sets);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/1/resultado`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ sets })
    }));
  });

  it('solicitarAplazamiento envia POST con la fecha y el motivo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.solicitarAplazamiento(7, '2026-09-10T19:00', 'no podemos jugar');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/7/aplazar`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ fecha: '2026-09-10T19:00', motivo: 'no podemos jugar' })
    }));
  });

  it('solicitarAplazamiento permite omitir el motivo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.solicitarAplazamiento(7, '2026-09-10T19:00');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/7/aplazar`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ fecha: '2026-09-10T19:00', motivo: undefined })
    }));
  });

  it('responderAplazamiento envia POST con aceptar', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.responderAplazamiento(12, true);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/solicitudes-aplazamiento/12/responder`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ aceptar: true })
    }));
  });

  it('responderAplazamiento envia POST con rechazar', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.responderAplazamiento(12, false);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/solicitudes-aplazamiento/12/responder`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ aceptar: false })
    }));
  });
});
