import { appFetch } from './appFetch';

// POST /tournaments: crea un nuevo torneo.
export const createTournament = async (tournamentData) => {
    return await appFetch('POST', '/tournaments', tournamentData);
};

// GET /tournaments: obtiene la lista de torneos del usuario.
export const getMyTournaments = async () => {
    return await appFetch('GET', '/tournaments');
};

// GET /tournaments/{id}: obtiene un torneo por su ID.
export const getTournament = async (id) => {
    return await appFetch('GET', `/tournaments/${id}`);
};

// GET /tournaments/search?filtro=...: busca torneos por nombre.
export const searchTournaments = async (filtro) => {
    return await appFetch('GET', `/tournaments/search?filtro=${encodeURIComponent(filtro)}`);
};

export default {
    createTournament,
    getMyTournaments,
    getTournament,
    searchTournaments
};
