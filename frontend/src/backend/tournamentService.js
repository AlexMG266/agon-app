import { appFetch } from './appFetch';

// POST /tournaments: crea un nuevo torneo.
export const createTournament = async (tournamentData) => {
    return await appFetch('POST', '/tournaments', tournamentData);
};

// GET /tournaments/my: obtiene la lista de torneos del usuario autenticado.
export const getMyTournaments = async () => {
    return await appFetch('GET', '/tournaments/my');
};

// GET /tournaments/{id}: obtiene un torneo por su ID.
export const getTournament = async (id) => {
    return await appFetch('GET', `/tournaments/${id}`);
};

// GET /tournaments: obtiene todos los torneos del sistema (paginado).
export const getAllTournaments = async (page = 0, size = 10, estado = 'ALL') => {
    return await appFetch('GET', `/tournaments?page=${page}&size=${size}&estado=${encodeURIComponent(estado)}`);
};

// GET /tournaments?filtro=...: busca torneos por nombre (paginado).
export const searchTournaments = async (filtro, page = 0, size = 10, estado = 'ALL') => {
    return await appFetch('GET', `/tournaments?filtro=${encodeURIComponent(filtro)}&page=${page}&size=${size}&estado=${encodeURIComponent(estado)}`);
};

// GET /tournaments/by-code/{codigo}: busca un torneo por su código único.
export const getTournamentByCode = async (codigo) => {
    return await appFetch('GET', `/tournaments/by-code/${encodeURIComponent(codigo)}`);
};

// PATCH /tournaments/{id}/estructura: configura estructura del torneo (tipo, grupos, playoff) y genera calendario.
export const configureTournament = async (id, configData) => {
    return await appFetch('PATCH', `/tournaments/${id}/estructura`, configData);
};

// PATCH /tournaments/{id}: cierra las inscripciones del torneo.
export const closeTournament = async (id) => {
    return await appFetch('PATCH', `/tournaments/${id}`, { estado: 'INSCRIPCION_CERRADA' });
};

// POST /tournaments/{id}/inscripciones: solicita inscripción de un equipo en el torneo (con código opcional si es privado).
export const requestEnroll = async (tournamentId, equipoId, codigoTorneo) => {
    const body = { equipoId };
    if (codigoTorneo) {
        body.codigoTorneo = codigoTorneo;
    }
    return await appFetch('POST', `/tournaments/${tournamentId}/inscripciones`, body);
};

// GET /tournaments/{id}/inscripciones: obtiene solicitudes de inscripción pendientes.
export const getPendingRequests = async (tournamentId) => {
    return await appFetch('GET', `/tournaments/${tournamentId}/inscripciones`);
};

// GET /tournaments/inscripciones/{solicitudId}: obtiene una solicitud de inscripción por su ID.
export const getSolicitud = async (solicitudId) => {
    return await appFetch('GET', `/tournaments/inscripciones/${solicitudId}`);
};

// PATCH /tournaments/{id}/inscripciones/{solicitudId}: aprueba una solicitud de inscripción.
export const approveEnrollment = async (tournamentId, solicitudId) => {
    return await appFetch('PATCH', `/tournaments/${tournamentId}/inscripciones/${solicitudId}`, { estado: 'APROBADA' });
};

// PATCH /tournaments/{id}/inscripciones/{solicitudId}: rechaza una solicitud de inscripción.
export const rejectEnrollment = async (tournamentId, solicitudId) => {
    return await appFetch('PATCH', `/tournaments/${tournamentId}/inscripciones/${solicitudId}`, { estado: 'RECHAZADA' });
};

// GET /tournaments/followed: obtiene los torneos seguidos por el usuario autenticado.
export const getFollowedTournaments = async () => {
    return await appFetch('GET', '/tournaments/followed');
};

// GET /tournaments/enrolled: obtiene los torneos donde el usuario tiene equipos inscritos.
export const getEnrolledTournaments = async () => {
    return await appFetch('GET', '/tournaments/enrolled');
};

// PUT /tournaments/{id}/seguidores/me: sigue un torneo.
export const followTournament = async (id) => {
    return await appFetch('PUT', `/tournaments/${id}/seguidores/me`);
};

// DELETE /tournaments/{id}/seguidores/me: deja de seguir un torneo.
export const unfollowTournament = async (id) => {
    return await appFetch('DELETE', `/tournaments/${id}/seguidores/me`);
};

// PUT /tournaments/{id}: actualiza los datos editables de un torneo (solo organizador).
export const updateTournament = async (id, data) => {
    return await appFetch('PUT', `/tournaments/${id}`, data);
};

// GET /tournaments/{id}/jornadas: obtiene las jornadas y encuentros de un torneo.
export const getTournamentJornadas = async (id) => {
    return await appFetch('GET', `/tournaments/${id}/jornadas`);
};

// GET /encuentros: obtiene los encuentros del usuario agrupados por fecha.
export const getMyMatches = async () => {
    return await appFetch('GET', '/encuentros');
};

// PUT /encuentros/{encuentroId}/resultado: registra el resultado de un encuentro (solo capitanes de los equipos).
export const registerResult = async (encuentroId, sets) => {
    return await appFetch('PUT', `/encuentros/${encuentroId}/resultado`, { sets });
};

// POST /encuentros/{encuentroId}/aplazamientos: solicita el aplazamiento de un encuentro a una nueva fecha.
export const solicitarAplazamiento = async (encuentroId, fecha, motivo) => {
    return await appFetch('POST', `/encuentros/${encuentroId}/aplazamientos`, { fecha, motivo });
};

// PATCH /encuentros/aplazamientos/{solicitudId}: acepta o rechaza una solicitud de aplazamiento.
export const responderAplazamiento = async (solicitudId, aceptar) => {
    return await appFetch('PATCH', `/encuentros/aplazamientos/${solicitudId}`, { aceptar });
};

export default {
    getSolicitud,
    createTournament,
    getMyTournaments,
    getTournament,
    getAllTournaments,
    searchTournaments,
    getTournamentByCode,
    configureTournament,
    closeTournament,
    requestEnroll,
    getPendingRequests,
    approveEnrollment,
    rejectEnrollment,
    getFollowedTournaments,
    getEnrolledTournaments,
    followTournament,
    unfollowTournament,
    updateTournament,
    getTournamentJornadas,
    getMyMatches,
    registerResult,
    solicitarAplazamiento,
    responderAplazamiento
};
