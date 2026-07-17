// src/backend/teamService.js
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

// PUT /teams/{id}: actualiza un equipo.
export const updateTeam = async (id, data) => {
    return await appFetch('PUT', `/teams/${id}`, data);
};

// DELETE /teams/{id}: elimina un equipo.
export const deleteTeam = async (id) => {
    return await appFetch('DELETE', `/teams/${id}`);
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
    getTeam,
    updateTeam,
    deleteTeam,
    requestJoinWithCode,
    leaveTeam,
    dissolveTeam,
    respondToRequest,
    removeMember,
    getPendingRequests
};