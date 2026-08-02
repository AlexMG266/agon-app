import { render, screen, fireEvent, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import EncuentroModal from './EncuentroModal';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    tournamentService: { registerResult: vi.fn() }
  }
}));

const messages = {
  'project.matches.estado.pendiente': 'Pendiente',
  'project.matches.estado.jugado': 'Jugado',
  'project.matches.estado.aplazado': 'Aplazado',
  'project.matches.estado.solicitadoAplazamiento': 'Aplazamiento solicitado',
  'project.encuentro.title': 'Detalle del encuentro',
  'project.encuentro.set': 'Set',
  'project.encuentro.setsDetail': 'Sets',
  'project.encuentro.registerTitle': 'Registrar resultado',
  'project.encuentro.register': 'Registrar resultado',
  'project.encuentro.cancel': 'Cancelar',
  'project.encuentro.close': 'Cerrar',
  'project.encuentro.success': 'Resultado registrado',
  'project.encuentro.successDetail': 'El resultado del encuentro se ha guardado correctamente.',
  'project.encuentro.played': 'Este encuentro ya se ha disputado.',
  'project.encuentro.noCaptain': 'Solo los capitanes de los equipos pueden registrar el resultado.',
  'project.encuentro.error.registro': 'No se pudo registrar el resultado.',
  'project.encuentro.error.noSets': 'Debes indicar al menos un set.',
  'project.encuentro.error.draw': 'Un set no puede terminar en empate.',
  'project.encuentro.error.negative': 'Los puntos no pueden ser negativos.',
  'project.encuentro.addSet': 'Añadir set',
  'project.encuentro.removeSet': 'Quitar set'
};

const encuentroBase = (overrides = {}) => ({
  id: 7,
  equipoLocalId: 1,
  equipoVisitanteId: 2,
  equipoLocalNombre: 'Alpha',
  equipoVisitanteNombre: 'Beta',
  estado: 'PENDIENTE',
  fechaRealizacion: '2026-09-01T18:00:00',
  resultado: null,
  sets: [],
  ...overrides
});

const renderEncuentro = (props = {}) => {
  const onHide = props.onHide === undefined ? vi.fn() : props.onHide;
  const onRegistered = props.onRegistered === undefined ? vi.fn() : props.onRegistered;
  const rest = { ...props };
  delete rest.onHide;
  delete rest.onRegistered;
  const utils = render(
    <IntlProvider locale="es" messages={messages}>
      <EncuentroModal
        show
        encuentro={encuentroBase()}
        capitanTeamIds={[]}
        onHide={onHide}
        onRegistered={onRegistered}
        {...rest}
      />
    </IntlProvider>
  );
  return { ...utils, onHide, onRegistered };
};

const rellenarSetsValidos = () => {
  const inputs = screen.getAllByRole('spinbutton');
  const valores = [[25, 20], [20, 25], [25, 18], [18, 25]];
  valores.forEach(([local, visitante], i) => {
    fireEvent.change(inputs[i * 2], { target: { value: String(local) } });
    fireEvent.change(inputs[i * 2 + 1], { target: { value: String(visitante) } });
  });
};

beforeEach(() => {
  backend.tournamentService.registerResult.mockReset();
});

