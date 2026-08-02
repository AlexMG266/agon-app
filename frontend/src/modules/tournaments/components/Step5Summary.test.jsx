import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Step5Summary from './Step5Summary';

const messages = {
  'project.tournaments.CreateTournament.step5.section.basicInfo': 'Información básica',
  'project.tournaments.CreateTournament.step1.name': 'Nombre del torneo',
  'project.tournaments.CreateTournament.step1.startDate': 'Fecha de inicio',
  'project.tournaments.CreateTournament.step1.inscriptionDeadline': 'Fecha límite de inscripción',
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
  'project.tournaments.CreateTournament.step3.winPoints': 'Puntos por victoria',
  'project.tournaments.CreateTournament.step3.drawPoints': 'Puntos por empate',
  'project.tournaments.CreateTournament.step3.lossPoints': 'Puntos por derrota',
  'project.tournaments.CreateTournament.step3.matchFormat': 'Formato de partidos',
  'project.tournaments.CreateTournament.step3.matchFormat.4sets': '4 sets (liga)',
  'project.tournaments.CreateTournament.step3.matchFormat.5sets': '5 sets (playoff)',
  'project.tournaments.CreateTournament.step5.section.calendar': 'Calendario',
  'project.tournaments.CreateTournament.step4.availableDays': 'Días disponibles',
  'project.tournaments.CreateTournament.step4.startTime': 'Hora de inicio',
  'project.tournaments.CreateTournament.step4.endTime': 'Hora de fin',
  'project.tournaments.CreateTournament.step4.matchDuration': 'Duración del partido',
  'project.tournaments.CreateTournament.step4.distribution': 'Estrategia de distribución',
  'project.tournaments.CreateTournament.step4.distribution.matchdays': 'Jornadas',
  'project.tournaments.CreateTournament.step4.distribution.fast': 'Rápido'
};

const renderSummary = (data) => render(
  <IntlProvider locale="es" messages={messages}>
    <Step5Summary data={data} />
  </IntlProvider>
);

describe('Step5Summary', () => {
  it('muestra los valores basicos y defaults cuando faltan', () => {
    renderSummary({
      nombre: 'torneo test',
      fechaInicio: '2026-09-01',
      fechaLimiteInscripcion: '2026-08-25'
    });
    expect(screen.getByText('torneo test')).toBeInTheDocument();
    expect(screen.getByText('2026-09-01')).toBeInTheDocument();
    expect(screen.getByText('2026-08-25')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('muestra guiones cuando no hay datos basicos', () => {
    renderSummary({});
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('muestra liga unica y no muestra filas de grupos', () => {
    renderSummary({
      tipoTorneo: 'LIGA_UNICA',
      numGrupos: 0,
      equiposPorGrupo: 0
    });
    expect(screen.getByText('Liga única')).toBeInTheDocument();
    expect(screen.queryByText('Número de grupos')).not.toBeInTheDocument();
    expect(screen.queryByText('Equipos por grupo')).not.toBeInTheDocument();
    expect(screen.queryByText('Playoff después de fase de grupos')).not.toBeInTheDocument();
  });

  it('muestra grupos + playoff con numGrupos y equiposPorGrupo', () => {
    renderSummary({
      tipoTorneo: 'GRUPOS_PLAYOFF',
      numGrupos: 4,
      equiposPorGrupo: 3,
      tienePlayoff: true,
      idaVueltaPlayoff: true
    });
    expect(screen.getByText('Grupos + Playoff')).toBeInTheDocument();
    expect(screen.getByText('Número de grupos')).toBeInTheDocument();
    expect(screen.getByText('Equipos por grupo')).toBeInTheDocument();
    expect(screen.getByText('Playoff después de fase de grupos')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();
    expect(screen.getByText(/Ida y vuelta/)).toBeInTheDocument();
  });

  it('muestra playoff sin ida y vuelta', () => {
    renderSummary({
      tipoTorneo: 'GRUPOS_PLAYOFF',
      numGrupos: 2,
      equiposPorGrupo: 2,
      tienePlayoff: false,
      idaVueltaPlayoff: false
    });
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.queryByText('Ida y vuelta')).not.toBeInTheDocument();
  });

  it('muestra formatos 4 sets y 5 sets', () => {
    const { rerender } = renderSummary({ formatoPartidos: '4_SETS' });
    expect(screen.getByText('4 sets (liga)')).toBeInTheDocument();
    rerender(
      <IntlProvider locale="es" messages={messages}>
        <Step5Summary data={{ formatoPartidos: '5_SETS' }} />
      </IntlProvider>
    );
    expect(screen.getByText('5 sets (playoff)')).toBeInTheDocument();
  });

  it('muestra dias disponibles unidos por coma', () => {
    renderSummary({ diasDisponibles: ['LUNES', 'MIERCOLES'] });
    expect(screen.getByText('LUNES, MIERCOLES')).toBeInTheDocument();
  });

  it('muestra hora, duracion y estrategia de distribucion', () => {
    renderSummary({
      horaInicio: '18:00',
      horaFin: '22:00',
      duracionPartido: 60,
      estrategiaDistribucion: 'RAPIDO'
    });
    expect(screen.getByText('18:00')).toBeInTheDocument();
    expect(screen.getByText('22:00')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('Rápido')).toBeInTheDocument();
  });

  it('muestra jornadas y defaults de calendario', () => {
    renderSummary({ estrategiaDistribucion: 'JORNADAS' });
    expect(screen.getByText('Jornadas')).toBeInTheDocument();
    expect(screen.getByText('— min')).toBeInTheDocument();
  });
});
