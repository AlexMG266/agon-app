import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Routes, Route } from 'react-router';
import CreateTournament from './CreateTournament';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    tournamentService: {
      createTournament: vi.fn()
    }
  }
}));

const messages = {
  'project.tournaments.CreateTournament.badge': 'Creación de torneo',
  'project.tournaments.CreateTournament.title': 'Nuevo torneo',
  'project.tournaments.CreateTournament.step1.short': 'Información Básica',
  'project.tournaments.CreateTournament.step3.short': 'Reglas',
  'project.tournaments.CreateTournament.step4.short': 'Calendario',
  'project.tournaments.CreateTournament.step5.short': 'Resumen',
  'project.tournaments.CreateTournament.stepCount': 'Paso {n} de {total}',
  'project.tournaments.CreateTournament.step1.desc': 'Define el nombre y las fechas clave del torneo',
  'project.tournaments.CreateTournament.step3.desc': 'Configura el sistema de puntuación y formato de partidos',
  'project.tournaments.CreateTournament.step4.desc': 'Establece los días, horarios y la duración de los partidos',
  'project.tournaments.CreateTournament.step5.desc': 'Revisa todos los datos antes de crear el torneo',
  'project.global.buttons.back': 'Anterior',
  'project.global.buttons.next': 'Siguiente',
  'project.tournaments.CreateTournament.create': 'Crear torneo',
  'project.global.buttons.processing': 'Procesando...',
  'project.tournaments.CreateTournament.confirm.title': '¿Confirmar creación del torneo?',
  'project.tournaments.CreateTournament.confirm.description': 'Revisa todos los datos antes de crear el torneo.',
  'project.tournaments.CreateTournament.confirm.button': 'Crear Torneo',
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.common.ConfirmationModal.processing': 'Procesando...',
  'project.global.exceptions.NetworkError': 'Error de red',
  'project.global.validator.required': 'Campo obligatorio',
  'project.tournaments.CreateTournament.error.nameTooLong': 'El nombre no puede superar los 100 caracteres',
  'project.tournaments.CreateTournament.error.startInPast': 'La fecha de inicio no puede ser en el pasado',
  'project.tournaments.CreateTournament.error.inscriptionInPast': 'La fecha límite de inscripción no puede ser en el pasado',
  'project.tournaments.CreateTournament.error.inscriptionAfterStart': 'La fecha límite de inscripción debe ser anterior a la fecha de inicio',
  'project.tournaments.CreateTournament.error.atLeastOneDay': 'Selecciona al menos un día disponible',
  'project.tournaments.CreateTournament.error.endTimeBeforeStart': 'La hora de fin debe ser posterior a la hora de inicio',
  'project.tournaments.CreateTournament.error.durationTooLong': 'La duración máxima es de 120 minutos',
  'project.tournaments.CreateTournament.step1.name': 'Nombre del torneo',
  'project.tournaments.CreateTournament.step1.namePlaceholder': 'Ej. Copa de Primavera',
  'project.tournaments.CreateTournament.step1.privacy': 'Privacidad del torneo',
  'project.tournaments.CreateTournament.step1.privado': 'Privado',
  'project.tournaments.CreateTournament.step1.publico': 'Público',
  'project.tournaments.CreateTournament.step1.privadoHelp': 'Solo equipos con el código pueden inscribirse',
  'project.tournaments.CreateTournament.step1.publicoHelp': 'Cualquier equipo puede inscribirse libremente',
  'project.tournaments.CreateTournament.step1.startDate': 'Fecha de inicio',
  'project.tournaments.CreateTournament.step1.inscriptionDeadline': 'Fecha límite de inscripción',
  'project.tournaments.CreateTournament.step3.winPoints': 'Puntos por victoria',
  'project.tournaments.CreateTournament.step3.drawPoints': 'Puntos por empate',
  'project.tournaments.CreateTournament.step3.lossPoints': 'Puntos por derrota',
  'project.tournaments.CreateTournament.step3.matchFormat': 'Formato de partidos',
  'project.tournaments.CreateTournament.step3.matchFormat.4sets': '4 sets (liga)',
  'project.tournaments.CreateTournament.step3.matchFormat.5sets': '5 sets (playoff)',
  'project.tournaments.CreateTournament.step4.availableDays': 'Días disponibles',
  'project.tournaments.CreateTournament.step4.startTime': 'Hora de inicio',
  'project.tournaments.CreateTournament.step4.endTime': 'Hora de fin',
  'project.tournaments.CreateTournament.step4.matchDuration': 'Duración del partido',
  'project.tournaments.CreateTournament.step4.minutes': 'min',
  'project.tournaments.CreateTournament.step4.excludedDates': 'Fechas excluidas',
  'project.tournaments.CreateTournament.step4.addDate': 'Añadir',
  'project.tournaments.CreateTournament.step4.removeDate': 'Eliminar',
  'project.tournaments.CreateTournament.step4.distribution': 'Estrategia de distribución',
  'project.tournaments.CreateTournament.step4.distribution.matchdays': 'Jornadas',
  'project.tournaments.CreateTournament.step4.distribution.fast': 'Rápido',
  'project.tournaments.CreateTournament.step4.daysBetweenMatchdays': 'Días entre jornadas',
  'project.tournaments.CreateTournament.step4.days': 'días',
  'project.tournaments.CreateTournament.step5.section.basicInfo': 'Información básica',
  'project.tournaments.CreateTournament.step5.section.format': 'Formato',
  'project.tournaments.CreateTournament.step2.type': 'Tipo de torneo',
  'project.tournaments.CreateTournament.step2.type.league': 'Liga única',
  'project.tournaments.CreateTournament.step2.type.groupsPlayoff': 'Grupos + Playoff',
  'project.tournaments.CreateTournament.step2.numGroups': 'Número de grupos',
  'project.tournaments.CreateTournament.step2.teamsPerGroup': 'Equipos por grupo',
  'project.tournaments.CreateTournament.step2.playoffAfterGroups': 'Playoff después de fase de grupos',
  'project.global.buttons.yes': 'Sí',
  'project.global.buttons.no': 'No',
  'project.tournaments.CreateTournament.step2.homeAwayPlayoff': 'Ida y vuelta',
  'project.tournaments.CreateTournament.step5.section.rules': 'Reglas',
  'project.tournaments.CreateTournament.step5.section.calendar': 'Calendario',
  'project.global.fields.nombre': 'Nombre'
};

