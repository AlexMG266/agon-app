package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;

import java.util.List;

public interface TorneoService {

    Block<Torneo> buscarTorneos(String filtro, String estadoFilter, int page, int size);

    List<Torneo> obtenerTorneosOrganizador(Long organizadorId);

    List<Torneo> obtenerTorneosSeguidos(Long usuarioId);

    List<Torneo> obtenerTorneosInscritos(Long usuarioId);

    void seguirTorneo(Long usuarioId, Long torneoId)
            throws InstanceNotFoundException, IllegalArgumentException;

    void dejarDeSeguirTorneo(Long usuarioId, Long torneoId);

    Torneo consultarTorneo(Long torneoId) throws InstanceNotFoundException;

    Torneo crearTorneo(Long organizadorId, Torneo torneo, Boolean privado) throws InstanceNotFoundException;

    Solicitud solicitarInscripcion(Long capitanId, Long torneoId, Long equipoId, String codigoTorneo)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    Inscripcion aprobarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    void rechazarInscripcion(Long organizadorId, Long solicitudId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    void cerrarInscripciones(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    Torneo configurarEstructuraYGenerarCalendario(Long torneoId, String tipoTorneo,
                                                   int numGrupos, int equiposPorGrupo,
                                                   boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                   String estrategiaPlayoff, Integer diasEntrePlayoff,
                                                   String fechaFin)
            throws InstanceNotFoundException, IllegalArgumentException;

    void generarCalendario(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;

    Torneo buscarPorCodigo(String codigoTorneo) throws InstanceNotFoundException;

    String generarCodigoQR(Long torneoId) throws InstanceNotFoundException;

    void gestionarJornadas(Long torneoId, Long jornadaId, EstadoJornada nuevoEstado)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException;

    List<Solicitud> obtenerSolicitudesPendientes(Long torneoId);

    Torneo actualizarTorneo(Long userId, Long torneoId, Torneo datos)
            throws InstanceNotFoundException, PermissionException;

    List<Jornada> obtenerJornadas(Long torneoId);
}
