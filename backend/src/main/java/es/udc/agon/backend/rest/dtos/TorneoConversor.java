package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.Torneo;

import java.util.List;
import java.util.stream.Collectors;

public class TorneoConversor {

    private TorneoConversor() {
    }

    public static TorneoDto toTorneoDto(Torneo torneo) {
        return new TorneoDto(
                torneo.getId(),
                torneo.getNombre(),
                torneo.getNumGrupos(),
                torneo.getEquiposPorGrupo(),
                torneo.isTienePlayoff(),
                torneo.getEstado().name(),
                torneo.getOrganizador().getId(),
                torneo.getOrganizador().getNombre()
        );
    }

    public static List<TorneoDto> toTorneoDtos(List<Torneo> torneos) {
        return torneos.stream()
                .map(TorneoConversor::toTorneoDto)
                .collect(Collectors.toList());
    }
}