const inDays = (n) => {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString().split('T')[0];
};

const renderCreate = () => render(
  <IntlProvider locale="es" messages={messages}>
    <MemoryRouter initialEntries={['/home', '/create']} initialIndex={1}>
      <Routes>
        <Route path="/create" element={<CreateTournament />} />
        <Route path="/home" element={<div>HOME_PAGINA</div>} />
        <Route path="/" element={<div>PAGINA_INICIO</div>} />
        <Route path="/tournaments/view/:id" element={<div>TORNEO_VISTO</div>} />
      </Routes>
    </MemoryRouter>
  </IntlProvider>
);

const clickSiguiente = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

const rellenarStep1 = (container, nombre = 'Copa Test', start = inDays(30), deadline = inDays(10)) => {
  fireEvent.change(container.querySelector('#tournamentName'), { target: { value: nombre } });
  fireEvent.change(container.querySelector('#tournamentStartDate'), { target: { value: start } });
  fireEvent.change(container.querySelector('#tournamentInscriptionDeadline'), { target: { value: deadline } });
  clickSiguiente();
};

const irAStep3 = (container) => {
  rellenarStep1(container);
  clickSiguiente();
};

const irAStep4 = (container) => {
  irAStep3(container);
  fireEvent.click(screen.getByRole('button', { name: 'L' }));
  clickSiguiente();
};

