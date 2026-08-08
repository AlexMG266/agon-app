package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Solicitud;
import es.udc.agon.backend.model.entities.User;

import java.time.ZoneOffset;
import java.util.stream.Collectors;
import java.util.List;

public class EquipoConversor {

    private EquipoConversor() {
    }

    public static EquipoDto toEquipoDto(Equipo equipo) {
        return toEquipoDto(equipo, 0);
    }

    public static EquipoDto toEquipoDto(Equipo equipo, long numPartidas) {
        return new EquipoDto(
                equipo.getId(),
                equipo.getNombreEquipo(),
                equipo.getDescripcion(),
                equipo.getEstado().name(),
                equipo.getCreador().getId(),
                equipo.getCodigoEquipo(),
                equipo.getMiembros().stream()
                    .map(UserConversor::toUserDto)
                    .collect(Collectors.toList()),
                equipo.getFechaCreacion() != null
                    ? equipo.getFechaCreacion().toInstant(ZoneOffset.UTC).toEpochMilli()
                    : null,
                numPartidas
        );
    }

    public static List<EquipoDto> toEquipoDtos(List<Equipo> equipos) {
        return equipos.stream().map(EquipoConversor::toEquipoDto).collect(Collectors.toList());
    }

    public static SolicitudDto toSolicitudDto(Solicitud solicitud) {
        return new SolicitudDto(
                solicitud.getId(),
                solicitud.getCandidato().getId(),
                solicitud.getDecisor().getId(),
                solicitud.getEquipo().getId(),
                solicitud.getEstado().name(),
                solicitud.getTipoSolicitud().name(),
                solicitud.getFechaCreacion().toInstant(ZoneOffset.UTC).toEpochMilli());
    }
}