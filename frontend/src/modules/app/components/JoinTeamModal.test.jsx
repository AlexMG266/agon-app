import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import JoinTeamModal from './JoinTeamModal';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    teamService: {
      getTeamByCode: vi.fn(),
      requestJoinWithCode: vi.fn()
    }
  }
}));

const messages = {
  'project.teams.JoinTeam.title': 'Unirse a un equipo',
  'project.teams.JoinTeam.subtitle': 'Introduce el código de 8 caracteres que te ha proporcionado el capitán del equipo',
  'project.teams.JoinTeam.search': 'Buscar',
  'project.teams.JoinTeam.placeholder': 'Código del equipo (ej. a7K9pX2L)',
  'project.teams.JoinTeam.members': '{count}/2 miembros',
  'project.teams.JoinTeam.membersLabel': 'Miembros del equipo:',
  'project.teams.JoinTeam.captain': 'Capitán',
  'project.teams.JoinTeam.alreadyMember': 'Ya formas parte de este equipo',
  'project.teams.JoinTeam.teamFull': 'Este equipo ya está completo (máximo 2 miembros)',
  'project.teams.JoinTeam.requestJoin': 'Solicitar unirse',
  'project.teams.JoinTeam.retry': 'Reintentar',
  'project.teams.JoinTeam.success.title': '¡Solicitud enviada con éxito!',
  'project.teams.JoinTeam.success.description': 'El capitán del equipo revisará tu petición y recibirás una notificación cuando sea respondida.',
  'project.teams.JoinTeam.notFound': 'No se encontró ningún equipo con ese código',
  'project.teams.JoinTeam.notFoundHelp': 'Verifica que el código sea correcto e inténtalo de nuevo',
  'project.teams.JoinTeam.youAreCaptain': 'Eres el capitán de este equipo'
};

const createMockStore = (state) => ({
  getState: () => state,
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderModal = (state, onHide = vi.fn()) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={createMockStore(state)}>
      <JoinTeamModal show onHide={onHide} />
    </Provider>
  </IntlProvider>
);

const buscarCodigo = async (codigo) => {
  fireEvent.change(screen.getByPlaceholderText(/Código del equipo/), { target: { value: codigo } });
  fireEvent.click(screen.getByText('Buscar'));
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
};

const equipo = {
  id: 1,
  nombreEquipo: 'los cracks',
  descripcion: 'equipo de prueba',
  creadorId: 10,
  miembros: [{ id: 10, nombre: 'ana' }, { id: 11, nombre: 'luis' }]
};

describe('JoinTeamModal', () => {
  beforeEach(() => {
    backend.teamService.getTeamByCode.mockReset();
    backend.teamService.requestJoinWithCode.mockReset();
  });

  it('llama a onHide al cerrar', async () => {
    const onHide = vi.fn();
    renderModal({ users: { user: { id: 1 } } }, onHide);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onHide).toHaveBeenCalled();
  });

  it('encuentra el equipo y muestra miembros y capitán', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 10, nombre: 'ana' }] }
    });
    renderModal({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('los cracks')).toBeInTheDocument();
    expect(screen.getByText('equipo de prueba')).toBeInTheDocument();
    expect(screen.getByText('1/2 miembros')).toBeInTheDocument();
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('Capitán')).toBeInTheDocument();
    expect(screen.getByText('Solicitar unirse')).toBeInTheDocument();
  });

  it('avisa cuando ya eres miembro', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipo });
    renderModal({ users: { user: { id: 11 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Ya formas parte de este equipo')).toBeInTheDocument();
  });

  it('avisa cuando el equipo está completo', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipo });
    renderModal({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Este equipo ya está completo (máximo 2 miembros)')).toBeInTheDocument();
  });

  it('muestra aviso de capitán cuando el usuario es el creador', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 11, nombre: 'luis' }] }
    });
    renderModal({ users: { user: { id: 10 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Eres el capitán de este equipo')).toBeInTheDocument();
    expect(screen.queryByText('Solicitar unirse')).not.toBeInTheDocument();
  });

  it('muestra mensaje cuando no se encuentra el equipo', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: false, status: 404 });
    renderModal({ users: { user: { id: 1 } } });
    await buscarCodigo('XXXX0000');
    expect(screen.getByText('No se encontró ningún equipo con ese código')).toBeInTheDocument();
  });

  it('envia la solicitud y muestra el exito', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 10, nombre: 'ana' }] }
    });
    backend.teamService.requestJoinWithCode.mockResolvedValue({ ok: true, payload: {} });
    renderModal({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    fireEvent.click(screen.getByText('Solicitar unirse'));
    expect(await screen.findByText('¡Solicitud enviada con éxito!')).toBeInTheDocument();
    expect(backend.teamService.requestJoinWithCode).toHaveBeenCalledWith('ABC12345');
  });

  it('vuelve al formulario si falla la solicitud', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 10, nombre: 'ana' }] }
    });
    backend.teamService.requestJoinWithCode.mockResolvedValue({ ok: false, payload: { message: 'fallo' } });
    renderModal({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    fireEvent.click(screen.getByText('Solicitar unirse'));
    await waitFor(() => {
      expect(screen.queryByText('los cracks')).not.toBeInTheDocument();
    });
  });

  it('no muestra el botón de buscar mientras carga', async () => {
    backend.teamService.getTeamByCode.mockReturnValue(new Promise(() => {}));
    renderModal({ users: { user: { id: 1 } } });
    fireEvent.change(screen.getByPlaceholderText(/Código del equipo/), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText('Buscar'));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
