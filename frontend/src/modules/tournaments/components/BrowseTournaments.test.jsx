import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Routes, Route } from 'react-router';
import BrowseTournaments from './BrowseTournaments';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    tournamentService: {
      getAllTournaments: vi.fn(),
      searchTournaments: vi.fn(),
      getTournamentByCode: vi.fn()
    }
  }
}));

const messages = {
  'project.tournaments.Browse.title': 'Explorar Torneos',
  'project.tournaments.Browse.subtitle': 'Encuentra torneos disponibles para inscribirte',
  'project.tournaments.Browse.searchPlaceholder': 'Buscar por nombre...',
  'project.tournaments.Browse.codePlaceholder': 'Código torneo',
  'project.tournaments.Browse.filterAll': 'Todos los estados',
  'project.tournaments.Browse.filterEnJuego': 'En juego',
  'project.tournaments.Detail.estado.reclutando': 'Reclutando',
  'project.tournaments.Detail.estado.inscripcionCerrada': 'Inscripción cerrada',
  'project.tournaments.Detail.estado.faseGrupos': 'Fase de grupos',
  'project.tournaments.Detail.estado.playoff': 'Playoff',
  'project.tournaments.Detail.estado.finalizado': 'Finalizado',
  'project.tournaments.Browse.organizer': 'Organizador: {name}',
  'project.tournaments.Browse.teamsCount': '{count} equipo(s)',
  'project.tournaments.Browse.codeFound': 'Código: {code}',
  'project.tournaments.Browse.codeNotFound': 'No se encontró ningún torneo con ese código',
  'project.tournaments.Browse.codeError': 'Error al buscar por código',
  'project.tournaments.Browse.loadError': 'Error al cargar torneos',
  'project.tournaments.Browse.noResults': 'No se encontraron torneos con los filtros seleccionados',
  'project.tournaments.Browse.noTournaments': 'No hay torneos disponibles',
  'project.tournaments.Browse.noResultsHelp': 'Prueba con otros términos o limpia los filtros',
  'project.tournaments.Browse.noTournamentsHelp': 'Cuando alguien cree un torneo, aparecerá aquí',
  'project.tournaments.Browse.clearFilter': 'Limpiar',
  'project.global.buttons.back': 'Anterior',
  'project.global.buttons.next': 'Siguiente'
};

const renderBrowse = () => render(
  <IntlProvider locale="es" messages={messages}>
    <MemoryRouter initialEntries={['/', '/tournaments']} initialIndex={1}>
      <Routes>
        <Route path="/tournaments" element={<BrowseTournaments />} />
        <Route path="/tournaments/view/:id" element={<div>DETALLE_TORNEO</div>} />
        <Route path="/" element={<div>PAGINA_INICIO</div>} />
      </Routes>
    </MemoryRouter>
  </IntlProvider>
);

const torneo = (overrides = {}) => ({
  id: 1,
  nombre: 'Copa de Prueba',
  organizadorNombre: 'Juan Org',
  numEquiposInscritos: 8,
  estado: 'RECLUTANDO',
  privado: false,
  ...overrides
});

const respuesta = (items, existMoreItems = false) => ({
  ok: true,
  payload: { items, existMoreItems }
});

beforeEach(() => {
  Object.values(backend.tournamentService).forEach(fn => fn.mockReset());
});