describe('CreateTournament', () => {
  beforeEach(() => {
    backend.tournamentService.createTournament.mockReset();
  });

  it('muestra el asistente con la informacion basica en el paso 1', () => {
    const { container } = renderCreate();
    expect(container.querySelector('#tournamentName')).toBeInTheDocument();
    expect(screen.getByText('Nuevo torneo')).toBeInTheDocument();
    expect(screen.getAllByText('Información Básica').length).toBeGreaterThan(0);
  });

  it('no avanza si el paso 1 esta incompleto', () => {
    const { container } = renderCreate();
    clickSiguiente();
    expect(screen.getAllByText('Campo obligatorio').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('#tournamentName')).toBeInTheDocument();
    expect(screen.queryByText('Puntos por victoria')).not.toBeInTheDocument();
  });

  it('muestra error si la fecha de inicio es pasada', () => {
    const { container } = renderCreate();
    rellenarStep1(container, 'Copa Test', inDays(-1), inDays(10));
    expect(screen.getByText('La fecha de inicio no puede ser en el pasado')).toBeInTheDocument();
  });

  it('muestra error si la fecha limite es posterior al inicio', () => {
    const { container } = renderCreate();
    rellenarStep1(container, 'Copa Test', inDays(10), inDays(20));
    expect(screen.getByText('La fecha límite de inscripción debe ser anterior a la fecha de inicio')).toBeInTheDocument();
  });

  it('muestra error si el nombre supera 100 caracteres', () => {
    const { container } = renderCreate();
    rellenarStep1(container, 'a'.repeat(101), inDays(30), inDays(10));
    expect(screen.getByText('El nombre no puede superar los 100 caracteres')).toBeInTheDocument();
  });

  it('avanza al paso de reglas tras completar la informacion basica', () => {
    const { container } = renderCreate();
    rellenarStep1(container);
    expect(screen.getByText('Puntos por victoria')).toBeInTheDocument();
    expect(screen.getAllByText('Reglas').length).toBeGreaterThan(0);
  });

  it('vuelve al paso anterior con el boton atras', () => {
    const { container } = renderCreate();
    rellenarStep1(container);
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(container.querySelector('#tournamentName')).toBeInTheDocument();
  });

  it('navega hacia atras en el primer paso', async () => {
    renderCreate();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(await screen.findByText('HOME_PAGINA')).toBeInTheDocument();
  });

  it('no avanza en el calendario sin seleccionar ningun dia', () => {
    const { container } = renderCreate();
    irAStep3(container);
    clickSiguiente();
    expect(screen.getByText('Selecciona al menos un día disponible')).toBeInTheDocument();
  });

  it('muestra error si la hora de fin no es posterior a la de inicio', () => {
    const { container } = renderCreate();
    irAStep3(container);
    fireEvent.click(screen.getByRole('button', { name: 'L' }));
    fireEvent.change(container.querySelector('#horaInicio'), { target: { value: '18:00' } });
    fireEvent.change(container.querySelector('#horaFin'), { target: { value: '17:00' } });
    clickSiguiente();
    expect(screen.getByText('La hora de fin debe ser posterior a la hora de inicio')).toBeInTheDocument();
  });

  it('limita la duracion del partido a 120 minutos y avanza', () => {
    const { container } = renderCreate();
    irAStep3(container);
    fireEvent.click(screen.getByRole('button', { name: 'L' }));
    const range = container.querySelector('input[type="range"]');
    fireEvent.change(range, { target: { value: '130' } });
    expect(range.value).toBe('120');
    clickSiguiente();
    expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
    expect(screen.getByText(/120/)).toBeInTheDocument();
  });

  it('crea el torneo y navega a su detalle', async () => {
    backend.tournamentService.createTournament.mockResolvedValue({ ok: true, payload: { id: 42 } });
    const { container } = renderCreate();
    irAStep4(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Torneo' }));
    expect(await screen.findByText('TORNEO_VISTO')).toBeInTheDocument();
    expect(backend.tournamentService.createTournament).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Copa Test' }));
  });

  it('navega al inicio si la creacion no devuelve id', async () => {
    backend.tournamentService.createTournament.mockResolvedValue({ ok: true, payload: {} });
    const { container } = renderCreate();
    irAStep4(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Torneo' }));
    expect(await screen.findByText('PAGINA_INICIO')).toBeInTheDocument();
  });

  it('procesa los errores globales del backend y cierra el modal', async () => {
    backend.tournamentService.createTournament.mockResolvedValue({ ok: false, payload: { globalErrors: ['error de prueba'] } });
    const { container } = renderCreate();
    irAStep4(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Torneo' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(backend.tournamentService.createTournament).toHaveBeenCalled();
    expect(screen.queryByText('PAGINA_INICIO')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear torneo' })).toBeInTheDocument();
  });

  it('aplica los errores de campo del backend', async () => {
    backend.tournamentService.createTournament.mockResolvedValue({ ok: false, payload: { fieldErrors: [{ fieldName: 'nombre', message: 'msg' }] } });
    const { container } = renderCreate();
    irAStep4(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Torneo' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(backend.tournamentService.createTournament).toHaveBeenCalled();
  });

  it('muestra error de red si el servicio falla', async () => {
    backend.tournamentService.createTournament.mockRejectedValue(new Error('red'));
    const { container } = renderCreate();
    irAStep4(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Torneo' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('PAGINA_INICIO')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear torneo' })).toBeInTheDocument();
  });
});
