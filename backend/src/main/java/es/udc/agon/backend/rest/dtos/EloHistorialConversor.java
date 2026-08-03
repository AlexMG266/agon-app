package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.EloHistorial;
import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Equipo;

import java.util.List;
import java.util.stream.Collectors;

public final class EloHistorialConversor {

    private EloHistorialConversor() {
    }

    public static EloHistorialDto toEloHistorialDto(EloHistorial historial) {
        Encuentro encuentro = historial.getEncuentro();
        Equipo local = encuentro != null ? encuentro.getLocal() : null;
        Equipo visitante = encuentro != null ? encuentro.getVisitante() : null;

        return new EloHistorialDto(
                historial.getId(),
                encuentro != null ? encuentro.getId() : null,
                local != null ? local.getNombreEquipo() : null,
                visitante != null ? visitante.getNombreEquipo() : null,
                historial.getResultado(),
                historial.getEloAnterior(),
                historial.getEloNuevo(),
                historial.getEloNuevo() - historial.getEloAnterior(),
                historial.getFecha()
        );
    }

    public static List<EloHistorialDto> toEloHistorialDtos(List<EloHistorial> historiales) {
        return historiales.stream()
                .map(EloHistorialConversor::toEloHistorialDto)
                .collect(Collectors.toList());
    }
}
