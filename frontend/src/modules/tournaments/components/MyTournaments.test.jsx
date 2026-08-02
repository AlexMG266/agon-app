import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import MyTournaments from './MyTournaments';
import tournaments from '../../tournaments';

vi.mock('../../tournaments', () => ({
  default: {
    actions: {
      getMyTournaments: vi.fn(),
      getFollowedTournaments: vi.fn(),
      getEnrolledTournaments: vi.fn()
    }
  }
}));

const messages = {
  'project.tournaments.MyTournaments.title': 'Mis Torneos',
  'project.tournaments.MyTournaments.subtitle': 'Torneos que has creado, sigues o en los que estás inscrito',
  'project.tournaments.MyTournaments.create': 'Crear torneo',
  'project.tournaments.MyTournaments.section.created': 'Creados',
  'project.tournaments.MyTournaments.section.created.desc': 'Torneos que organizas y administras',
  'project.tournaments.MyTournaments.section.created.empty': 'Aún no has creado ningún torneo',
  'project.tournaments.MyTournaments.section.followed': 'Siguiendo',
  'project.tournaments.MyTournaments.section.followed.desc': 'Torneos que sigues para estar al día',
  'project.tournaments.MyTournaments.section.followed.empty': 'No sigues ningún torneo todavía',
  'project.tournaments.MyTournaments.section.enrolled': 'Inscrito',
  'project.tournaments.MyTournaments.section.enrolled.desc': 'Torneos en los que participas con tu equipo',
  'project.tournaments.MyTournaments.section.enrolled.empty': 'No estás inscrito en ningún torneo',
  'project.tournaments.MyTournaments.organizer': 'Organizador'
};

const createMockStore = (state) => ({
  getState: () => state,
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderMyTournaments = (state) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={createMockStore(state)}>
      <MemoryRouter>
        <MyTournaments />
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

describe('MyTournaments', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ id: 5 }));
    tournaments.actions.getMyTournaments.mockClear();
    tournaments.actions.getFollowedTournaments.mockClear();
    tournaments.actions.getEnrolledTournaments.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('despacha las tres acciones de listado', () => {
    renderMyTournaments({ tournaments: { loading: false } });
    expect(tournaments.actions.getMyTournaments).toHaveBeenCalled();
    expect(tournaments.actions.getFollowedTournaments).toHaveBeenCalled();
    expect(tournaments.actions.getEnrolledTournaments).toHaveBeenCalled();
  });

  it('muestra el spinner mientras carga', () => {
    const { container } = renderMyTournaments({ tournaments: { loading: true } });
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('muestra las tres secciones con sus contadores y vacios', () => {
    const state = {
      tournaments: {
        loading: false,
        userTournaments: [{ id: 1, nombre: 'liga a' }],
        followedTournaments: [],
        enrolledTournaments: [{ id: 2, nombre: 'liga b' }]
      }
    };
    const { container } = renderMyTournaments(state);
    expect(screen.getByText('Creados')).toBeInTheDocument();
    expect(screen.getByText('Siguiendo')).toBeInTheDocument();
    expect(screen.getByText('Inscrito')).toBeInTheDocument();
    const counts = container.querySelectorAll('.my-t-count');
    expect(counts[0]).toHaveTextContent('1');
    expect(counts[1]).toHaveTextContent('0');
    expect(counts[2]).toHaveTextContent('1');
    expect(screen.getByText('No sigues ningún torneo todavía')).toBeInTheDocument();
    expect(screen.getByText('liga a').closest('a')).toHaveAttribute('href', '/tournaments/view/1');
    expect(screen.getByText('liga b').closest('a')).toHaveAttribute('href', '/tournaments/view/2');
  });

  it('marca al organizador con su etiqueta', () => {
    const state = {
      tournaments: {
        loading: false,
        userTournaments: [{ id: 1, nombre: 'mi torneo', organizadorId: 5, estado: 'EN_CURSO' }],
        followedTournaments: [],
        enrolledTournaments: []
      }
    };
    renderMyTournaments(state);
    expect(screen.getByText('Organizador')).toBeInTheDocument();
    expect(screen.getByText('EN_CURSO')).toBeInTheDocument();
  });

  it('no marca organizador cuando no coincide el id', () => {
    const state = {
      tournaments: {
        loading: false,
        userTournaments: [{ id: 1, nombre: 'torneo ajeno', organizadorId: 9, estado: 'CREADO' }],
        followedTournaments: [],
        enrolledTournaments: []
      }
    };
    renderMyTournaments(state);
    expect(screen.queryByText('Organizador')).not.toBeInTheDocument();
  });

  it('muestra el icono de candado en torneos privados', () => {
    const state = {
      tournaments: {
        loading: false,
        userTournaments: [{ id: 1, nombre: 'privado', privado: true, estado: 'CREADO' }],
        followedTournaments: [],
        enrolledTournaments: []
      }
    };
    const { container } = renderMyTournaments(state);
    expect(container.querySelector('.my-t-row-lock')).not.toBeNull();
  });
});
