import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Notifications from './Notifications';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    notificationService: { getNotifications: vi.fn(), getNotification: vi.fn(), markAsRead: vi.fn() },
    teamService: { respondToRequest: vi.fn(), getTeam: vi.fn() },
    tournamentService: { getSolicitud: vi.fn(), approveEnrollment: vi.fn(), rejectEnrollment: vi.fn() }
  }
}));

const messages = {
  'project.notifications.loading': 'Cargando notificaciones…',
  'project.notifications.listTitle': 'Notificaciones',
  'project.notifications.filter.all': 'Todas',
  'project.notifications.filter.unread': 'No leídas',
  'project.notifications.filter.read': 'Leídas',
  'project.notifications.empty.noNotifications': 'No hay notificaciones',
  'project.notifications.empty.all': 'Todavía no has recibido ninguna notificación',
  'project.notifications.empty.unread': 'Todas tus notificaciones están leídas',
  'project.notifications.empty.read': 'No tienes notificaciones leídas',
  'project.notifications.empty.select': 'Selecciona una notificación',
  'project.notifications.empty.selectHelp': 'para leer su contenido',
  'project.notifications.types.system': 'Sistema',
  'project.notifications.types.invitation': 'Invitación',
  'project.notifications.types.inscripcion': 'Inscripción',
  'project.notifications.types.match': 'Partido',
  'project.notifications.detail.accept': 'Aceptar',
  'project.notifications.detail.reject': 'Rechazar',
  'project.notifications.detail.new': 'Nueva',
  'project.notifications.detail.viewTeam': 'Ver detalles',
  'project.notifications.actions.respondInvitation': 'Responder invitación',
  'project.notifications.actions.viewMatch': 'Ver partido',
  'project.notifications.confirm.acceptInvitationTitle': '¿Aceptar invitación?',
  'project.notifications.confirm.acceptInvitationDesc': 'Vas a aceptar la invitación al equipo. ¿Estás seguro?',
  'project.notifications.confirm.rejectInvitationTitle': '¿Rechazar invitación?',
  'project.notifications.confirm.rejectInvitationDesc': 'Vas a rechazar la invitación al equipo. ¿Estás seguro?',
  'project.notifications.confirm.acceptInscripcionTitle': '¿Aceptar inscripción?',
  'project.notifications.confirm.acceptInscripcionDesc': 'Vas a aceptar la inscripción del equipo en el torneo. ¿Estás seguro?',
  'project.notifications.confirm.rejectInscripcionTitle': '¿Rechazar inscripción?',
  'project.notifications.confirm.rejectInscripcionDesc': 'Vas a rechazar la inscripción del equipo en el torneo. ¿Estás seguro?',
  'project.notifications.confirm.accept': 'Aceptar',
  'project.notifications.confirm.reject': 'Rechazar',
  'project.notifications.feedback.accepted': 'Solicitud aceptada correctamente',
  'project.notifications.feedback.rejected': 'Solicitud rechazada correctamente',
  'project.notifications.feedback.inscripcionAccepted': 'Inscripción aceptada correctamente',
  'project.notifications.feedback.inscripcionRejected': 'Inscripción rechazada correctamente',
  'project.common.ConfirmationModal.cancel': 'Cancelar'
};

const renderNotifications = () => render(
  <IntlProvider locale="es" messages={messages}>
    <Notifications />
  </IntlProvider>
);

const notificacion = (overrides = {}) => ({
  id: 1,
  asunto: 'Notificación de prueba',
  cuerpo: 'Cuerpo de la notificación de prueba.',
  tipo: 'SISTEMA',
  leido: false,
  pendienteDeAccion: false,
  referenciaId: null,
  fechaCreacion: '2026-08-01T10:00:00',
  ...overrides
});

