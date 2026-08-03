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
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments?filtro=liga%20de%20prueba&page=1&size=20&estado=ALL`, expect.objectContaining({ method: 'GET' }));
  });

  it('getTournamentByCode pide GET /tournaments/by-code/{codigo}', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.getTournamentByCode('ABC123');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/by-code/ABC123`, expect.objectContaining({ method: 'GET' }));
  });

  it('configureTournament envia PATCH con la config', async () => {
    fetch.mockResolvedValue(jsonResponse(torneo));
    await tournamentService.configureTournament(1, config);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/estructura`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify(config)
    }));
  });

  it('closeTournament envia PATCH /tournaments/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.closeTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estado: 'INSCRIPCION_CERRADA' })
    }));
  });

  it('requestEnroll envia el equipo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.requestEnroll(1, 9);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/inscripciones`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ equipoId: 9 })
    }));
  });

  it('requestEnroll incluye el codigo si lo hay', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.requestEnroll(1, 9, 'SECRETO');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/inscripciones`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ equipoId: 9, codigoTorneo: 'SECRETO' })
    }));
  });

  it('getPendingRequests pide GET /tournaments/{id}/inscripciones', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getPendingRequests(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/inscripciones`, expect.objectContaining({ method: 'GET' }));
  });

  it('getSolicitud pide GET /tournaments/inscripciones/{id}', async () => {
    fetch.mockResolvedValue(jsonResponse({}));
    await tournamentService.getSolicitud(3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/inscripciones/3`, expect.objectContaining({ method: 'GET' }));
  });

  it('approveEnrollment envia PATCH con estado APROBADA', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.approveEnrollment(1, 3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/inscripciones/3`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estado: 'APROBADA' })
    }));
  });

  it('rejectEnrollment envia PATCH con estado RECHAZADA', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.rejectEnrollment(1, 3);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/inscripciones/3`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estado: 'RECHAZADA' })
    }));
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

  it('followTournament envia PUT /seguidores/me', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.followTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/seguidores/me`, expect.objectContaining({ method: 'PUT' }));
  });

  it('unfollowTournament envia DELETE /seguidores/me', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.unfollowTournament(1);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/tournaments/1/seguidores/me`, expect.objectContaining({ method: 'DELETE' }));
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

  it('getMyMatches pide GET /encuentros', async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    await tournamentService.getMyMatches();
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros`, expect.objectContaining({ method: 'GET' }));
  });

  it('registerResult envia PUT con los sets', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    const sets = [{ numeroSet: 1, golesLocal: 25, golesVisitante: 20 }];
    await tournamentService.registerResult(1, sets);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/1/resultado`, expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ sets })
    }));
  });

  it('solicitarAplazamiento envia POST con la fecha y el motivo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.solicitarAplazamiento(7, '2026-09-10T19:00', 'no podemos jugar');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/7/aplazamientos`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ fecha: '2026-09-10T19:00', motivo: 'no podemos jugar' })
    }));
  });

  it('solicitarAplazamiento permite omitir el motivo', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.solicitarAplazamiento(7, '2026-09-10T19:00');
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/7/aplazamientos`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ fecha: '2026-09-10T19:00', motivo: undefined })
    }));
  });

  it('responderAplazamiento envia PATCH con aceptar', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.responderAplazamiento(12, true);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/aplazamientos/12`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ aceptar: true })
    }));
  });

  it('responderAplazamiento envia PATCH con rechazar', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 200));
    await tournamentService.responderAplazamiento(12, false);
    expect(fetch).toHaveBeenCalledWith(`${BACKEND}/encuentros/aplazamientos/12`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ aceptar: false })
    }));
  });
});
