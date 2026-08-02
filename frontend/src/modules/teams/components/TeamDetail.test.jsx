import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import TeamDetail from './TeamDetail';
import * as actions from '../actions';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    teamService: {
      getTeam: vi.fn(),
      deleteTeam: vi.fn(),
      leaveTeam: vi.fn(),
      kickMember: vi.fn()
    }
  }
}));

const messages = {
  'project.teams.Detail.notFound': 'No se pudo cargar el equipo',
  'project.teams.Detail.backToDashboard': 'Volver al dashboard',
  'project.teams.Detail.back': 'Volver',
  'project.teams.Detail.memberCount': '{count} {count, plural, one {miembro} other {miembros}}',
  'project.teams.Detail.teamId': 'ID {id}',
  'project.teams.Detail.members': 'Miembros',
  'project.teams.Detail.partidas': 'Partidas',
  'project.teams.Detail.created': 'Creado',
  'project.teams.Detail.descriptionSection': 'Descripción',
  'project.teams.Detail.noDescription': 'Sin descripción',
  'project.teams.Detail.codeLabel': 'Código de invitación',
  'project.teams.Detail.codeCopied': '¡Copiado!',
  'project.teams.Detail.copy': 'Copiar',
  'project.teams.Detail.codeHelp': 'Comparte este código para que otros se unan al equipo',
  'project.teams.Detail.codeNotAvailable': 'No disponible',
  'project.teams.Detail.membersTitle': 'Miembros',
  'project.teams.Detail.captain': 'Capitán',
  'project.teams.Detail.kickMember': 'Expulsar',
  'project.teams.Detail.noMembers': 'No hay miembros en este equipo',
  'project.teams.Detail.deleteTeam': 'Eliminar equipo',
  'project.teams.Detail.leaveTeam': 'Abandonar equipo',
  'project.teams.Detail.deleteModal.title': '¿Eliminar equipo?',
  'project.teams.Detail.deleteConfirm': 'Eliminar',
  'project.teams.Detail.leaveModal.title': '¿Abandonar equipo?',
  'project.teams.Detail.leaveConfirm': 'Abandonar',
  'project.teams.Detail.kickModal.title': '¿Expulsar miembro?',
  'project.teams.Detail.kickConfirm': 'Expulsar',
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.common.ConfirmationModal.processing': 'Procesando...'
};

const createStore = (user = { id: 1 }) => ({
  getState: () => ({ users: { user } }),
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderDetail = (user = { id: 1 }) => {
  const store = createStore(user);
  const view = render(
    <IntlProvider locale="es" messages={messages}>
      <Provider store={store}>
        <MemoryRouter initialEntries={['/', '/teams/view/5']} initialIndex={1}>
          <Routes>
            <Route path="/teams/view/:id" element={<TeamDetail />} />
            <Route path="/" element={<div>PAGINA_INICIO</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </IntlProvider>
  );
  return { store, ...view };
};

const equipoBase = (overrides = {}) => ({
  id: 5,
  nombreEquipo: 'Los Reyes',
  descripcion: 'Lema de prueba',
  creadorId: 1,
  codigoEquipo: 'ABC12345',
  estado: 'ACTIVO',
  fechaCreacion: '2026-01-15T10:00:00',
  miembros: [
    { id: 1, nombre: 'Juan Capitan', email: 'juan@test.com', elo: 1600, eloProvisional: false, imagenPerfil: null },
    { id: 2, nombre: 'Ana Jugadora', email: 'ana@test.com', elo: 1450, eloProvisional: true, imagenPerfil: null }
  ],
  ...overrides
});

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn() },
    configurable: true
  });
});

beforeEach(() => {
  Object.values(backend.teamService).forEach(fn => fn.mockReset());
  navigator.clipboard.writeText.mockClear();
});

