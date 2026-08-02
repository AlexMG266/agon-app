import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import MyMatches from './MyMatches';
import backend from '../../../backend';
import users from '../../users';

vi.mock('../../../backend', () => ({
  default: {
    tournamentService: { getMyMatches: vi.fn() },
    teamService: { getMyTeams: vi.fn() }
  }
}));

vi.mock('../../users', () => ({
  default: { selectors: { getUser: vi.fn() } }
}));

const messages = {
  'project.matches.title': 'Mis Partidos',
  'project.matches.subtitle': 'Tus encuentros organizados por fecha',
  'project.matches.loading': 'Cargando partidos…',
  'project.matches.error': 'No se pudieron cargar tus partidos. Inténtalo de nuevo.',
  'project.matches.empty': 'Aún no tienes partidos programados.',
  'project.matches.summaryTotal': 'Partidos',
  'project.matches.summaryPending': 'Pendientes',
  'project.matches.noEncuentros': 'No hay encuentros en esta fecha.',
  'project.matches.today': 'Hoy',
  'project.matches.count': '{count, plural, one {# partido} other {# partidos}}',
  'project.matches.estado.pendiente': 'Pendiente',
  'project.matches.estado.jugado': 'Jugado',
  'project.matches.estado.aplazado': 'Aplazado',
  'project.matches.estado.solicitadoAplazamiento': 'Aplazamiento solicitado'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderMyMatches = (user = { id: 1 }) => {
  users.selectors.getUser.mockReturnValue(user);
  return render(
    <IntlProvider locale="es" messages={messages}>
      <Provider store={storeMock}>
        <MyMatches />
      </Provider>
    </IntlProvider>
  );
};

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fechasFixture = () => [
  {
    fecha: hoy(),
    encuentros: [
      { id: 1, equipoLocalNombre: 'Alpha', equipoVisitanteNombre: 'Beta', estado: 'JUGADO', resultado: '2-1', fechaRealizacion: `${hoy()}T20:00:00` }
    ]
  },
  {
    fecha: '2026-09-01',
    encuentros: [
      { id: 2, equipoLocalNombre: 'Gamma', equipoVisitanteNombre: 'Delta', estado: 'PENDIENTE', fechaRealizacion: '2026-09-01T18:00:00' }
    ]
  }
];

beforeAll(() => {
  if (!Element.prototype.scrollBy) {
    Object.defineProperty(Element.prototype, 'scrollBy', { value: () => {}, writable: true });
  }
});

describe('MyMatches', () => {
  beforeEach(() => {
    backend.tournamentService.getMyMatches.mockReset();
    backend.teamService.getMyTeams.mockReset();
    backend.teamService.getMyTeams.mockResolvedValue({ ok: true, payload: [] });
  });

  it('muestra el spinner mientras carga', () => {
    backend.tournamentService.getMyMatches.mockReturnValue(new Promise(() => {}));
    renderMyMatches();
    expect(screen.getByText('Cargando partidos…')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: false });
    renderMyMatches();
    expect(await screen.findByText('No se pudieron cargar tus partidos. Inténtalo de nuevo.')).toBeInTheDocument();
  });

  it('muestra el vacio cuando no hay partidos', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: true, payload: [] });
    renderMyMatches();
    expect(await screen.findByText('Aún no tienes partidos programados.')).toBeInTheDocument();
  });

  it('muestra el resumen, las fechas y las tarjetas de partidos', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: true, payload: fechasFixture() });
    const { container } = renderMyMatches();
    expect(await screen.findByText('Mis Partidos')).toBeInTheDocument();
    const values = container.querySelectorAll('.mm-summary-value');
    expect(values[0]).toHaveTextContent('2');
    expect(values[1]).toHaveTextContent('1');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Jugado')).toBeInTheDocument();
    expect(container.querySelector('.mm-partido-card-score')).toHaveTextContent('2');
  });

  it('navega entre fechas con los botones del carrusel', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: true, payload: fechasFixture() });
    const { container } = renderMyMatches();
    expect(await screen.findByText('Hoy')).toBeInTheDocument();
    const prev = screen.getByRole('button', { name: 'Fecha anterior' });
    const next = screen.getByRole('button', { name: 'Fecha siguiente' });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
    fireEvent.click(next);
    await waitFor(() => expect(container.querySelector('.mm-day-title')).toHaveTextContent(/septiembre/));
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.queryByText('Jugado')).not.toBeInTheDocument();
    expect(prev).not.toBeDisabled();
    fireEvent.click(prev);
    await waitFor(() => expect(screen.getByText('Hoy')).toBeInTheDocument());
  });

  it('cambia de fecha con el selector movil', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: true, payload: fechasFixture() });
    const { container } = renderMyMatches();
    await screen.findByText('Hoy');
    fireEvent.change(screen.getByLabelText('Seleccionar fecha'), { target: { value: '1' } });
    await waitFor(() => expect(container.querySelector('.mm-day-title')).toHaveTextContent(/septiembre/));
  });

  it('abre el modal de detalle al pulsar un partido', async () => {
    backend.tournamentService.getMyMatches.mockResolvedValue({ ok: true, payload: fechasFixture() });
    renderMyMatches();
    await screen.findByText('Alpha');
    fireEvent.click(screen.getByText('Alpha'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
