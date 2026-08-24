package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.EstadoEncuentro;
import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.Jornada;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.entities.Torneo;
import es.udc.agon.backend.model.services.Block;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TorneoConversor {

    private TorneoConversor() {
    }

    public static TorneoDto toTorneoDto(Torneo torneo) {
        List<Inscripcion> inscripciones = torneo.getInscripciones();
        int numInscritos = (inscripciones != null) ? inscripciones.size() : 0;

        List<InscripcionDto> inscripcionDtos = null;
        if (inscripciones != null) {
            inscripcionDtos = inscripciones.stream()
                    .map(ins -> {
                        int pj = ins.getPartidosJugados();
                        int pg = ins.getPartidosGanados();
                        int pe = ins.getPartidosEmpatados();
                        int pp = ins.getPartidosPerdidos();
                        int sg = ins.getSetsGanados();
                        int sp = ins.getSetsPerdidos();
                        return new InscripcionDto(
                                ins.getEquipo().getId(),
                                ins.getEquipo().getNombreEquipo(),
                                ins.getEquipo().getCreador().getId(),
                                ins.getEquipo().getMiembros().stream()
                                        .map(UserConversor::toUserDto)
                                        .collect(Collectors.toList()),
                                ins.getGrupo() != null ? ins.getGrupo().getId() : null,
                                ins.getGrupo() != null ? ins.getGrupo().getNombreGrupo() : null,
                                pj, pg, pe, pp, sg, sp, sg - sp, ins.getPuntosLiga()
                        );
                    })
                    .collect(Collectors.toList());
        }

        List<String> diasList = null;
        if (torneo.getDiasDisponibles() != null && !torneo.getDiasDisponibles().isEmpty()) {
            diasList = List.of(torneo.getDiasDisponibles().split(","));
        }
        List<String> fechasExcluidasList = null;
        if (torneo.getFechasExcluidas() != null && !torneo.getFechasExcluidas().isEmpty()) {
            fechasExcluidasList = List.of(torneo.getFechasExcluidas().split(","));
        }

        return new TorneoDto(
                torneo.getId(),
                torneo.getNombre(),
                torneo.getNumGrupos() != null ? torneo.getNumGrupos() : 0,
                torneo.getEquiposPorGrupo() != null ? torneo.getEquiposPorGrupo() : 0,
                torneo.getTienePlayoff() != null ? torneo.getTienePlayoff() : false,
                torneo.getEstado().name(),
                torneo.getOrganizador().getId(),
                torneo.getOrganizador().getNombre(),
                torneo.getTipoTorneo() != null ? torneo.getTipoTorneo().name() : null,
                torneo.getIdaVueltaPlayoff() != null ? torneo.getIdaVueltaPlayoff() : false,
                numInscritos,
                torneo.getPrivado() != null ? torneo.getPrivado() : false,
                torneo.getCodigoTorneo(),
                inscripcionDtos,
                torneo.getFechaInicio(),
                torneo.getFechaFin(),
                torneo.getFechaLimiteInscripcion(),
                torneo.getPuntosVictoria(),
                torneo.getPuntosEmpate(),
                torneo.getPuntosDerrota(),
                torneo.getFormatoPartidos(),
                diasList,
                torneo.getHoraInicio(),
                torneo.getHoraFin(),
                torneo.getDuracionPartido(),
                fechasExcluidasList,
                torneo.getEstrategiaDistribucion() != null
                        ? torneo.getEstrategiaDistribucion().name() : null,
                torneo.getDiasEntreJornadas(),
                torneo.getEstrategiaPlayoff() != null
                        ? torneo.getEstrategiaPlayoff().name() : null,
                torneo.getDiasEntrePlayoff(),
                torneo.getRondaInicioPlayoff() != null
                        ? torneo.getRondaInicioPlayoff().name() : null
        );
    }

    public static List<TorneoDto> toTorneoDtos(List<Torneo> torneos) {
        return torneos.stream()
                .map(TorneoConversor::toTorneoDto)
                .collect(Collectors.toList());
    }

    public static JornadaDto toJornadaDto(Jornada jornada) {
        List<EncuentroDto> encuentroDtos = null;
        if (jornada.getEncuentros() != null) {
            encuentroDtos = jornada.getEncuentros().stream()
                    .map(TorneoConversor::toEncuentroDto)
                    .collect(Collectors.toList());
        }
        String tipoFase = jornada.getTipoFase() != null ? jornada.getTipoFase().name() : null;
        return new JornadaDto(
            jornada.getId(),
            jornada.getNumeroJornada(),
            tipoFase,
            jornada.getFechaInicio(),
            jornada.getFechaFin(),
            encuentroDtos
        );
    }

    public static List<JornadaDto> toJornadaDtos(List<Jornada> jornadas) {
        return jornadas.stream()
                .map(TorneoConversor::toJornadaDto)
                .collect(Collectors.toList());
    }

    public static BlockDto<TorneoDto> toBlockTorneoDtos(Block<Torneo> block) {
        List<TorneoDto> dtos = block.getItems().stream()
                .map(TorneoConversor::toTorneoDto)
                .collect(Collectors.toList());
        return new BlockDto<>(dtos, block.getExistMoreItems());
    }

    /**
     * Convierte los encuentros de un usuario en una lista de grupos por fecha,
     * ordenados cronológicamente de más reciente a más lejana.
     */
    public static List<FechaEncuentrosDto> toFechaEncuentrosDtos(List<Encuentro> encuentros) {
        if (encuentros == null || encuentros.isEmpty()) {
            return new ArrayList<>();
        }

        // agrupar por fecha de realización conservando el orden
        Map<LocalDate, List<EncuentroDto>> porFecha = new LinkedHashMap<>();
        encuentros.stream()
                .sorted(Comparator.comparing(Encuentro::getFechaRealizacion,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(enc -> {
                    LocalDate fecha = enc.getFechaRealizacion() != null
                            ? enc.getFechaRealizacion().toLocalDate()
                            : null;
                    porFecha.computeIfAbsent(fecha, k -> new ArrayList<>())
                            .add(toEncuentroDto(enc));
                });

        return porFecha.entrySet().stream()
                .map(entry -> new FechaEncuentrosDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private static EncuentroDto toEncuentroDto(Encuentro enc) {
        String estado = enc.getEstadoEncuentro() != null ? enc.getEstadoEncuentro().name() : null;

        List<SetDto> setDtos = null;
        if (enc.getSets() != null && !enc.getSets().isEmpty()) {
            setDtos = enc.getSets().stream()
                    .sorted(Comparator.comparingInt(SetEntity::getNumeroSet))
                    .map(set -> new SetDto(set.getNumeroSet(), set.getGolesLocal(), set.getGolesVisitante()))
                    .collect(Collectors.toList());
        }

        Long ganadorId = null;
        if (EstadoEncuentro.JUGADO.equals(enc.getEstadoEncuentro()) && enc.getGanador() != null) {
            ganadorId = enc.getGanador().getId();
        }

        String resultado = null;
        if (EstadoEncuentro.JUGADO.equals(enc.getEstadoEncuentro()) && setDtos != null) {
            int setsLocal = 0;
            int setsVisitante = 0;
            for (SetDto set : setDtos) {
                if (set.getGolesLocal() > set.getGolesVisitante()) {
                    setsLocal++;
                } else {
                    setsVisitante++;
                }
            }
            resultado = setsLocal + "-" + setsVisitante;
        }

        return new EncuentroDto(
                enc.getId(),
                enc.getLocal() != null ? enc.getLocal().getId() : null,
                enc.getLocal() != null ? enc.getLocal().getNombreEquipo() : null,
                enc.getVisitante() != null ? enc.getVisitante().getId() : null,
                enc.getVisitante() != null ? enc.getVisitante().getNombreEquipo() : null,
                estado,
                enc.getFechaRealizacion(),
                setDtos,
                ganadorId,
                resultado
        );
    }
}
