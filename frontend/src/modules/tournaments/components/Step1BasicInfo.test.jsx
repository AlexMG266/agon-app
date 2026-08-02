import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Step1BasicInfo from './Step1BasicInfo';

const messages = {
  'project.tournaments.CreateTournament.step1.name': 'Nombre del torneo',
  'project.tournaments.CreateTournament.step1.namePlaceholder': 'Ej. Copa de Primavera',
  'project.tournaments.CreateTournament.step1.privacy': 'Privacidad del torneo',
  'project.tournaments.CreateTournament.step1.privado': 'Privado',
  'project.tournaments.CreateTournament.step1.publico': 'Público',
  'project.tournaments.CreateTournament.step1.privadoHelp': 'Solo equipos con el código pueden inscribirse',
  'project.tournaments.CreateTournament.step1.publicoHelp': 'Cualquier equipo puede inscribirse libremente',
  'project.tournaments.CreateTournament.step1.startDate': 'Fecha de inicio',
  'project.tournaments.CreateTournament.step1.inscriptionDeadline': 'Fecha límite de inscripción',
  'project.global.validator.required': 'Campo obligatorio'
};

const dataBase = { nombre: 'copa test', fechaInicio: '2026-09-01', fechaLimiteInscripcion: '2026-08-20' };

const renderStep = (data = {}, onChange = vi.fn(), errors = {}) => render(
  <IntlProvider locale="es" messages={messages}>
    <Step1BasicInfo data={data} onChange={onChange} errors={errors} />
  </IntlProvider>
);

describe('Step1BasicInfo', () => {
  it('muestra los campos con los valores del formulario', () => {
    const { container } = renderStep(dataBase);
    expect(container.querySelector('#tournamentName').value).toBe('copa test');
    expect(container.querySelector('#tournamentStartDate').value).toBe('2026-09-01');
    expect(container.querySelector('#tournamentInscriptionDeadline').value).toBe('2026-08-20');
    expect(screen.getByText('Público')).toBeInTheDocument();
  });

  it('propaga el cambio del nombre', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.change(container.querySelector('#tournamentName'), { target: { value: 'nuevo nombre' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'nuevo nombre' }));
  });

  it('propaga el cambio de las fechas', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.change(container.querySelector('#tournamentStartDate'), { target: { value: '2026-10-01' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fechaInicio: '2026-10-01' }));
    fireEvent.change(container.querySelector('#tournamentInscriptionDeadline'), { target: { value: '2026-09-15' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fechaLimiteInscripcion: '2026-09-15' }));
  });

  it('alterna la privacidad del torneo', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.click(container.querySelector('#privado-switch'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ privado: true }));
  });

  it('muestra el estado privado y su ayuda', () => {
    const { container } = renderStep({ ...dataBase, privado: true });
    expect(screen.getByText('Privado')).toBeInTheDocument();
    expect(screen.getByText('Solo equipos con el código pueden inscribirse')).toBeInTheDocument();
    expect(container.querySelector('#privado-switch').checked).toBe(true);
  });

  it('muestra los errores de validacion de los campos', () => {
    renderStep(dataBase, vi.fn(), { nombre: 'nombre no valido', fechaInicio: 'fecha no valida' });
    expect(screen.getByText('nombre no valido')).toBeInTheDocument();
    expect(screen.getByText('fecha no valida')).toBeInTheDocument();
  });
});
