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
    private SolicitudDao solicitudDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private NotificationDispatcher notificationDispatcher;

    @Autowired
    private EncuentroDao encuentroDao;

    private void validarEquipoActivo(Equipo equipo) {
        if (equipo.getEstado() != EstadoEquipo.ACTIVO) {
            throw new IllegalArgumentException("Operación no permitida: El equipo no está activo (estado: " + equipo.getEstado() + ")");
        }
    }

    @Override
    public Equipo crearEquipo(Long userId, String nombreEquipo, String descripcion) throws InstanceNotFoundException {
        User creador = userDao.findById(userId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));

        Equipo equipo = new Equipo(nombreEquipo, descripcion, creador);
        if (!equipo.getMiembros().contains(creador)) {
            equipo.addMiembro(creador);
        }

        return equipoDao.save(equipo);
    }

    @Override
    public Solicitud crearPropuestaDeUnion(Long creadorId, Long equipoId, Long jugadorId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        User creador = userDao.findById(creadorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", creadorId));
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
        User jugador = userDao.findById(jugadorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", jugadorId));

        validarEquipoActivo(equipo);

        if (!equipo.getCreador().equals(creador)) {
            throw new PermissionException();
        }

        if (equipo.getMiembros().size() >= 2) {
            throw new IllegalArgumentException("El equipo ya está completo (máximo 2 miembros)");
        }

        if (equipo.getMiembros().contains(jugador)) {
            throw new IllegalArgumentException("El usuario ya es miembro del equipo");
        }

        Optional<Solicitud> pending = solicitudDao.findByCandidatoIdAndEquipoIdAndEstado(
                jugadorId, equipoId, EstadoSolicitud.PENDIENTE);
        if (pending.isPresent()) {
            throw new IllegalArgumentException("Ya hay una solicitud activa pendiente para este jugador");
        }

        Solicitud solicitud = new Solicitud(jugador, jugador, equipo, TipoSolicitud.PROPUESTA);
        solicitudDao.save(solicitud);

        String asunto = "Propuesta de unión al equipo " + equipo.getNombreEquipo();
        String cuerpo = "El creador " + creador.getNombre() + " te ha propuesto unirte a su equipo " + equipo.getNombreEquipo() + ".";
        notificationDispatcher.notificacionPendienteDeAccion(jugador, asunto, cuerpo, solicitud.getId());

        return solicitud;
    }

    @Override
    public Solicitud crearPeticionDeUnion(Long jugadorId, String codigoEquipo)
            throws InstanceNotFoundException, IllegalArgumentException {

        User jugador = userDao.findById(jugadorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", jugadorId));

        Equipo equipo = equipoDao.findByCodigoEquipo(codigoEquipo)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", codigoEquipo));

        validarEquipoActivo(equipo);

        if (equipo.getMiembros().size() >= 2) {
            throw new IllegalArgumentException("El equipo ya está completo (máximo 2 miembros)");
        }

        if (equipo.getMiembros().contains(jugador)) {
            throw new IllegalArgumentException("Ya formas parte de este equipo");
        }

        Optional<Solicitud> pending = solicitudDao.findByCandidatoIdAndEquipoIdAndEstado(
                jugadorId, equipo.getId(), EstadoSolicitud.PENDIENTE);
        if (pending.isPresent()) {
            throw new IllegalArgumentException("Ya has enviado una petición de unión a este equipo que está pendiente");
        }

        User creador = equipo.getCreador();
        Solicitud solicitud = new Solicitud(jugador, creador, equipo, TipoSolicitud.PETICION);
        solicitudDao.save(solicitud);

        String asunto = "Petición de unión al equipo " + equipo.getNombreEquipo();
        String cuerpo = "El jugador " + jugador.getNombre() + " ha solicitado unirse a tu equipo con código " + codigoEquipo + ".";
        notificationDispatcher.notificacionPendienteDeAccion(creador, asunto, cuerpo, solicitud.getId());

        return solicitud;
    }

    @Override
    public void responderSolicitud(Long usuarioId, Long solicitudId, boolean aceptar)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Solicitud solicitud = solicitudDao.findById(solicitudId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.solicitud", solicitudId));

        if (!solicitud.getDecisor().getId().equals(usuarioId)) {
            throw new PermissionException();
        }

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new IllegalArgumentException("La solicitud ya fue respondida");
        }

        Equipo equipo = solicitud.getEquipo();

        if (aceptar) {
            validarEquipoActivo(equipo);

            if (equipo.getMiembros().size() >= 2) {
                throw new IllegalArgumentException("El equipo ya se encuentra completo");
            }

            solicitud.aceptar();
            equipo.addMiembro(solicitud.getCandidato());
        } else {
            solicitud.rechazar();
        }

        // Marcar como leída la notificación original que tenía el decisor
        Optional<Notification> notificationOpt = notificationDao.findByUsuarioIdAndReferenciaIdAndTipo(
                usuarioId, solicitudId, Notification.TipoNotificacion.INVITACION);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setLeido(true);
            notification.setPendienteDeAccion(false);
            notificationDao.save(notification);
        }

        // Notificar al otro implicado (candidato o capitán) del resultado de la solicitud
        User destinatario;
        String nombreEquipo = equipo.getNombreEquipo();
        String decisorNombre = solicitud.getDecisor().getNombre();

        if (solicitud.getCandidato().getId().equals(usuarioId)) {
            // El que responde es el candidato (PROPUESTA) → notificar al capitán
            destinatario = equipo.getCreador();
        } else {
            // El que responde es el capitán (PETICION) → notificar al candidato
            destinatario = solicitud.getCandidato();
        }

        if (aceptar) {
            notificationDispatcher.solicitudAceptada(destinatario, nombreEquipo, decisorNombre);
        } else {
            notificationDispatcher.solicitudRechazada(destinatario, nombreEquipo, decisorNombre);
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
        equipoDao.save(equipo);

        // Notificar al creador que un miembro ha abandonado
        User creador = equipo.getCreador();
        notificationDispatcher.miembroAbandono(creador, usuario.getNombre(), equipo.getNombreEquipo());
    }

    @Override
    public void eliminarEquipo(Long usuarioId, Long equipoId)
            throws InstanceNotFoundException, PermissionException {
        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));

        if (!equipo.getCreador().getId().equals(usuarioId)) {
            throw new PermissionException();
        }

        equipoDao.delete(equipo);
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

    @Override
    public long obtenerNumPartidasJugadas(Long equipoId) {
        return encuentroDao.countPartidasJugadas(equipoId);
    }

    @Override
    public Equipo buscarEquipoPorCodigo(String codigoEquipo) throws InstanceNotFoundException {
        Equipo equipo = equipoDao.findByCodigoEquipo(codigoEquipo)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", codigoEquipo));
        validarEquipoActivo(equipo);
        return equipo;
    }

    @Override
    public void expulsarMiembro(Long captainId, Long equipoId, Long miembroId)
            throws InstanceNotFoundException, PermissionException, IllegalArgumentException {

        Equipo equipo = equipoDao.findById(equipoId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.equipo", equipoId));
        User miembro = userDao.findById(miembroId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", miembroId));
        User captain = userDao.findById(captainId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", captainId));

        validarEquipoActivo(equipo);

        if (!equipo.getCreador().getId().equals(captainId)) {
            throw new PermissionException();
        }

        if (equipo.getCreador().getId().equals(miembroId)) {
            throw new IllegalArgumentException("El capitán no puede expulsarse a sí mismo. Use eliminar equipo en su lugar.");
        }

        if (!equipo.getMiembros().contains(miembro)) {
            throw new IllegalArgumentException("El usuario no es miembro del equipo");
        }

        equipo.removeMiembro(miembro);
        equipoDao.save(equipo);

        notificationDispatcher.miembroExpulsado(miembro, equipo.getNombreEquipo(), captain.getNombre());
    }
}
