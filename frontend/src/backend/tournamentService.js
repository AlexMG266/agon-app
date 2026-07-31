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

// GET /tournaments/search?filtro=...: busca torneos por nombre (paginado).
export const searchTournaments = async (filtro, page = 0, size = 10, estado = 'ALL') => {
    return await appFetch('GET', `/tournaments/search?filtro=${encodeURIComponent(filtro)}&page=${page}&size=${size}&estado=${encodeURIComponent(estado)}`);
};

// GET /tournaments/by-code/{codigo}: busca un torneo por su código único.
export const getTournamentByCode = async (codigo) => {
    return await appFetch('GET', `/tournaments/by-code/${encodeURIComponent(codigo)}`);
};

// POST /tournaments/{id}/configure: configura estructura del torneo (tipo, grupos, playoff) y genera calendario.
export const configureTournament = async (id, configData) => {
    return await appFetch('POST', `/tournaments/${id}/configure`, configData);
};

// POST /tournaments/{id}/close: cierra las inscripciones del torneo.
export const closeTournament = async (id) => {
    return await appFetch('POST', `/tournaments/${id}/close`);
};

// POST /tournaments/{id}/enroll: solicita inscripción de un equipo en el torneo (con código opcional si es privado).
export const requestEnroll = async (tournamentId, equipoId, codigoTorneo) => {
    const body = { equipoId };
    if (codigoTorneo) {
        body.codigoTorneo = codigoTorneo;
    }
    return await appFetch('POST', `/tournaments/${tournamentId}/enroll`, body);
};

// GET /tournaments/{id}/enrollment-requests: obtiene solicitudes de inscripción pendientes.
export const getPendingRequests = async (tournamentId) => {
    return await appFetch('GET', `/tournaments/${tournamentId}/enrollment-requests`);
};

// GET /tournaments/solicitud/{solicitudId}: obtiene una solicitud de inscripción por su ID.
export const getSolicitud = async (solicitudId) => {
    return await appFetch('GET', `/tournaments/solicitud/${solicitudId}`);
};

// POST /tournaments/{id}/enrollment-requests/{solicitudId}/approve: aprueba una solicitud de inscripción.
export const approveEnrollment = async (tournamentId, solicitudId) => {
    return await appFetch('POST', `/tournaments/${tournamentId}/enrollment-requests/${solicitudId}/approve`);
};

// POST /tournaments/{id}/enrollment-requests/{solicitudId}/reject: rechaza una solicitud de inscripción.
export const rejectEnrollment = async (tournamentId, solicitudId) => {
    return await appFetch('POST', `/tournaments/${tournamentId}/enrollment-requests/${solicitudId}/reject`);
};

// GET /tournaments/followed: obtiene los torneos seguidos por el usuario autenticado.
export const getFollowedTournaments = async () => {
    return await appFetch('GET', '/tournaments/followed');
};

// GET /tournaments/enrolled: obtiene los torneos donde el usuario tiene equipos inscritos.
export const getEnrolledTournaments = async () => {
    return await appFetch('GET', '/tournaments/enrolled');
};

// POST /tournaments/{id}/follow: sigue un torneo.
export const followTournament = async (id) => {
    return await appFetch('POST', `/tournaments/${id}/follow`);
};

// DELETE /tournaments/{id}/follow: deja de seguir un torneo.
export const unfollowTournament = async (id) => {
    return await appFetch('DELETE', `/tournaments/${id}/follow`);
};

// PUT /tournaments/{id}: actualiza los datos editables de un torneo (solo organizador).
export const updateTournament = async (id, data) => {
    return await appFetch('PUT', `/tournaments/${id}`, data);
};

// GET /tournaments/{id}/jornadas: obtiene las jornadas y encuentros de un torneo.
export const getTournamentJornadas = async (id) => {
    return await appFetch('GET', `/tournaments/${id}/jornadas`);
};

// GET /encuentros/mis-partidos: obtiene los encuentros del usuario agrupados por fecha.
export const getMyMatches = async () => {
    return await appFetch('GET', '/encuentros/mis-partidos');
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
    getMyMatches
};
