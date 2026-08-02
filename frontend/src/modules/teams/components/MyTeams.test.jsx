import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import MyTeams from './MyTeams';
import teams from '../../teams';

vi.mock('../../teams', () => ({
  default: {
    actions: {
      getMyTeams: vi.fn()
    }
  }
}));

vi.mock('./CreateTeam', () => ({
  default: () => <div data-testid="create-team-modal" />
}));

const messages = {
  'project.teams.MyTeams.title': 'Mis Equipos',
  'project.teams.MyTeams.subtitle': 'Equipos que has creado',
  'project.teams.MyTeams.create': '+ Crear equipo',
  'project.teams.MyTeams.members': '{count} miembros',
  'project.teams.MyTeams.noTeams': 'Aún no tienes equipos',
  'project.teams.MyTeams.noTeamsHelp': 'Crea tu primer equipo para empezar a competir',
  'project.teams.MyTeams.createAction': 'Crear equipo →',
  'project.global.buttons.back': 'Atrás',
  'project.global.buttons.next': 'Siguiente'
};

const createMockStore = (state) => ({
  getState: () => state,
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderMyTeams = (state) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={createMockStore(state)}>
      <MemoryRouter>
        <MyTeams />
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

describe('MyTeams', () => {
  beforeEach(() => {
    teams.actions.getMyTeams.mockClear();
  });

  it('despacha getMyTeams al montar', () => {
    renderMyTeams({ teams: { userTeams: [], loading: false } });
    expect(teams.actions.getMyTeams).toHaveBeenCalled();
  });

  it('muestra el spinner mientras carga', () => {
    const { container } = renderMyTeams({ teams: { userTeams: [], loading: true } });
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('muestra la lista de equipos con enlaces y miembros', () => {
    const fecha = Date.UTC(2026, 7, 3);
    const equipos = [{
      id: 1,
      nombreEquipo: 'los cracks',
      fechaCreacion: fecha,
      miembros: [{ id: 1 }, { id: 2 }]
    }];
    renderMyTeams({ teams: { userTeams: equipos, loading: false } });
    const link = screen.getByText('los cracks').closest('a');
    expect(link).toHaveAttribute('href', '/teams/view/1');
    expect(screen.getByText('2 miembros')).toBeInTheDocument();
    const fechaEsperada = new Date(fecha).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    expect(screen.getByText(fechaEsperada)).toBeInTheDocument();
  });

  it('usa team.nombre cuando no hay nombreEquipo', () => {
    const equipos = [{ id: 2, nombre: 'alternativo', miembros: [] }];
    renderMyTeams({ teams: { userTeams: equipos, loading: false } });
    expect(screen.getByText('alternativo')).toBeInTheDocument();
    expect(screen.getByText('0 miembros')).toBeInTheDocument();
  });

  it('muestra el estado vacio con boton de crear equipo', () => {
    renderMyTeams({ teams: { userTeams: [], loading: false } });
    expect(screen.getByText('Aún no tienes equipos')).toBeInTheDocument();
    expect(screen.getByText('Crear equipo →')).toBeInTheDocument();
  });

  it('abre el modal de creacion al pulsar el boton del header', () => {
    renderMyTeams({ teams: { userTeams: [], loading: false } });
    expect(screen.queryByTestId('create-team-modal')).toBeInTheDocument();
  });

  it('pagina los equipos de 5 en 5 y permite navegar entre paginas', () => {
    const equipos = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      nombre: `equipo ${i + 1}`,
      miembros: []
    }));
    const { container } = renderMyTeams({ teams: { userTeams: equipos, loading: false } });

    // Primera página: solo 5 equipos visibles
    expect(screen.getByText('equipo 1')).toBeInTheDocument();
    expect(screen.getByText('equipo 5')).toBeInTheDocument();
    expect(screen.queryByText('equipo 6')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.mt-row')).toHaveLength(5);

    // El pager está visible
    expect(container.querySelector('.mt-pager')).not.toBeNull();

    // Navegar a la segunda página
    fireEvent.click(screen.getByText('Siguiente'));
    expect(screen.queryByText('equipo 1')).not.toBeInTheDocument();
    expect(screen.getByText('equipo 6')).toBeInTheDocument();
    expect(screen.getByText('equipo 7')).toBeInTheDocument();

    // Volver a la primera página
    fireEvent.click(screen.getByText('Atrás'));
    expect(screen.getByText('equipo 1')).toBeInTheDocument();
    expect(screen.queryByText('equipo 6')).not.toBeInTheDocument();
  });

  it('no muestra el pager cuando hay 5 o menos equipos', () => {
    const equipos = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      nombre: `equipo ${i + 1}`,
      miembros: []
    }));
    renderMyTeams({ teams: { userTeams: equipos, loading: false } });
    expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
  });
});
