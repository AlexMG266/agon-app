import { appFetch } from './appFetch';

// POST /teams: crea un nuevo equipo.
export const createTeam = async (nombre, descripcion) => {
    return await appFetch('POST', '/teams', { nombreEquipo: nombre, descripcion });
};

// GET /teams: obtiene la lista de equipos del usuario.
export const getMyTeams = async () => {
    return await appFetch('GET', '/teams');
};

// POST /teams/peticiones: solicitar union mediante código.
export const requestJoinWithCode = async (codigoEquipo) => {
    return await appFetch('POST', `/teams/peticiones?codigoEquipo=${codigoEquipo}`, null);
};

// POST /teams/{id}/leave: Abandonar el equipo.
export const leaveTeam = async (teamId) => {
    return await appFetch('POST', `/teams/${teamId}/leave`, null);
};

// POST /teams/{id}/disband: disolver el equipo.
export const dissolveTeam = async (teamId) => {
    return await appFetch('POST', `/teams/${teamId}/disband`, null);
};

// POST /teams/solicitudes/{solicitudId}/responder: aceptar o rechazar solicitud.
export const respondToRequest = async (solicitudId, aceptar) => {
    return await appFetch('POST', `/teams/solicitudes/${solicitudId}/responder`, { aceptar });
};

// POST /teams/{id}/remove-member: eliminar miembro del equipo
export const removeMember = async (teamId, memberId) => {
    return await appFetch('POST', `/teams/${teamId}/remove-member?userId=${memberId}`, null);
};

// GET /teams/{id}/requests: obtener solicitudes pendientes
export const getPendingRequests = async (teamId) => {
    return await appFetch('GET', `/teams/${teamId}/requests`);
};

export default {
    createTeam,
    getMyTeams,
    requestJoinWithCode,
    leaveTeam,
    dissolveTeam,
    respondToRequest,
    removeMember,
    getPendingRequests
};