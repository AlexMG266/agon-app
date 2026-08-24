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

    Torneo configurarEstructuraYGenerarCalendario(Long torneoId, TipoTorneo tipoTorneo,
                                                   int numGrupos, int equiposPorGrupo,
                                                   boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                   String estrategiaPlayoff, Integer diasEntrePlayoff,
                                                   String fechaFin)
            throws InstanceNotFoundException, IllegalArgumentException;

    /**
     * Configura la estructura del torneo y genera el calendario. {@code rondaInicioPlayoff}
     * determina la ronda a la que arrancan las eliminatorias (FINAL, SEMIFINALES, CUARTOS,
     * OCTAVOS, DIECISEISAVOS). Si es {@code null} o no se indica, se elige automáticamente
     * la ronda más alta posible según el número de grupos (deben clasificarse un número de
     * equipos que sea potencia de 2, sin byes).
     */
    Torneo configurarEstructuraYGenerarCalendario(Long torneoId, TipoTorneo tipoTorneo,
                                                   int numGrupos, int equiposPorGrupo,
                                                   boolean tienePlayoff, boolean idaVueltaPlayoff,
                                                   String estrategiaPlayoff, Integer diasEntrePlayoff,
                                                   String fechaFin, String rondaInicioPlayoff)
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

    Solicitud obtenerSolicitud(Long solicitudId) throws InstanceNotFoundException;

    /**
     * Genera automaticamente el calendario de playoffs (eliminatorias) del torneo
     * con los equipos clasificados de la fase de grupos (los 2 mejores de cada grupo).
     *
     * @param torneoId id del torneo.
     * @throws InstanceNotFoundException si el torneo no existe.
     * @throws IllegalArgumentException  si el torneo no tiene playoffs configurados,
     *                                   si la fase de grupos no esta completa o si ya hay playoffs generados.
     */
    List<Jornada> generarPlayoffs(Long torneoId) throws InstanceNotFoundException, IllegalArgumentException;
}
