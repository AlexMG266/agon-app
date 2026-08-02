import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Step4Calendar from './Step4Calendar';

const messages = {
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
  'project.global.validator.required': 'Campo obligatorio'
};

const dataBase = {
  diasDisponibles: [],
  horaInicio: '16:00',
  horaFin: '22:00',
  duracionPartido: 45,
  estrategiaDistribucion: 'JORNADAS',
  diasEntreJornadas: 7
};

const renderStep = (data = {}, onChange = vi.fn(), errors = {}) => render(
  <IntlProvider locale="es" messages={messages}>
    <Step4Calendar data={data} onChange={onChange} errors={errors} />
  </IntlProvider>
);

describe('Step4Calendar', () => {
  it('muestra los valores por defecto y la configuracion de jornadas', () => {
    const { container } = renderStep(dataBase);
    expect(container.querySelector('#horaInicio').value).toBe('16:00');
    expect(container.querySelector('#horaFin').value).toBe('22:00');
    expect(screen.getByText('Jornadas')).toBeInTheDocument();
    expect(screen.getByText('Rápido')).toBeInTheDocument();
    expect(screen.getByText('Días entre jornadas')).toBeInTheDocument();
  });

  it('alterna la seleccion de un dia disponible', () => {
    const onChange = vi.fn();
    renderStep(dataBase, onChange);
    fireEvent.click(screen.getByRole('button', { name: 'L' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ diasDisponibles: ['L'] }));
  });

  it('elimina un dia ya seleccionado', () => {
    const onChange = vi.fn();
    renderStep({ ...dataBase, diasDisponibles: ['L', 'X'] }, onChange);
    fireEvent.click(screen.getByRole('button', { name: 'L' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ diasDisponibles: ['X'] }));
  });

  it('anade una fecha excluida', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2026-09-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fechasExcluidas: ['2026-09-05'] }));
    expect(container.querySelector('input[type="date"]').value).toBe('');
  });

  it('no anade una fecha excluida duplicada', () => {
    const onChange = vi.fn();
    const { container } = renderStep({ ...dataBase, fechasExcluidas: ['2026-09-05'] }, onChange);
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2026-09-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('input[type="date"]').value).toBe('2026-09-05');
  });

  it('elimina una fecha excluida', () => {
    const onChange = vi.fn();
    renderStep({ ...dataBase, fechasExcluidas: ['2026-09-05', '2026-09-12'] }, onChange);
    fireEvent.click(screen.getAllByLabelText('Eliminar')[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fechasExcluidas: ['2026-09-12'] }));
  });

  it('cambia la estrategia de distribucion a rapido', () => {
    const onChange = vi.fn();
    renderStep(dataBase, onChange);
    fireEvent.click(screen.getByRole('radio', { name: 'Rápido' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ estrategiaDistribucion: 'RAPIDO' }));
  });

  it('oculta los dias entre jornadas con estrategia rapido', () => {
    const { container } = renderStep({ ...dataBase, estrategiaDistribucion: 'RAPIDO' });
    expect(container.querySelector('#diasEntreJornadas')).not.toBeInTheDocument();
    expect(screen.queryByText('Días entre jornadas')).not.toBeInTheDocument();
  });

  it('muestra errores de validacion', () => {
    renderStep(dataBase, vi.fn(), {
      diasDisponibles: 'Selecciona al menos un día disponible',
      horaInicio: 'hora no valida'
    });
    expect(screen.getByText('Selecciona al menos un día disponible')).toBeInTheDocument();
    expect(screen.getByText('hora no valida')).toBeInTheDocument();
  });
});
