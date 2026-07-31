package es.udc.agon.backend.model.services;

import es.udc.agon.backend.model.entities.Encuentro;
import es.udc.agon.backend.model.entities.Notification;
import es.udc.agon.backend.model.entities.Notification.TipoNotificacion;
import es.udc.agon.backend.model.entities.NotificationDao;
import es.udc.agon.backend.model.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Componente especializado en la creación y persistencia de notificaciones.
 * <p>
 * Encapsula toda la lógica de construcción de objetos {@link Notification},
 * incluyendo la internacionalización de los textos mediante {@link MessageSource}.
 * Los servicios de negocio que necesiten notificar a un usuario solo deben invocar
 * el método semántico correspondiente, sin preocuparse de cómo se construye la entidad.
 * </p>
 */
@Component
public class NotificationDispatcher {

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private MessageSource messageSource;

    // -----------------------------------------------------------------------
    //   Notificaciones de tipo SYSTEM 
    // -----------------------------------------------------------------------

    /**
     * Notifica a un usuario que su solicitud de unión a un equipo ha sido aceptada.
     */
    public void solicitudAceptada(User destinatario, String nombreEquipo, String decisorNombre) {
        String asunto = messageSource.getMessage(
                "notifications.solicitud.aceptada.asunto",
                new Object[]{nombreEquipo}, Locale.getDefault());
        String cuerpo = messageSource.getMessage(
                "notifications.solicitud.aceptada.cuerpo",
                new Object[]{nombreEquipo, decisorNombre}, Locale.getDefault());
        notificationDao.save(new Notification(destinatario, asunto, cuerpo, TipoNotificacion.SYSTEM));
    }

    /**
     * Notifica a un usuario que su solicitud de unión a un equipo ha sido rechazada.
     */
    public void solicitudRechazada(User destinatario, String nombreEquipo, String decisorNombre) {
        String asunto = messageSource.getMessage(
                "notifications.solicitud.rechazada.asunto",
                new Object[]{nombreEquipo}, Locale.getDefault());
        String cuerpo = messageSource.getMessage(
                "notifications.solicitud.rechazada.cuerpo",
                new Object[]{nombreEquipo, decisorNombre}, Locale.getDefault());
        notificationDao.save(new Notification(destinatario, asunto, cuerpo, TipoNotificacion.SYSTEM));
    }

    /**
     * Notifica al capitán que un miembro ha abandonado el equipo.
     */
    public void miembroAbandono(User capitan, String miembroNombre, String nombreEquipo) {
        String asunto = messageSource.getMessage(
                "notifications.miembro.abandono.asunto",
                new Object[]{nombreEquipo}, Locale.getDefault());
        String cuerpo = messageSource.getMessage(
                "notifications.miembro.abandono.cuerpo",
                new Object[]{miembroNombre, nombreEquipo}, Locale.getDefault());
        notificationDao.save(new Notification(capitan, asunto, cuerpo, TipoNotificacion.SYSTEM));
    }

    /**
     * Notifica a un miembro que ha sido expulsado del equipo.
     */
    public void miembroExpulsado(User miembro, String nombreEquipo, String capitanNombre) {
        String asunto = messageSource.getMessage(
                "notifications.miembro.expulsado.asunto",
                new Object[]{nombreEquipo}, Locale.getDefault());
        String cuerpo = messageSource.getMessage(
                "notifications.miembro.expulsado.cuerpo",
                new Object[]{capitanNombre, nombreEquipo}, Locale.getDefault());
        notificationDao.save(new Notification(miembro, asunto, cuerpo, TipoNotificacion.SYSTEM));
    }

    // -----------------------------------------------------------------------
    //   Notificaciones de tipo INVITACION 
    // -----------------------------------------------------------------------

    /**
     * Envía una invitación/petición que requiere acción por parte del destinatario.
     *
     * @param destinatario usuario que debe aceptar o rechazar
     * @param asunto       asunto de la notificación
     * @param cuerpo       cuerpo del mensaje
     * @param referenciaId id de la solicitud asociada
     */
    public void notificacionPendienteDeAccion(User destinatario, String asunto, String cuerpo, Long referenciaId) {
        notificationDao.save(new Notification(
                destinatario, asunto, cuerpo, false, true, referenciaId, TipoNotificacion.INVITACION));
    }

    // -----------------------------------------------------------------------
    //   Notificaciones de tipo RECORDATORIO_PARTIDO
    // -----------------------------------------------------------------------

    /**
     * Notifica al usuario que tiene un encuentro programado en los próximos días.
     *
     * @param destinatario usuario que participa en el encuentro.
     * @param encuentro    encuentro que se acerca.
     */
    public void recordatorioPartido(User destinatario, Encuentro encuentro) {
        String local = encuentro.getLocal() != null ? encuentro.getLocal().getNombreEquipo() : "?";
        String visitante = encuentro.getVisitante() != null ? encuentro.getVisitante().getNombreEquipo() : "?";
        String fecha = encuentro.getFechaRealizacion() != null
                ? encuentro.getFechaRealizacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "?";
        String asunto = messageSource.getMessage(
                "notifications.recordatorio.partido.asunto",
                new Object[]{local, visitante}, Locale.getDefault());
        String cuerpo = messageSource.getMessage(
                "notifications.recordatorio.partido.cuerpo",
                new Object[]{local, visitante, fecha}, Locale.getDefault());
        notificationDao.save(new Notification(
                destinatario, asunto, cuerpo, false, false, encuentro.getId(), TipoNotificacion.RECORDATORIO_PARTIDO));
    }

}
