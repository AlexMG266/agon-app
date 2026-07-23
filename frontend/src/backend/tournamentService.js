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

// GET /tournaments: obtiene todos los torneos del sistema.
export const getAllTournaments = async () => {
    return await appFetch('GET', '/tournaments');
};

// GET /tournaments/search?filtro=...: busca torneos por nombre.
export const searchTournaments = async (filtro) => {
    return await appFetch('GET', `/tournaments/search?filtro=${encodeURIComponent(filtro)}`);
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

// POST /tournaments/{id}/enroll: inscribe un equipo en el torneo (con código opcional si es privado).
export const enrollTeam = async (tournamentId, equipoId, codigoTorneo) => {
    const body = { equipoId };
    if (codigoTorneo) {
        body.codigoTorneo = codigoTorneo;
    }
    return await appFetch('POST', `/tournaments/${tournamentId}/enroll`, body);
};

export default {
    createTournament,
    getMyTournaments,
    getTournament,
    getAllTournaments,
    searchTournaments,
    getTournamentByCode,
    configureTournament,
    closeTournament,
    enrollTeam
};
