package es.udc.agon.backend.rest.dtos;

import es.udc.agon.backend.model.entities.Inscripcion;
import es.udc.agon.backend.model.entities.Torneo;

import java.util.List;
import java.util.stream.Collectors;

public class TorneoConversor {

    private TorneoConversor() {
    }

    public static TorneoDto toTorneoDto(Torneo torneo) {
        List<Inscripcion> inscripciones = torneo.getInscripciones();
        int numInscritos = (inscripciones != null) ? inscripciones.size() : 0;
        return new TorneoDto(
                torneo.getId(),
                torneo.getNombre(),
                torneo.getNumGrupos() != null ? torneo.getNumGrupos() : 0,
                torneo.getEquiposPorGrupo() != null ? torneo.getEquiposPorGrupo() : 0,
                torneo.getTienePlayoff() != null ? torneo.getTienePlayoff() : false,
                torneo.getEstado().name(),
                torneo.getOrganizador().getId(),
                torneo.getOrganizador().getNombre(),
                torneo.getTipoTorneo(),
                torneo.getIdaVueltaPlayoff() != null ? torneo.getIdaVueltaPlayoff() : false,
                numInscritos
        );
    }

    public static List<TorneoDto> toTorneoDtos(List<Torneo> torneos) {
        return torneos.stream()
                .map(TorneoConversor::toTorneoDto)
                .collect(Collectors.toList());
    }
}
