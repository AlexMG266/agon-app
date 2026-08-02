import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import TournamentDetail from './TournamentDetail';
import backend from '../../../backend';
import users from '../../users';

vi.mock('../../../backend', () => ({
  default: {
    tournamentService: {
      getTournament: vi.fn(),
      getTournamentJornadas: vi.fn(),
      requestEnroll: vi.fn(),
      closeTournament: vi.fn(),
      followTournament: vi.fn(),
      unfollowTournament: vi.fn(),
      configureTournament: vi.fn(),
      updateTournament: vi.fn()
    },
    teamService: { getMyTeams: vi.fn(), getTeam: vi.fn() }
  }
}));

vi.mock('../../users', () => ({
  default: { selectors: { getUser: vi.fn() } }
}));

const messages = {
  'project.tournaments.Detail.loading': 'Cargando torneo...',
  'project.tournaments.Detail.notFound': 'Torneo no encontrado',
  'project.tournaments.Detail.backToDashboard': 'Volver al inicio',
  'project.tournaments.Detail.estado.reclutando': 'Reclutando',
  'project.tournaments.Detail.estado.inscripcionCerrada': 'Inscripción cerrada',
  'project.tournaments.Detail.estado.faseGrupos': 'Fase de grupos',
  'project.tournaments.Detail.estado.playoff': 'Playoff',
  'project.tournaments.Detail.follow.follow': 'Seguir',
  'project.tournaments.Detail.follow.unfollow': 'Dejar de seguir',
  'project.tournaments.Detail.closeInscriptions': 'Cerrar inscripciones',
  'project.tournaments.Detail.close.button': 'Cerrar',
  'project.tournaments.Detail.close.success': 'Inscripciones cerradas con éxito. Ya puedes configurar la estructura del torneo.',
  'project.tournaments.Detail.enroll.title': 'Inscribir equipo',
  'project.tournaments.Detail.enroll.select': 'Seleccionar equipo...',
  'project.tournaments.Detail.enroll.button': 'Solicitar inscripción',
  'project.tournaments.Detail.enroll.noTeams': 'No tienes equipos disponibles para inscribir o ya están inscritos.',
  'project.tournaments.Detail.enroll.requestSent': '¡Solicitud de inscripción enviada para "{team}"! El organizador la revisará.',
  'project.tournaments.Detail.config.header': 'Configurar estructura',
  'project.tournaments.Detail.config.generate': 'Generar calendario',
  'project.tournaments.Detail.config.success': 'Estructura configurada y calendario generado con éxito.',
  'project.tournaments.Detail.params.title': 'Parámetros del torneo',
  'project.tournaments.Detail.params.edit': 'Editar',
  'project.tournaments.Detail.params.locked': 'Bloqueado',
  'project.tournaments.Detail.params.save': 'Guardar cambios',
  'project.tournaments.Detail.updateSuccess': 'Configuración del torneo actualizada con éxito.',
  'project.tournaments.Detail.registeredTeams': 'Equipos inscritos',
  'project.tournaments.Detail.teams.empty': 'No hay equipos inscritos aún.',
  'project.tournaments.Detail.partidos.title': 'Partidos',
  'project.tournaments.Detail.partidos.jornada': 'Jornada',
  'project.tournaments.Detail.partidos.noCalendar': 'Aún no hay partidos. El calendario se generará cuando el organizador configure el torneo.',
  'project.tournaments.Detail.partidos.sinGrupo': 'Sin grupo',
  'project.tournaments.Detail.playoffs.title': 'Playoffs',
  'project.tournaments.Detail.playoffs.empty': 'Aún no hay playoffs. Se generarán automáticamente cuando termine la fase de grupos.',
  'project.tournaments.Detail.playoffs.noEncuentros': 'No hay encuentros en esta ronda todavía. Se mostrarán cuando se hayan jugado las rondas anteriores.',
  'project.tournaments.Detail.playoffs.round.CUARTOS': 'Cuartos de final',
  'project.tournaments.Detail.playoffs.round.SEMIFINALES': 'Semifinales',
  'project.tournaments.Detail.playoffs.round.FINAL': 'Final',
  'project.tournaments.Detail.clasificacion.title': 'Clasificación',
  'project.tournaments.Detail.clasificacion.team': 'Equipo',
  'project.tournaments.Detail.clasificacion.pts': 'PTS',
  'project.tournaments.Detail.clasificacion.noTeams': 'No hay equipos inscritos para mostrar clasificación.',
  'project.tournaments.Detail.clasificacion.notAvailable': 'La clasificación estará disponible cuando el torneo esté en fase de grupos.'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderDetail = (user = { id: 1 }) => {
  users.selectors.getUser.mockReturnValue(user);
  return render(
    <IntlProvider locale="es" messages={messages}>
      <Provider store={storeMock}>
        <MemoryRouter initialEntries={['/', '/tournaments/view/1']} initialIndex={1}>
          <Routes>
            <Route path="/tournaments/view/:id" element={<TournamentDetail />} />
            <Route path="/" element={<div>PAGINA_INICIO</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </IntlProvider>
  );
};

const torneoBase = (overrides = {}) => ({
  id: 1,
  nombre: 'Copa de Prueba',
  organizadorId: 1,
  organizadorNombre: 'Juan Organizador',
  privado: false,
  codigoTorneo: 'ABC123',
  maxEquipos: 8,
  estado: 'RECLUTANDO',
  fechaInicio: '2026-09-01T10:00:00',
  fechaFin: '2026-10-01T10:00:00',
  fechaLimiteInscripcion: '2026-08-20T10:00:00',
  puntosVictoria: 3,
  puntosEmpate: 1,
  puntosDerrota: 0,
  formatoPartidos: 'BO3',
  diasDisponibles: ['L', 'X'],
  horaInicio: '18:00',
  horaFin: '22:00',
  duracionPartido: 60,
  estrategiaDistribucion: 'JORNADAS',
  fechasExcluidas: [],
  tipoTorneo: null,
  inscripciones: [],
  ...overrides
});

const inscripcion = (equipoId, nombre, grupo = null) => ({
  equipoId,
  nombreEquipo: nombre,
  creadorId: 1,
  ...(grupo ? { grupoId: grupo.grupoId, grupoNombre: grupo.grupoNombre } : {})
});

const jornadaLiga = () => ({
  id: 1,
  numeroJornada: 1,
  tipoFase: 'LIGA_GRUPO',
  fechaInicio: '2026-09-01T10:00:00',
  encuentros: [
    { id: 10, equipoLocalId: 5, equipoLocalNombre: 'Los Reyes', equipoVisitanteId: 6, equipoVisitanteNombre: 'Los Halcones', estado: 'PENDIENTE', fechaRealizacion: '2026-09-01T20:00:00' }
  ]
});

const jornadaEliminatoria = () => ({
  id: 2,
  numeroJornada: 1,
  tipoFase: 'ELIMINATORIA',
  fechaInicio: '2026-10-05T10:00:00',
  encuentros: [
    { id: 20, equipoLocalId: 5, equipoLocalNombre: 'Los Reyes', equipoVisitanteId: 6, equipoVisitanteNombre: 'Los Halcones', estado: 'PENDIENTE', fechaRealizacion: '2026-10-05T20:00:00' }
  ]
});

beforeAll(() => {
  if (!Element.prototype.scrollBy) {
    Object.defineProperty(Element.prototype, 'scrollBy', { value: () => {}, writable: true });
  }
});

describe('TournamentDetail', () => {
  beforeEach(() => {
    backend.tournamentService.getTournament.mockReset();
    backend.tournamentService.getTournamentJornadas.mockReset();
    backend.tournamentService.requestEnroll.mockReset();
    backend.tournamentService.closeTournament.mockReset();
    backend.tournamentService.followTournament.mockReset();
    backend.tournamentService.unfollowTournament.mockReset();
    backend.tournamentService.configureTournament.mockReset();
    backend.tournamentService.updateTournament.mockReset();
    backend.teamService.getMyTeams.mockReset();
    backend.teamService.getTeam.mockReset();
    backend.tournamentService.getTournamentJornadas.mockResolvedValue({ ok: true, payload: [] });
    backend.teamService.getMyTeams.mockResolvedValue({ ok: true, payload: [] });
  });

  it('muestra el spinner mientras carga', () => {
    backend.tournamentService.getTournament.mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByText('Cargando torneo...')).toBeInTheDocument();
  });

  it('muestra torneo no encontrado y navega al inicio', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: false, error: 'Error loading tournament' });
    renderDetail();
    expect(await screen.findByText('Torneo no encontrado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }));
    expect(screen.getByText('PAGINA_INICIO')).toBeInTheDocument();
  });

  it('muestra la informacion del torneo para el organizador en RECLUTANDO', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase() });
    renderDetail();
    expect(await screen.findAllByText('Copa de Prueba')).toHaveLength(2);
    expect(screen.getByText('Reclutando')).toBeInTheDocument();
    expect(screen.getByText('Juan Organizador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguir' })).toBeInTheDocument();
    expect(screen.getByText('Cerrar inscripciones')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(screen.getByText('Parámetros del torneo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('sigue y deja de seguir el torneo', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase() });
    backend.tournamentService.followTournament.mockResolvedValue({ ok: true });
    backend.tournamentService.unfollowTournament.mockResolvedValue({ ok: true });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('button', { name: 'Seguir' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dejar de seguir' })).toBeInTheDocument());
    expect(backend.tournamentService.followTournament).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getByRole('button', { name: 'Dejar de seguir' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Seguir' })).toBeInTheDocument());
    expect(backend.tournamentService.unfollowTournament).toHaveBeenCalledWith('1');
  });

  it('cierra las inscripciones y muestra el mensaje de exito', async () => {
    const torneo = torneoBase();
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.tournamentService.closeTournament.mockResolvedValue({ ok: true });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(backend.tournamentService.closeTournament).toHaveBeenCalledWith('1');
    expect(await screen.findByText('Inscripciones cerradas con éxito. Ya puedes configurar la estructura del torneo.')).toBeInTheDocument();
  });

  it('solicita la inscripcion de un equipo como usuario no organizador', async () => {
    const torneo = torneoBase({ organizadorId: 1 });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.tournamentService.requestEnroll.mockResolvedValue({ ok: true });
    backend.teamService.getMyTeams.mockResolvedValue({
      ok: true,
      payload: [{ id: 5, nombreEquipo: 'Los Reyes', estado: 'ACTIVO', creadorId: 2 }]
    });
    const { container } = renderDetail({ id: 2 });
    expect(await screen.findByText('Inscribir equipo')).toBeInTheDocument();
    fireEvent.change(container.querySelector('.td-enroll-select'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar inscripción' }));
    expect(backend.tournamentService.requestEnroll).toHaveBeenCalledWith('1', 5);
    expect(await screen.findByText(/Solicitud de inscripción enviada para "Los Reyes"/)).toBeInTheDocument();
  });

  it('muestra aviso cuando no hay equipos disponibles para inscribir', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase({ organizadorId: 1 }) });
    backend.teamService.getMyTeams.mockResolvedValue({ ok: true, payload: [] });
    renderDetail({ id: 2 });
    expect(await screen.findByText('No tienes equipos disponibles para inscribir o ya están inscritos.')).toBeInTheDocument();
  });

  it('configura la estructura y valida el numero de grupos', async () => {
    const torneo = torneoBase({
      estado: 'INSCRIPCION_CERRADA',
      fechaInicio: '2026-09-01',
      inscripciones: [1, 2, 3, 4].map(n => inscripcion(n, `Equipo ${n}`))
    });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.tournamentService.configureTournament.mockResolvedValue({ ok: true });
    const { container } = renderDetail();
    expect(await screen.findByText('Configurar estructura')).toBeInTheDocument();
    const numGrupos = container.querySelector('.td-config-field--num input[type="number"]');
    fireEvent.change(numGrupos, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generar calendario' }));
    expect(screen.getByText('El número de grupos debe ser potencia de 2 para la eliminatoria')).toBeInTheDocument();
    expect(backend.tournamentService.configureTournament).not.toHaveBeenCalled();
    fireEvent.change(numGrupos, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generar calendario' }));
    expect(backend.tournamentService.configureTournament).toHaveBeenCalledWith('1', expect.objectContaining({
      tipoTorneo: 'GRUPOS_PLAYOFF',
      numGrupos: 4,
      tienePlayoff: true
    }));
    expect(await screen.findByText('Estructura configurada y calendario generado con éxito.')).toBeInTheDocument();
  });

  it('edita los parametros del torneo y los guarda', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase({ estado: 'INSCRIPCION_CERRADA' }) });
    backend.tournamentService.updateTournament.mockResolvedValue({ ok: true });
    const { container } = renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const nombreInput = container.querySelector('.td-edit-form input.td-edit-input');
    fireEvent.change(nombreInput, { target: { value: 'Nuevo Nombre' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(backend.tournamentService.updateTournament).toHaveBeenCalledWith('1', expect.objectContaining({ nombre: 'Nuevo Nombre' }));
    expect(await screen.findByText('Configuración del torneo actualizada con éxito.')).toBeInTheDocument();
  });

  it('bloquea la edicion cuando el torneo ya tiene estructura', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({
      ok: true,
      payload: torneoBase({ estado: 'FASE_GRUPOS', tipoTorneo: 'GRUPOS_PLAYOFF' })
    });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled();
  });

  it('muestra los equipos inscritos con paginacion y abre el modal de equipo', async () => {
    const torneo = torneoBase({
      inscripciones: Array.from({ length: 12 }, (_, i) => inscripcion(i + 1, `Equipo ${i + 1}`))
    });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.teamService.getTeam.mockResolvedValue({
      ok: true,
      payload: { nombreEquipo: 'Los Reyes', descripcion: 'Equipo de prueba', miembros: [{ id: 1, nombre: 'Ana' }] }
    });
    const { container } = renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Equipos' }));
    expect(screen.getByText('Equipos inscritos')).toBeInTheDocument();
    expect(container.querySelectorAll('.td-teams-card').length).toBe(10);
    expect(container.querySelector('.td-teams-pagination-info')).toHaveTextContent('1 / 2');
    fireEvent.click(container.querySelectorAll('.td-teams-pagination-btn')[1]);
    expect(container.querySelectorAll('.td-teams-card').length).toBe(2);
    expect(screen.getByText('Equipo 12')).toBeInTheDocument();
    fireEvent.click(container.querySelectorAll('.td-teams-card')[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Los Reyes')).toBeInTheDocument();
    expect(backend.teamService.getTeam).toHaveBeenCalledWith(11);
  });

  it('muestra los partidos de una jornada y abre el modal de encuentro', async () => {
    const torneo = torneoBase({
      inscripciones: [inscripcion(5, 'Los Reyes', { grupoId: 1, grupoNombre: 'Grupo A' })]
    });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.tournamentService.getTournamentJornadas.mockResolvedValue({ ok: true, payload: [jornadaLiga()] });
    const { container } = renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Partidos' }));
    expect(screen.getByText('Jornada 1')).toBeInTheDocument();
    expect(screen.getByText('Grupo A')).toBeInTheDocument();
    expect(screen.getByText('Los Reyes')).toBeInTheDocument();
    expect(screen.getByText('Los Halcones')).toBeInTheDocument();
    fireEvent.click(container.querySelector('.td-partido-card'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('muestra el aviso de calendario vacio en partidos', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase() });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Partidos' }));
    expect(await screen.findByText('Aún no hay partidos. El calendario se generará cuando el organizador configure el torneo.')).toBeInTheDocument();
  });

  it('muestra los playoffs vacios cuando no hay eliminatorias', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase() });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Playoffs' }));
    expect(await screen.findByText('Aún no hay playoffs. Se generarán automáticamente cuando termine la fase de grupos.')).toBeInTheDocument();
  });

  it('navega entre rondas de playoffs y muestra sus encuentros', async () => {
    const torneo = torneoBase({ estado: 'PLAYOFF', rondaInicioPlayoff: 'CUARTOS' });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    backend.tournamentService.getTournamentJornadas.mockResolvedValue({ ok: true, payload: [jornadaEliminatoria()] });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Playoffs' }));
    expect((await screen.findAllByText('Cuartos de final')).length).toBeGreaterThan(0);
    expect(screen.getByText('Los Reyes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ronda siguiente' }));
    expect(await screen.findByText('No hay encuentros en esta ronda todavía. Se mostrarán cuando se hayan jugado las rondas anteriores.')).toBeInTheDocument();
    expect((await screen.findAllByText('Semifinales')).length).toBeGreaterThan(0);
  });

  it('muestra la clasificacion de la fase de grupos', async () => {
    const torneo = torneoBase({
      estado: 'FASE_GRUPOS',
      tipoTorneo: 'GRUPOS_PLAYOFF',
      tienePlayoff: true,
      rondaInicioPlayoff: 'CUARTOS',
      numGrupos: 2,
      inscripciones: [
        { equipoId: 1, nombreEquipo: 'Alpha', grupoId: 1, grupoNombre: 'Grupo A', puntosLiga: 6, setsGanados: 4, setsPerdidos: 1, partidosJugados: 2, partidosGanados: 2 },
        { equipoId: 2, nombreEquipo: 'Beta', grupoId: 1, grupoNombre: 'Grupo A', puntosLiga: 3, setsGanados: 2, setsPerdidos: 3, partidosJugados: 2, partidosGanados: 1 },
        { equipoId: 3, nombreEquipo: 'Gamma', grupoId: 2, grupoNombre: 'Grupo B', puntosLiga: 9, setsGanados: 5, setsPerdidos: 0, partidosJugados: 2, partidosGanados: 3 }
      ]
    });
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneo });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Clasificación' }));
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('PTS')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('muestra aviso cuando la clasificacion no esta disponible', async () => {
    backend.tournamentService.getTournament.mockResolvedValue({ ok: true, payload: torneoBase() });
    renderDetail();
    await screen.findAllByText('Copa de Prueba');
    fireEvent.click(screen.getByRole('tab', { name: 'Clasificación' }));
    expect(await screen.findByText('La clasificación estará disponible cuando el torneo esté en fase de grupos.')).toBeInTheDocument();
  });
});
