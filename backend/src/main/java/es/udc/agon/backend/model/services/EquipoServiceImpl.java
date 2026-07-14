package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.*;
import es.udc.agon.backend.model.exceptions.InstanceNotFoundException;
import es.udc.agon.backend.model.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EquipoServiceImpl implements EquipoService {

    @Autowired
    private EquipoDao equipoDao;

    @Autowired
    private InvitacionDao invitacionDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private NotificationDao notificationDao;

    // Validación centralizada para evitar inconsistencias de estado
    private void validarEquipoActivo(Equipo equipo) {
        if (equipo.getEstado() != EstadoEquipo.ACTIVO) {
            throw new IllegalArgumentException("Operación no permitida: El equipo no está activo (estado: " + equipo.getEstado() + ")");
        }
    }

    @Override
    public Equipo crearEquipo(Long userId, String nombreEquipo) throws InstanceNotFoundException {
        User creador = userDao.findById(userId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));

        Equipo equipo = new Equipo(nombreEquipo, creador);
        if (!equipo.getMiembros().contains(creador)) {
            equipo.addMiembro(creador);
        }

        return equipoDao.save(equipo);
    }

    @Override
    public Invitacion invitarMiembro(Long remitenteId, Long equipoId, Long destinoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        User remitente = userDao.findById(remitenteId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", remitenteId));
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
        User destino = userDao.findById(destinoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", destinoId));

        validarEquipoActivo(equipo);

        if (!equipo.getCreador().equals(remitente)) {
            throw new PermissionException();
        }

        if (equipo.getMiembros().size() >= 2) {
            throw new IllegalArgumentException("El equipo ya está completo (máximo 2 miembros)");
        }

        if (equipo.getMiembros().contains(destino)) {
            throw new IllegalArgumentException("El usuario ya es miembro del equipo");
        }

        Optional<Invitacion> pending = invitacionDao.findByUsuarioDestinoIdAndEquipoIdAndEstado(destinoId, equipoId,
                EstadoInvitacion.PENDIENTE);
        if (pending.isPresent()) {
            throw new IllegalArgumentException("Ya hay una invitación pendiente para este usuario en este equipo");
        }

        Invitacion invitacion = new Invitacion(destino, remitente, equipo);
        invitacionDao.save(invitacion);

        String asunto = "Invitación al equipo " + equipo.getNombreEquipo();
        String cuerpo = "El usuario " + remitente.getNombre() + " te ha invitado a unirte al equipo " + equipo.getNombreEquipo() + ".";
        Notification notificacion = new Notification(destino, asunto, cuerpo, false, true, invitacion.getId(), Notification.TipoNotificacion.INVITACION);
        notificationDao.save(notificacion);

        return invitacion;
    }

    @Override
    public void responderInvitacion(Long usuarioId, Long invitacionId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Invitacion invitacion = invitacionDao.findById(invitacionId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.invitacion", invitacionId));

        if (!invitacion.getUsuarioDestino().getId().equals(usuarioId)) {
            throw new PermissionException();
        }

        if (invitacion.getEstado() != EstadoInvitacion.PENDIENTE) {
            throw new IllegalArgumentException("La invitación ya fue respondida");
        }

        Equipo equipo = invitacion.getEquipo();

        if (aceptar) {
            validarEquipoActivo(equipo);

            if (equipo.getMiembros().size() >= 2) {
                throw new IllegalArgumentException("El equipo ya se encuentra completo");
            }

            invitacion.aceptar();
            equipo.addMiembro(invitacion.getUsuarioDestino());
        } else {
            invitacion.rechazar();
        }

        Optional<Notification> notificationOpt = notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                usuarioId, invitacionId, Notification.TipoNotificacion.INVITACION);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setLeido(true);
            notification.setPendienteDeAccion(false);
            notificationDao.save(notification);
        }
    }

    @Override
    public void abandonarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
        User usuario = userDao.findById(usuarioId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", usuarioId));

        validarEquipoActivo(equipo);

        if (!equipo.getMiembros().contains(usuario)) {
            throw new IllegalArgumentException("El usuario no es miembro del equipo");
        }

        if (equipo.getCreador().equals(usuario)) {
            throw new IllegalArgumentException("El creador no puede abandonar el equipo, debe disolverlo");
        }

        equipo.removeMiembro(usuario);
    }

    @Override
    public void disolverEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException {
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
        User usuario = userDao.findById(usuarioId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", usuarioId));

        if (!equipo.getCreador().equals(usuario)) {
            throw new PermissionException();
        }

        equipo.setEstado(EstadoEquipo.DISUELTO);
    }

    @Override
    public List<Equipo> obtenerEquiposDeUsuario(Long usuarioId) {
        return equipoDao.findByMiembrosId(usuarioId);
    }

    @Override
    public Equipo obtenerEquipo(Long equipoId) throws InstanceNotFoundException {
        return equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
    }
}