describe('BrowseTournaments', () => {
  it('muestra el spinner mientras carga', () => {
    backend.tournamentService.getAllTournaments.mockReturnValue(new Promise(() => {}));
    const { container } = renderBrowse();
    expect(container.querySelector('.bt-loading')).toBeInTheDocument();
    expect(backend.tournamentService.getAllTournaments).toHaveBeenCalledWith(0, 5, 'ALL');
  });

  it('muestra el listado de torneos', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([
      torneo(),
      torneo({ id: 2, nombre: 'Liga Invierno', estado: 'FINALIZADO', privado: true, numEquiposInscritos: 4 })
    ], true));
    renderBrowse();
    expect(await screen.findByText('Explorar Torneos')).toBeInTheDocument();
    expect(screen.getByText('Copa de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Liga Invierno')).toBeInTheDocument();
    expect(screen.getAllByText('Organizador: Juan Org').length).toBe(2);
    expect(screen.getByText('8 equipo(s)')).toBeInTheDocument();
    expect(screen.getAllByText('Reclutando').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Finalizado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🔒').length).toBe(1);
  });

  it('muestra un error de carga', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue({ ok: false, error: 'Error de prueba' });
    renderBrowse();
    expect(await screen.findByText('Error de prueba')).toBeInTheDocument();
  });

  it('navega al detalle al pulsar un torneo', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([torneo()]));
    renderBrowse();
    await screen.findByText('Copa de Prueba');
    fireEvent.click(screen.getByText('Copa de Prueba'));
    expect(await screen.findByText('DETALLE_TORNEO')).toBeInTheDocument();
  });

  it('hace una busqueda por nombre', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([torneo()]));
    backend.tournamentService.searchTournaments.mockResolvedValue(respuesta([torneo({ id: 3, nombre: 'Copa Verano' })]));
    const { container } = renderBrowse();
    await screen.findByText('Copa de Prueba');
    fireEvent.change(container.querySelector('.bt-search-input'), { target: { value: 'Copa' } });
    fireEvent.submit(container.querySelector('.bt-search-form'));
    await waitFor(() => expect(backend.tournamentService.searchTournaments).toHaveBeenCalledWith('Copa', 0, 5, 'ALL'));
    expect(await screen.findByText('Copa Verano')).toBeInTheDocument();
    expect(screen.queryByText('Copa de Prueba')).not.toBeInTheDocument();
  });

  it('filtra por estado', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([torneo()]));
    const { container } = renderBrowse();
    await screen.findByText('Copa de Prueba');
    fireEvent.change(container.querySelector('.bt-filter-select'), { target: { value: 'RECLUTANDO' } });
    await waitFor(() => expect(backend.tournamentService.getAllTournaments).toHaveBeenCalledWith(0, 5, 'RECLUTANDO'));
  });

  it('pasa a la siguiente pagina', async () => {
    backend.tournamentService.getAllTournaments
      .mockResolvedValueOnce(respuesta([torneo()], true))
      .mockResolvedValue(respuesta([torneo({ id: 4, nombre: 'Copa Otoño' })]));
    const { container } = renderBrowse();
    await screen.findByText('Copa de Prueba');
    expect(screen.getByRole('button', { name: 'Siguiente' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(backend.tournamentService.getAllTournaments).toHaveBeenCalledWith(1, 5, 'ALL'));
    expect(await screen.findByText('Copa Otoño')).toBeInTheDocument();
    expect(container.querySelector('.bt-pager')).toBeInTheDocument();
  });

  it('busca por codigo con exito', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([]));
    backend.tournamentService.getTournamentByCode.mockResolvedValue({
      ok: true,
      payload: { id: 9, nombre: 'Torneo Secreto', codigoTorneo: 'ABC123', privado: true }
    });
    const { container } = renderBrowse();
    await screen.findByText('Explorar Torneos');
    fireEvent.change(container.querySelector('.bt-code-input'), { target: { value: 'ABC123' } });
    fireEvent.submit(container.querySelector('.bt-code-form'));
    expect(await screen.findByText('Torneo Secreto')).toBeInTheDocument();
    expect(screen.getByText('Código: ABC123')).toBeInTheDocument();
    expect(backend.tournamentService.getTournamentByCode).toHaveBeenCalledWith('ABC123');
    expect(container.querySelector('.bt-code-result').getAttribute('href')).toBe('/tournaments/view/9');
  });

  it('muestra un error al buscar por codigo', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([]));
    backend.tournamentService.getTournamentByCode.mockResolvedValue({ ok: false });
    const { container } = renderBrowse();
    await screen.findByText('Explorar Torneos');
    fireEvent.change(container.querySelector('.bt-code-input'), { target: { value: 'NOPE' } });
    fireEvent.submit(container.querySelector('.bt-code-form'));
    expect(await screen.findByText('No se encontró ningún torneo con ese código')).toBeInTheDocument();
  });

  it('limpia los filtros y recarga', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([torneo()]));
    backend.tournamentService.searchTournaments.mockResolvedValue(respuesta([torneo({ id: 5, nombre: 'Copa Norte' })]));
    const { container } = renderBrowse();
    await screen.findByText('Copa de Prueba');
    fireEvent.change(container.querySelector('.bt-search-input'), { target: { value: 'Copa' } });
    fireEvent.submit(container.querySelector('.bt-search-form'));
    await screen.findByText('Copa Norte');
    fireEvent.click(container.querySelector('.bt-clear-btn'));
    await waitFor(() => expect(backend.tournamentService.getAllTournaments).toHaveBeenLastCalledWith(0, 5, 'ALL'));
    expect(await screen.findByText('Copa de Prueba')).toBeInTheDocument();
    expect(screen.queryByText('Copa Norte')).not.toBeInTheDocument();
  });

  it('muestra el estado vacio sin torneos', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([]));
    renderBrowse();
    expect(await screen.findByText('No hay torneos disponibles')).toBeInTheDocument();
    expect(screen.getByText('Cuando alguien cree un torneo, aparecerá aquí')).toBeInTheDocument();
  });

  it('muestra el estado vacio con filtros activos', async () => {
    backend.tournamentService.getAllTournaments.mockResolvedValue(respuesta([]));
    backend.tournamentService.searchTournaments.mockResolvedValue(respuesta([]));
    const { container } = renderBrowse();
    await screen.findByText('Explorar Torneos');
    fireEvent.change(container.querySelector('.bt-search-input'), { target: { value: 'zzz' } });
    fireEvent.submit(container.querySelector('.bt-search-form'));
    expect(await screen.findByText('No se encontraron torneos con los filtros seleccionados')).toBeInTheDocument();
    expect(screen.getAllByText('Limpiar').length).toBeGreaterThan(0);
  });
});
