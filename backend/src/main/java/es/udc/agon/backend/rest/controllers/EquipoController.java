package es.udc.agon.backend.rest.controllers;

import es.udc.agon.backend.model.entities.Equipo;
import es.udc.agon.backend.model.entities.Invitacion;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import es.udc.agon.backend.model.services.EquipoService;
import es.udc.agon.backend.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class EquipoController {

    @Autowired
    private EquipoService equipoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipoDto crearEquipo(@RequestAttribute Long userId, @Validated @RequestBody CrearEquipoParamsDto params)
            throws InstanceNotFoundException {
        Equipo equipo = equipoService.crearEquipo(userId, params.getNombreEquipo());
        return EquipoConversor.toEquipoDto(equipo);
    }

    @PostMapping("/{id}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitacionDto invitarMiembro(@RequestAttribute Long userId, @PathVariable Long id,
            @RequestParam Long destinoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        Invitacion invitacion = equipoService.invitarMiembro(userId, id, destinoId);
        return EquipoConversor.toInvitacionDto(invitacion);
    }

    @PostMapping("/invitations/{invitacionId}/respond")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void responderInvitacion(@RequestAttribute Long userId, @PathVariable Long invitacionId,
            @Validated @RequestBody ResponderInvitacionParamsDto params)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        equipoService.responderInvitacion(userId, invitacionId, params.getAceptar());
    }

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void abandonarEquipo(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        equipoService.abandonarEquipo(userId, id);
    }

    @PostMapping("/{id}/disband")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disolverEquipo(@RequestAttribute Long userId, @PathVariable Long id)
            throws InstanceNotFoundException, PermissionException {
        equipoService.disolverEquipo(userId, id);
    }

    @GetMapping
    public List<EquipoDto> obtenerEquipos(@RequestAttribute Long userId) {
        return EquipoConversor.toEquipoDtos(equipoService.obtenerEquiposDeUsuario(userId));
    }
}