describe('TeamDetail', () => {
  it('muestra el skeleton mientras carga', () => {
    backend.teamService.getTeam.mockReturnValue(new Promise(() => {}));
    const { container } = renderDetail();
    expect(container.querySelector('.td-loading')).toBeInTheDocument();
    expect(backend.teamService.getTeam).toHaveBeenCalledWith('5');
  });

  it('muestra el estado de error y el enlace al dashboard', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: false, error: 'Error de prueba' });
    renderDetail();
    expect(await screen.findByText('No se pudo cargar el equipo')).toBeInTheDocument();
    expect(screen.getByText('Error de prueba')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toBeInTheDocument();
  });

  it('renderiza los datos del equipo', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    const { container } = renderDetail();
    expect(await screen.findByText('Los Reyes')).toBeInTheDocument();
    expect(screen.getByText('Lema de prueba')).toBeInTheDocument();
    expect(screen.getByText('2 miembros')).toBeInTheDocument();
    expect(screen.getByText('ABC12345')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Juan Capitan')).toBeInTheDocument();
    expect(screen.getByText('Ana Jugadora')).toBeInTheDocument();
    expect(screen.getByText('Capitán')).toBeInTheDocument();
    expect(container.querySelectorAll('.td-member').length).toBe(2);
  });

  it('no permite editar el nombre ni la descripcion del equipo', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    const { container } = renderDetail();
    await screen.findByText('Los Reyes');
    expect(container.querySelector('.td-edit-btn')).not.toBeInTheDocument();
    expect(container.querySelector('.td-edit-form')).not.toBeInTheDocument();
    expect(container.querySelector('.td-edit-input')).not.toBeInTheDocument();
  });

  it('copia el codigo de invitacion', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    const { container } = renderDetail();
    await screen.findByText('Los Reyes');
    fireEvent.click(container.querySelector('.td-copy-btn'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC12345');
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
  });

  it('elimina el equipo como capitan y navega al inicio', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    backend.teamService.deleteTeam.mockResolvedValue({ ok: true });
    const { store } = renderDetail();
    await screen.findByText('Los Reyes');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar equipo' }));
    expect(screen.getByText('¿Eliminar equipo?')).toBeInTheDocument();
    fireEvent.click(within(document.querySelector('.modal-content')).getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('PAGINA_INICIO')).toBeInTheDocument();
    expect(backend.teamService.deleteTeam).toHaveBeenCalledWith('5');
    expect(store.dispatch).toHaveBeenCalledWith(actions.deleteTeamSuccess(5));
  });

  it('abandona el equipo como miembro', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    backend.teamService.leaveTeam.mockResolvedValue({ ok: true });
    const { store } = renderDetail({ id: 2 });
    await screen.findByText('Los Reyes');
    expect(screen.queryByText('Eliminar equipo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar equipo' }));
    expect(screen.getByText('¿Abandonar equipo?')).toBeInTheDocument();
    fireEvent.click(within(document.querySelector('.modal-content')).getByRole('button', { name: 'Abandonar' }));
    expect(await screen.findByText('PAGINA_INICIO')).toBeInTheDocument();
    expect(backend.teamService.leaveTeam).toHaveBeenCalledWith('5');
    expect(store.dispatch).toHaveBeenCalledWith(actions.leaveTeamSuccess(5));
  });

  it('expulsa a un miembro como capitan', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    backend.teamService.kickMember.mockResolvedValue({ ok: true });
    renderDetail();
    await screen.findByText('Los Reyes');
    fireEvent.click(screen.getByRole('button', { name: 'Expulsar' }));
    expect(screen.getByText('¿Expulsar miembro?')).toBeInTheDocument();
    fireEvent.click(within(document.querySelector('.modal-content')).getByRole('button', { name: 'Expulsar' }));
    await waitFor(() => expect(backend.teamService.kickMember).toHaveBeenCalledWith('5', 2));
    expect(backend.teamService.getTeam).toHaveBeenCalledTimes(2);
  });

  it('no muestra acciones si no es miembro del equipo', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase() });
    renderDetail({ id: 99 });
    await screen.findByText('Los Reyes');
    expect(screen.queryByText('Eliminar equipo')).not.toBeInTheDocument();
    expect(screen.queryByText('Abandonar equipo')).not.toBeInTheDocument();
    expect(screen.queryByText('Expulsar')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de equipo sin miembros', async () => {
    backend.teamService.getTeam.mockResolvedValue({ ok: true, payload: equipoBase({ miembros: [] }) });
    renderDetail();
    expect(await screen.findByText('No hay miembros en este equipo')).toBeInTheDocument();
    expect(screen.getByText('0 miembros')).toBeInTheDocument();
  });
});
