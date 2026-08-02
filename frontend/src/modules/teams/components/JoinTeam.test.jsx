import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import JoinTeam from './JoinTeam';
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
  'project.teams.JoinTeam.searching': 'Buscando...',
  'project.teams.JoinTeam.placeholder': 'Código del equipo (ej. a7K9pX2L)',
  'project.teams.JoinTeam.members': '{count}/2 miembros',
  'project.teams.JoinTeam.membersLabel': 'Miembros del equipo:',
  'project.teams.JoinTeam.captain': 'Capitán',
  'project.teams.JoinTeam.alreadyMember': 'Ya formas parte de este equipo',
  'project.teams.JoinTeam.teamFull': 'Este equipo ya está completo (máximo 2 miembros)',
  'project.teams.JoinTeam.requestJoin': 'Solicitar unirse',
  'project.teams.JoinTeam.requesting': 'Enviando solicitud...',
  'project.teams.JoinTeam.retry': 'Reintentar',
  'project.teams.JoinTeam.success.title': '¡Solicitud enviada con éxito!',
  'project.teams.JoinTeam.success.description': 'El capitán del equipo revisará tu petición y recibirás una notificación cuando sea respondida.',
  'project.teams.JoinTeam.sendAnother': 'Enviar otra solicitud',
  'project.teams.JoinTeam.notFound': 'No se encontró ningún equipo con ese código',
  'project.teams.JoinTeam.notFoundHelp': 'Verifica que el código sea correcto e inténtalo de nuevo',
  'project.teams.JoinTeam.youAreCaptain': 'Eres el capitán de este equipo'
};

const createMockStore = (state) => ({
  getState: () => state,
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderJoinTeam = (state) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={createMockStore(state)}>
      <JoinTeam />
    </Provider>
  </IntlProvider>
);

const buscarCodigo = async (codigo) => {
  fireEvent.change(screen.getByPlaceholderText(/Código del equipo/), { target: { value: codigo } });
  fireEvent.click(screen.getByText('Buscar'));
  await waitFor(() => {
    expect(screen.queryByText('Buscando...')).not.toBeInTheDocument();
  });
};

const equipo = {
  id: 1,
  nombreEquipo: 'los cracks',
  descripcion: 'equipo de prueba',
  creadorId: 10,
  miembros: [{ id: 10, nombre: 'ana' }, { id: 11, nombre: 'luis' }]
};

const equipoDisponible = { ...equipo, miembros: [{ id: 10, nombre: 'ana' }] };

describe('JoinTeam', () => {
  beforeEach(() => {
    backend.teamService.getTeamByCode.mockReset();
    backend.teamService.requestJoinWithCode.mockReset();
  });

  it('muestra el formulario inicial con el boton deshabilitado sin codigo', () => {
    renderJoinTeam({ users: { user: { id: 1 } } });
    expect(screen.getByText('Unirse a un equipo')).toBeInTheDocument();
    const button = screen.getByText('Buscar');
    expect(button.closest('button')).toBeDisabled();
  });

  it('encuentra el equipo y muestra sus miembros', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipoDisponible });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    expect(backend.teamService.getTeamByCode).toHaveBeenCalledWith('ABC12345');
    expect(screen.getByText('los cracks')).toBeInTheDocument();
    expect(screen.getByText('equipo de prueba')).toBeInTheDocument();
    expect(screen.getByText('1/2 miembros')).toBeInTheDocument();
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('Capitán')).toBeInTheDocument();
    expect(screen.getByText('Solicitar unirse')).toBeInTheDocument();
  });

  it('no muestra la descripcion si el equipo no la tiene', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, descripcion: null }
    });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    expect(screen.queryByText('equipo de prueba')).not.toBeInTheDocument();
  });

  it('muestra el aviso de capitán cuando el usuario es el creador', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 11, nombre: 'luis' }] }
    });
    renderJoinTeam({ users: { user: { id: 10 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Eres el capitán de este equipo')).toBeInTheDocument();
    expect(screen.queryByText('Solicitar unirse')).not.toBeInTheDocument();
  });

  it('avisa cuando ya eres miembro', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipo });
    renderJoinTeam({ users: { user: { id: 11 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Ya formas parte de este equipo')).toBeInTheDocument();
  });

  it('avisa cuando el equipo está completo', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipo });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    expect(screen.getByText('Este equipo ya está completo (máximo 2 miembros)')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no se encuentra el equipo', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: false, status: 404 });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('XXXX0000');
    expect(screen.getByText('No se encontró ningún equipo con ese código')).toBeInTheDocument();
    expect(screen.getByText('Verifica que el código sea correcto e inténtalo de nuevo')).toBeInTheDocument();
  });

  it('envia la solicitud y muestra el exito', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({
      ok: true,
      payload: { ...equipo, miembros: [{ id: 10, nombre: 'ana' }] }
    });
    backend.teamService.requestJoinWithCode.mockResolvedValue({ ok: true, payload: {} });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    fireEvent.click(screen.getByText('Solicitar unirse'));
    await waitFor(() => {
      expect(backend.teamService.requestJoinWithCode).toHaveBeenCalledWith('ABC12345');
    });
    expect(await screen.findByText('¡Solicitud enviada con éxito!')).toBeInTheDocument();
  });

  it('vuelve al formulario si falla la solicitud', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipoDisponible });
    backend.teamService.requestJoinWithCode.mockResolvedValue({ ok: false, payload: { message: 'fallo' } });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    fireEvent.click(screen.getByText('Solicitar unirse'));
    await waitFor(() => {
      expect(screen.queryByText('los cracks')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Unirse a un equipo')).toBeInTheDocument();
  });

  it('reinicia el estado al pulsar enviar otra solicitud', async () => {
    backend.teamService.getTeamByCode.mockResolvedValue({ ok: true, payload: equipoDisponible });
    backend.teamService.requestJoinWithCode.mockResolvedValue({ ok: true, payload: {} });
    renderJoinTeam({ users: { user: { id: 1 } } });
    await buscarCodigo('ABC12345');
    fireEvent.click(screen.getByText('Solicitar unirse'));
    fireEvent.click(await screen.findByText('Enviar otra solicitud'));
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });
});
