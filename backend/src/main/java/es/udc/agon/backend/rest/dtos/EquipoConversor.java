package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.entities.User;

import java.time.ZoneOffset;
import java.util.stream.Collectors;
import java.util.List;

public class EquipoConversor {

    private EquipoConversor() {
    }

    public static EquipoDto toEquipoDto(Equipo equipo) {
        return new EquipoDto(
                equipo.getId(),
                equipo.getNombreEquipo(),
                equipo.getEstado().name(),
                equipo.getCreador().getId(),
                equipo.getMiembros().stream().map(User::getId).collect(Collectors.toList()));
    }

    public static List<EquipoDto> toEquipoDtos(List<Equipo> equipos) {
        return equipos.stream().map(EquipoConversor::toEquipoDto).collect(Collectors.toList());
    }

    public static InvitacionDto toInvitacionDto(Invitacion invitacion) {
        return new InvitacionDto(
                invitacion.getId(),
                invitacion.getUsuarioDestino().getId(),
                invitacion.getUsuarioRemitente().getId(),
                invitacion.getEquipo().getId(),
                invitacion.getEstado().name(),
                invitacion.getFechaEnvio().toInstant(ZoneOffset.UTC).toEpochMilli());
    }
}
