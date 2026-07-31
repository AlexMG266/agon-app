package es.udc.agon.backend.rest.controllers;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.rest.dtos.FechaEncuentrosDto;
import es.udc.agon.backend.rest.dtos.TorneoConversor;

@RestController
@RequestMapping("/encuentros")
@Tag(name = "Encuentro Controller", description = "Endpoints para la consulta de encuentros del usuario")
@SecurityRequirement(name = "bearerAuth")
public class EncuentroController {

    @Autowired
    private IEncuentroService encuentroService;

    @GetMapping("/mis-partidos")
    @Operation(
            summary = "Obtener los encuentros del usuario agrupados por fecha",
            description = "Recupera todos los encuentros de los equipos del usuario autenticado, " +
                    "agrupados por fecha de realización y ordenados cronológicamente."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de encuentros agrupados por fecha",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = FechaEncuentrosDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado (Token JWT faltante o inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario autenticado no encontrado en el sistema",
                    content = @Content)
    })
    public List<FechaEncuentrosDto> obtenerMisPartidos(
            @Parameter(hidden = true) @RequestAttribute Long userId) throws InstanceNotFoundException {

        // genera de forma idempotente los recordatorios de partidos próximos del usuario
        encuentroService.generarRecordatoriosPartidos(userId);

        return TorneoConversor.toFechaEncuentrosDtos(encuentroService.consultarEncuentrosPropios(userId));
    }
}
