import { appFetch } from './appFetch';

// POST /teams: crea un nuevo equipo.
export const createTeam = async (nombre, descripcion) => {
    return await appFetch('POST', '/teams', { nombreEquipo: nombre, descripcion });
};

// GET /teams: obtiene la lista de equipos del usuario.
export const getMyTeams = async () => {
    return await appFetch('GET', '/teams');
};

// GET /teams/{id}: obtiene un equipo por su ID.
export const getTeam = async (id) => {
    return await appFetch('GET', `/teams/${id}`);
};

// GET /teams/by-code/{codigo}: busca un equipo por su código de invitación (previsualización).
export const getTeamByCode = async (codigoEquipo) => {
    return await appFetch('GET', `/teams/by-code/${codigoEquipo}`);
};

// PUT /teams/{id}: actualiza un equipo.
export const updateTeam = async (id, data) => {
    return await appFetch('PUT', `/teams/${id}`, data);
};

// DELETE /teams/{id}: elimina un equipo.
export const deleteTeam = async (id) => {
    return await appFetch('DELETE', `/teams/${id}`);
};

// POST /teams/solicitudes: solicitar union mediante código.
export const requestJoinWithCode = async (codigoEquipo) => {
    return await appFetch('POST', '/teams/solicitudes', { codigoEquipo });
};

// DELETE /teams/{id}/miembros/me: Abandonar el equipo.
export const leaveTeam = async (teamId) => {
    return await appFetch('DELETE', `/teams/${teamId}/miembros/me`);
};

// DELETE /teams/{id}: disolver el equipo.
export const dissolveTeam = async (teamId) => {
    return await appFetch('DELETE', `/teams/${teamId}`);
};

// PATCH /teams/solicitudes/{solicitudId}: aceptar o rechazar solicitud.
export const respondToRequest = async (solicitudId, aceptar) => {
    return await appFetch('PATCH', `/teams/solicitudes/${solicitudId}`, { aceptar });
};

// DELETE /teams/{id}/miembros/{memberId}: expulsar a un miembro del equipo (solo capitán).
export const kickMember = async (teamId, memberId) => {
    return await appFetch('DELETE', `/teams/${teamId}/miembros/${memberId}`);
};

export default {
    createTeam,
    getMyTeams,
    getTeam,
    getTeamByCode,
    updateTeam,
    deleteTeam,
    requestJoinWithCode,
    leaveTeam,
    dissolveTeam,
    respondToRequest,
    kickMember
};