describe('Notifications', () => {
  beforeEach(() => {
    backend.notificationService.getNotifications.mockReset();
    backend.notificationService.getNotification.mockReset();
    backend.notificationService.markAsRead.mockReset();
    backend.teamService.respondToRequest.mockReset();
    backend.teamService.getTeam.mockReset();
    backend.tournamentService.getSolicitud.mockReset();
    backend.tournamentService.approveEnrollment.mockReset();
    backend.tournamentService.rejectEnrollment.mockReset();
  });

  it('muestra el spinner mientras carga', () => {
    backend.notificationService.getNotifications.mockReturnValue(new Promise(() => {}));
    renderNotifications();
    expect(screen.getByText('Cargando notificaciones…')).toBeInTheDocument();
  });

  it('muestra el vacio cuando no hay notificaciones', async () => {
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [] });
    renderNotifications();
    expect(await screen.findByText('Todavía no has recibido ninguna notificación')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una notificación')).toBeInTheDocument();
  });

  it('carga la lista y selecciona la primera notificacion', async () => {
    const notif = notificacion({ id: 1, tipo: 'SISTEMA', leido: true, pendienteDeAccion: false, asunto: 'Bienvenido a Agón' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => {
      expect(within(detail).getByText('Bienvenido a Agón')).toBeInTheDocument();
      expect(within(detail).getByText('Sistema')).toBeInTheDocument();
      expect(within(detail).getByText('Cuerpo de la notificación de prueba.')).toBeInTheDocument();
    });
    expect(backend.notificationService.markAsRead).not.toHaveBeenCalled();
  });

  it('marca como leida la notificacion al seleccionarla', async () => {
    const notif = notificacion({ id: 1, tipo: 'INVITACION', leido: false, asunto: 'Invitación a Los Reyes' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.notificationService.markAsRead.mockResolvedValue({ ok: true, payload: { ...notif, leido: true } });
    renderNotifications();
    await waitFor(() => expect(backend.notificationService.markAsRead).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText('Nueva')).not.toBeInTheDocument());
  });

  it('filtra la lista por estado de lectura', async () => {
    const leida = notificacion({ id: 1, tipo: 'SISTEMA', leido: true, pendienteDeAccion: false, asunto: 'Bienvenida' });
    const noLeida = notificacion({ id: 2, tipo: 'PARTIDO', leido: false, pendienteDeAccion: false, asunto: 'Partido mañana' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [leida, noLeida] });
    backend.notificationService.getNotification.mockImplementation((id) =>
      Promise.resolve({ ok: true, payload: id === 1 ? leida : noLeida })
    );
    const { container } = renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const master = document.querySelector('.notifications-master-panel');
    await waitFor(() => expect(within(master).getByText('Partido mañana')).toBeInTheDocument());
    expect(container.querySelector('.unread-count-badge')).toHaveTextContent('1');
    fireEvent.click(screen.getByText('No leídas'));
    await waitFor(() => {
      expect(within(master).getByText('Partido mañana')).toBeInTheDocument();
      expect(within(master).queryByText('Bienvenida')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Leídas'));
    await waitFor(() => {
      expect(within(master).getByText('Bienvenida')).toBeInTheDocument();
      expect(within(master).queryByText('Partido mañana')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Todas'));
    await waitFor(() => expect(within(master).getByText('Partido mañana')).toBeInTheDocument());
  });

  it('muestra el vacio del filtro no leidas', async () => {
    const leida = notificacion({ id: 1, tipo: 'SISTEMA', leido: true, pendienteDeAccion: false, asunto: 'Bienvenida' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [leida] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: leida });
    renderNotifications();
    await screen.findAllByText('Bienvenida');
    fireEvent.click(screen.getByText('No leídas'));
    expect(await screen.findByText('Todas tus notificaciones están leídas')).toBeInTheDocument();
  });

  it('acepta una invitacion con el modal de confirmacion', async () => {
    const notif = notificacion({ id: 1, tipo: 'INVITACION', leido: true, pendienteDeAccion: true, referenciaId: 10, asunto: 'Invitación a Los Reyes' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.teamService.respondToRequest.mockResolvedValue({ ok: true });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => expect(within(detail).getByRole('button', { name: 'Aceptar' })).toBeInTheDocument());
    fireEvent.click(within(detail).getByRole('button', { name: 'Aceptar' }));
    expect(await screen.findByText('¿Aceptar invitación?')).toBeInTheDocument();
    const modal = document.querySelector('.modal-content');
    fireEvent.click(within(modal).getByRole('button', { name: 'Aceptar' }));
    await waitFor(() => expect(backend.teamService.respondToRequest).toHaveBeenCalledWith(10, true));
    expect(await screen.findByText('Solicitud aceptada correctamente')).toBeInTheDocument();
  });

  it('rechaza una invitacion con el modal de confirmacion', async () => {
    const notif = notificacion({ id: 1, tipo: 'INVITACION', leido: true, pendienteDeAccion: true, referenciaId: 10, asunto: 'Invitación a Los Reyes' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.teamService.respondToRequest.mockResolvedValue({ ok: true });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => expect(within(detail).getByRole('button', { name: 'Rechazar' })).toBeInTheDocument());
    fireEvent.click(within(detail).getByRole('button', { name: 'Rechazar' }));
    expect(await screen.findByText('¿Rechazar invitación?')).toBeInTheDocument();
    const modal = document.querySelector('.modal-content');
    fireEvent.click(within(modal).getByRole('button', { name: 'Rechazar' }));
    await waitFor(() => expect(backend.teamService.respondToRequest).toHaveBeenCalledWith(10, false));
    expect(await screen.findByText('Solicitud rechazada correctamente')).toBeInTheDocument();
  });

  it('acepta una inscripcion con el modal de confirmacion', async () => {
    const notif = notificacion({ id: 1, tipo: 'SOLICITUD_INSCRIPCION', leido: true, pendienteDeAccion: true, referenciaId: 10, asunto: 'Nueva inscripción' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.tournamentService.getSolicitud.mockResolvedValue({ ok: true, payload: { torneoId: 3, equipoId: 5 } });
    backend.tournamentService.approveEnrollment.mockResolvedValue({ ok: true });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => expect(within(detail).getByRole('button', { name: 'Aceptar' })).toBeInTheDocument());
    fireEvent.click(within(detail).getByRole('button', { name: 'Aceptar' }));
    expect(await screen.findByText('¿Aceptar inscripción?')).toBeInTheDocument();
    const modal = document.querySelector('.modal-content');
    fireEvent.click(within(modal).getByRole('button', { name: 'Aceptar' }));
    await waitFor(() => expect(backend.tournamentService.approveEnrollment).toHaveBeenCalledWith(3, 10));
    expect(await screen.findByText('Inscripción aceptada correctamente')).toBeInTheDocument();
  });

  it('rechaza una inscripcion con el modal de confirmacion', async () => {
    const notif = notificacion({ id: 1, tipo: 'SOLICITUD_INSCRIPCION', leido: true, pendienteDeAccion: true, referenciaId: 10, asunto: 'Nueva inscripción' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.tournamentService.getSolicitud.mockResolvedValue({ ok: true, payload: { torneoId: 3, equipoId: 5 } });
    backend.tournamentService.rejectEnrollment.mockResolvedValue({ ok: true });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => expect(within(detail).getByRole('button', { name: 'Rechazar' })).toBeInTheDocument());
    fireEvent.click(within(detail).getByRole('button', { name: 'Rechazar' }));
    expect(await screen.findByText('¿Rechazar inscripción?')).toBeInTheDocument();
    const modal = document.querySelector('.modal-content');
    fireEvent.click(within(modal).getByRole('button', { name: 'Rechazar' }));
    await waitFor(() => expect(backend.tournamentService.rejectEnrollment).toHaveBeenCalledWith(3, 10));
    expect(await screen.findByText('Inscripción rechazada correctamente')).toBeInTheDocument();
  });

  it('abre el modal del equipo desde una inscripcion', async () => {
    const notif = notificacion({ id: 1, tipo: 'SOLICITUD_INSCRIPCION', leido: true, pendienteDeAccion: true, referenciaId: 10, asunto: 'Nueva inscripción' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    backend.tournamentService.getSolicitud.mockResolvedValue({ ok: true, payload: { torneoId: 3, equipoId: 5 } });
    backend.teamService.getTeam.mockResolvedValue({
      ok: true,
      payload: { nombreEquipo: 'Los Reyes', descripcion: 'Equipo de prueba', miembros: [{ id: 1, nombre: 'Ana' }] }
    });
    renderNotifications();
    expect(await screen.findByText('Notificaciones')).toBeInTheDocument();
    const detail = document.querySelector('.notifications-detail-panel');
    await waitFor(() => expect(within(detail).getByRole('button', { name: 'Ver detalles' })).toBeInTheDocument());
    fireEvent.click(within(detail).getByRole('button', { name: 'Ver detalles' }));
    expect(await screen.findByText('Los Reyes')).toBeInTheDocument();
    expect(backend.teamService.getTeam).toHaveBeenCalledWith(5);
  });

  it('muestra la accion generica para notificaciones sin accion especifica', async () => {
    const notif = notificacion({ id: 1, tipo: 'PARTIDO', leido: true, pendienteDeAccion: true, referenciaId: 20, asunto: 'Partido mañana' });
    backend.notificationService.getNotifications.mockResolvedValue({ ok: true, payload: [notif] });
    backend.notificationService.getNotification.mockResolvedValue({ ok: true, payload: notif });
    renderNotifications();
    await screen.findAllByText('Partido mañana');
    expect(screen.getByRole('button', { name: 'Ver partido' })).toBeInTheDocument();
  });
});
