import { render, screen } from '@testing-library/react';
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

const messages = {
  'project.teams.MyTeams.title': 'Mis Equipos',
  'project.teams.MyTeams.subtitle': 'Equipos que has creado',
  'project.teams.MyTeams.create': '+ Crear equipo',
  'project.teams.MyTeams.members': '{count} miembros',
  'project.teams.MyTeams.noTeams': 'Aún no tienes equipos',
  'project.teams.MyTeams.noTeamsHelp': 'Crea tu primer equipo para empezar a competir',
  'project.teams.MyTeams.createAction': 'Crear equipo →'
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

  it('muestra el estado vacio', () => {
    renderMyTeams({ teams: { userTeams: [], loading: false } });
    expect(screen.getByText('Aún no tienes equipos')).toBeInTheDocument();
    const createLink = screen.getByText('Crear equipo →').closest('a');
    expect(createLink).toHaveAttribute('href', '/teams/create');
  });
});
