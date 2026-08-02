import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Step3Rules from './Step3Rules';

const messages = {
  'project.tournaments.CreateTournament.step3.winPoints': 'Puntos por victoria',
  'project.tournaments.CreateTournament.step3.drawPoints': 'Puntos por empate',
  'project.tournaments.CreateTournament.step3.lossPoints': 'Puntos por derrota',
  'project.tournaments.CreateTournament.step3.matchFormat': 'Formato de partidos',
  'project.tournaments.CreateTournament.step3.matchFormat.4sets': '4 sets (liga)',
  'project.tournaments.CreateTournament.step3.matchFormat.5sets': '5 sets (playoff)',
  'project.global.validator.required': 'Campo obligatorio'
};

const dataBase = { puntosVictoria: 3, puntosEmpate: 1, puntosDerrota: 0, formatoPartidos: '4_SETS' };

const renderStep = (data = {}, onChange = vi.fn(), errors = {}) => render(
  <IntlProvider locale="es" messages={messages}>
    <Step3Rules data={data} onChange={onChange} errors={errors} />
  </IntlProvider>
);

describe('Step3Rules', () => {
  it('muestra los valores por defecto', () => {
    const { container } = renderStep(dataBase);
    expect(container.querySelector('#puntosVictoria').value).toBe('3');
    expect(container.querySelector('#puntosEmpate').value).toBe('1');
    expect(container.querySelector('#puntosDerrota').value).toBe('0');
    expect(container.querySelector('#formato-4sets').checked).toBe(true);
  });

  it('propaga el cambio de puntos', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.change(container.querySelector('#puntosVictoria'), { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ puntosVictoria: 5 }));
    fireEvent.change(container.querySelector('#puntosEmpate'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ puntosEmpate: 2 }));
  });

  it('propaga el cambio de formato de partidos', () => {
    const onChange = vi.fn();
    const { container } = renderStep(dataBase, onChange);
    fireEvent.click(container.querySelector('#formato-5sets'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ formatoPartidos: '5_SETS' }));
  });

  it('muestra errores de validacion', () => {
    renderStep(dataBase, vi.fn(), { puntosVictoria: 'puntos no validos', formatoPartidos: 'formato no valido' });
    expect(screen.getByText('puntos no validos')).toBeInTheDocument();
    expect(screen.getByText('formato no valido')).toBeInTheDocument();
  });
});