describe('EncuentroModal', () => {
  it('devuelve null si no hay encuentro', () => {
    renderEncuentro({ encuentro: null });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza los datos del encuentro pendiente', () => {
    renderEncuentro();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Detalle del encuentro')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText(/1 de septiembre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
  });

  it('muestra el estado aplazado y los nombres por defecto sin fecha', () => {
    renderEncuentro({
      encuentro: encuentroBase({
        estado: 'APLAZADO',
        fechaRealizacion: null,
        equipoLocalNombre: null,
        equipoVisitanteNombre: null
      })
    });
    expect(screen.getByText('Aplazado')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByText(/18:00/)).not.toBeInTheDocument();
  });

  it('muestra el detalle de sets y el aviso cuando el encuentro esta jugado', () => {
    renderEncuentro({
      capitanTeamIds: [1],
      encuentro: encuentroBase({
        estado: 'JUGADO',
        resultado: '2-1',
        sets: [
          { numeroSet: 1, golesLocal: 2, golesVisitante: 1 },
          { numeroSet: 2, golesLocal: 1, golesVisitante: 2 }
        ]
      })
    });
    expect(screen.getByText('Jugado')).toBeInTheDocument();
    expect(screen.getByText('2-1')).toBeInTheDocument();
    expect(screen.getByText('Sets')).toBeInTheDocument();
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Set 2')).toBeInTheDocument();
    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    expect(screen.getByText('1 - 2')).toBeInTheDocument();
    expect(screen.getByText('Este encuentro ya se ha disputado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar resultado' })).not.toBeInTheDocument();
  });

  it('muestra el aviso de no capitan y no muestra el formulario', () => {
    renderEncuentro();
    expect(screen.getByText('Solo los capitanes de los equipos pueden registrar el resultado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar resultado' })).not.toBeInTheDocument();
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });

  it('muestra el formulario con 4 sets por defecto al capitan', () => {
    renderEncuentro({ capitanTeamIds: [1] });
    expect(screen.getAllByText('Registrar resultado')).toHaveLength(2);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8);
    expect(screen.getAllByText('Local')).toHaveLength(4);
    expect(screen.getAllByText('Visitante')).toHaveLength(4);
    expect(screen.getByText('Set 4')).toBeInTheDocument();
    expect(screen.getByTitle('Añadir set')).not.toBeDisabled();
    expect(screen.getByTitle('Quitar set')).not.toBeDisabled();
  });

  it('precarga los sets existentes', () => {
    renderEncuentro({
      capitanTeamIds: [2],
      encuentro: encuentroBase({ sets: [{ numeroSet: 1, golesLocal: 25, golesVisitante: 20 }] })
    });
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(8);
    expect(inputs[0]).toHaveValue(25);
    expect(inputs[1]).toHaveValue(20);
    expect(inputs[2]).toHaveValue(0);
  });

  it('anade y quita sets (maximo 5)', () => {
    renderEncuentro({ capitanTeamIds: [1] });
    fireEvent.click(screen.getByTitle('Añadir set'));
    expect(screen.getAllByRole('spinbutton')).toHaveLength(10);
    expect(screen.getByText('Set 5')).toBeInTheDocument();
    expect(screen.getByTitle('Añadir set')).toBeDisabled();
    fireEvent.click(screen.getByTitle('Quitar set'));
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8);
    expect(screen.queryByText('Set 5')).not.toBeInTheDocument();
    expect(screen.getByTitle('Añadir set')).not.toBeDisabled();
  });

  it('no permite quitar el ultimo set', () => {
    renderEncuentro({ capitanTeamIds: [1] });
    const remove = screen.getByTitle('Quitar set');
    for (let i = 0; i < 3; i++) fireEvent.click(remove);
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  it('muestra error de empate y no registra', () => {
    const { onRegistered } = renderEncuentro({ capitanTeamIds: [1] });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(screen.getByText('Un set no puede terminar en empate.')).toBeInTheDocument();
    expect(backend.tournamentService.registerResult).not.toHaveBeenCalled();
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('muestra error de puntos negativos y no registra', () => {
    renderEncuentro({ capitanTeamIds: [1] });
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '-1' } });
    // el navegador bloquearia el submit por min=0; se envia el formulario
    // directamente para probar la validacion propia del componente.
    fireEvent.submit(document.querySelector('form'));
    expect(screen.getByText('Los puntos no pueden ser negativos.')).toBeInTheDocument();
    expect(backend.tournamentService.registerResult).not.toHaveBeenCalled();
  });

  it('registra el resultado, muestra la confirmacion y cierra', async () => {
    backend.tournamentService.registerResult.mockResolvedValue({ ok: true, payload: { id: 7 } });
    const { onHide, onRegistered } = renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(backend.tournamentService.registerResult).toHaveBeenCalledWith(7, [
      { numeroSet: 1, golesLocal: 25, golesVisitante: 20 },
      { numeroSet: 2, golesLocal: 20, golesVisitante: 25 },
      { numeroSet: 3, golesLocal: 25, golesVisitante: 18 },
      { numeroSet: 4, golesLocal: 18, golesVisitante: 25 }
    ]);
    expect(await screen.findByText('Resultado registrado')).toBeInTheDocument();
    expect(screen.getByText('El resultado del encuentro se ha guardado correctamente.')).toBeInTheDocument();
    expect(onRegistered).toHaveBeenCalledWith(7);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onHide).toHaveBeenCalled();
  });

  it('muestra el mensaje del backend si falla el registro', async () => {
    backend.tournamentService.registerResult.mockResolvedValue({
      ok: false,
      payload: { message: 'El torneo no está en fase de grupos.' }
    });
    renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(await screen.findByText('El torneo no está en fase de grupos.')).toBeInTheDocument();
  });

  it('muestra el error de la respuesta si no hay payload', async () => {
    backend.tournamentService.registerResult.mockResolvedValue({ ok: false, error: 'No tienes permisos.' });
    renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(await screen.findByText('No tienes permisos.')).toBeInTheDocument();
  });

  it('muestra el error por defecto si la respuesta no trae mensaje', async () => {
    backend.tournamentService.registerResult.mockResolvedValue({ ok: false });
    renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(await screen.findByText('No se pudo registrar el resultado.')).toBeInTheDocument();
  });

  it('muestra el mensaje de la excepcion si el servicio lanza un error', async () => {
    backend.tournamentService.registerResult.mockRejectedValue(new Error('Network Error'));
    renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(await screen.findByText('Network Error')).toBeInTheDocument();
  });

  it('deshabilita los botones y muestra un spinner mientras guarda', async () => {
    let resolveRegister;
    backend.tournamentService.registerResult.mockReturnValue(new Promise((resolve) => { resolveRegister = resolve; }));
    renderEncuentro({ capitanTeamIds: [1] });
    rellenarSetsValidos();
    const submitBtn = screen.getByRole('button', { name: 'Registrar resultado' });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
    await act(async () => { resolveRegister({ ok: true }); });
    expect(await screen.findByText('Resultado registrado')).toBeInTheDocument();
  });

  it('cierra el modal al pulsar cancelar', () => {
    const { onHide } = renderEncuentro({ capitanTeamIds: [1] });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onHide).toHaveBeenCalled();
  });

  it('no falla si onRegistered no esta definido', async () => {
    backend.tournamentService.registerResult.mockResolvedValue({ ok: true });
    renderEncuentro({ capitanTeamIds: [1], onRegistered: undefined });
    rellenarSetsValidos();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado' }));
    expect(await screen.findByText('Resultado registrado')).toBeInTheDocument();
  });
});
