package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.SetEntity;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.IEncuentroService;
import es.udc.agon.backend.rest.dtos.AplazamientoDto;
import es.udc.agon.backend.rest.dtos.EncuentroDto;
import es.udc.agon.backend.rest.dtos.SetDto;

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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/encounters")
@Tag(name = "Encuentro Controller", description = "Endpoints para la gestión de partidos (consulta, registro de resultados, aplazamientos)")
@SecurityRequirement(name = "bearerAuth")
public class EncuentroController {

    @Autowired
    private IEncuentroService encuentroService;

    @GetMapping("/my")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Consultar encuentros propios",
            description = "Recupera todos los encuentros en los que participa algún equipo del usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de encuentros recuperada con éxito",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EncuentroDto.class)))),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content)
    })
    public List<EncuentroDto> consultarEncuentrosPropios(
            @Parameter(hidden = true) @RequestAttribute Long userId) {
        List<Encuentro> encuentros = encuentroService.consultarEncuentrosPropios(userId);
        return toEncuentroDtos(encuentros);
    }

    @PostMapping("/{id}/result")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Registrar resultado de un encuentro",
            description = "Registra el resultado de un encuentro proporcionando la lista de sets jugados."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultado registrado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos (sets vacíos, goles negativos, set empatado o encuentro ya jugado)",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Encuentro no encontrado",
                    content = @Content)
    })
    public void registrarResultado(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del encuentro", example = "1") @PathVariable Long id,
            @RequestBody List<SetDto> sets)
            throws InstanceNotFoundException, IllegalArgumentException {
        List<SetEntity> setEntities = toSetEntities(sets);
        encuentroService.registrarResultado(id, setEntities);
    }

    @PostMapping("/{id}/postpone")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Solicitar aplazamiento de un encuentro",
            description = "Permite al capitán de uno de los equipos solicitar el aplazamiento del encuentro con una nueva fecha y motivo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud de aplazamiento creada con éxito"),
            @ApiResponse(responseCode = "400", description = "El encuentro ya fue jugado o la fecha es inválida",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "El usuario no es capitán de ninguno de los equipos participantes",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Encuentro no encontrado",
                    content = @Content)
    })
    public void solicitarAplazamiento(
            @Parameter(hidden = true) @RequestAttribute Long userId,
            @Parameter(description = "ID del encuentro", example = "1") @PathVariable Long id,
            @RequestBody AplazamientoDto dto)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        encuentroService.solicitarAplazamiento(userId, id, dto.getFechaSolicitada(), dto.getMotivo());
    }

    private List<EncuentroDto> toEncuentroDtos(List<Encuentro> encuentros) {
        return encuentros.stream().map(enc -> {
            String estado = enc.getEstadoEncuentro() != null ? enc.getEstadoEncuentro().name() : null;
            return new EncuentroDto(
                    enc.getId(),
                    enc.getLocal() != null ? enc.getLocal().getId() : null,
                    enc.getLocal() != null ? enc.getLocal().getNombreEquipo() : null,
                    enc.getVisitante() != null ? enc.getVisitante().getId() : null,
                    enc.getVisitante() != null ? enc.getVisitante().getNombreEquipo() : null,
                    estado,
                    enc.getFechaRealizacion()
            );
        }).collect(Collectors.toList());
    }

    private List<SetEntity> toSetEntities(List<SetDto> sets) {
        if (sets == null) {
            return new ArrayList<>();
        }
        return sets.stream().map(dto -> new SetEntity(
                null,
                dto.getNumeroSet(),
                dto.getGolesLocal(),
                dto.getGolesVisitante()
        )).collect(Collectors.toList());
    }
}
