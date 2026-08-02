import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import CreateTeamModal from './CreateTeam';
import * as actions from '../actions';

vi.mock('../actions', () => ({
  createTeam: vi.fn()
}));

const messages = {
  'project.teams.CreateTeam.title': 'Crear un nuevo equipo',
  'project.teams.CreateTeam.subtitle': 'Comienza tu camino competitivo.',
  'project.teams.fields.name': 'Nombre del Equipo',
  'project.teams.fields.description': 'Descripción o Lema',
  'project.teams.buttons.create': 'Crear equipo',
  'project.teams.CreateTeam.saving': 'Guardando...',
  'project.teams.CreateTeam.confirm.title': '¿Confirmar creación de equipo?',
  'project.teams.CreateTeam.confirm.description': 'Estás a punto de fundar tu equipo en Agón.',
  'project.teams.CreateTeam.confirm.button': 'Crear Equipo',
  'project.teams.CreateTeam.success.title': '¡Equipo creado con éxito!',
  'project.teams.CreateTeam.success.description': 'Tu equipo está listo para competir.',
  'project.teams.CreateTeam.success.codeLabel': 'Código de invitación',
  'project.teams.CreateTeam.success.view': 'Ver equipo',
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.common.ConfirmationModal.processing': 'Procesando...',
  'project.global.buttons.cancel': 'Cancelar',
  'project.global.buttons.close': 'Cerrar',
  'project.global.validator.required': 'Este campo es obligatorio.'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderCreateTeam = (onHide = vi.fn(), onCreated = vi.fn()) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={storeMock}>
      <MemoryRouter initialEntries={['/teams/view/7']}>
        <Routes>
          <Route path="/teams/view/:id" element={
            <CreateTeamModal show onHide={onHide} onCreated={onCreated} />
          } />
        </Routes>
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

// El contenido del Modal se renderiza en un portal (document.body),
// por lo que se consulta con document en lugar de container.
const rellenarFormulario = (nombre = 'Los Reyes', descripcion = 'Lema de prueba') => {
  fireEvent.change(document.querySelector('#teamName'), { target: { value: nombre } });
  fireEvent.change(document.querySelector('#teamDescription'), { target: { value: descripcion } });
};

describe('CreateTeamModal', () => {
  beforeEach(() => {
    actions.createTeam.mockReset();
  });

  it('muestra el formulario de creacion', () => {
    renderCreateTeam();
    expect(screen.getByText('Crear un nuevo equipo')).toBeInTheDocument();
    expect(document.querySelector('#teamName')).toBeInTheDocument();
    expect(document.querySelector('#teamDescription')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear equipo' })).toBeInTheDocument();
    expect(screen.getByText('Nombre del Equipo')).toBeInTheDocument();
  });

  it('no abre el modal de confirmacion si faltan campos', () => {
    renderCreateTeam();
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    expect(screen.queryByText('¿Confirmar creación de equipo?')).not.toBeInTheDocument();
    expect(screen.getAllByText('Este campo es obligatorio.').length).toBe(2);
  });

  it('abre el modal de confirmacion con datos validos', () => {
    renderCreateTeam();
    rellenarFormulario();
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    expect(screen.getByText('¿Confirmar creación de equipo?')).toBeInTheDocument();
  });

  it('muestra la pantalla de exito al confirmar y llama a onCreated', () => {
    actions.createTeam.mockImplementation((nombre, descripcion, onSuccess) => {
      onSuccess({ id: 7, codigoEquipo: 'ABC12345' });
    });
    const onCreated = vi.fn();
    renderCreateTeam(vi.fn(), onCreated);
    rellenarFormulario('  Mi Equipo  ', '  Lema  ');
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Equipo' }));
    expect(screen.getByText('¡Equipo creado con éxito!')).toBeInTheDocument();
    expect(screen.getByText('ABC12345')).toBeInTheDocument();
    expect(actions.createTeam).toHaveBeenCalledWith('Mi Equipo', 'Lema', expect.any(Function), expect.any(Function));
    expect(onCreated).toHaveBeenCalledWith({ id: 7, codigoEquipo: 'ABC12345' });
  });

  it('muestra los errores del backend y cierra la confirmacion', async () => {
    actions.createTeam.mockImplementation((nombre, descripcion, onSuccess, onError) => {
      onError({ globalError: 'Error del servidor' });
    });
    renderCreateTeam();
    rellenarFormulario();
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Equipo' }));
    expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('¿Confirmar creación de equipo?')).not.toBeInTheDocument());
  });

  it('cierra el modal al pulsar Cancelar y llama a onHide', () => {
    const onHide = vi.fn();
    renderCreateTeam(onHide);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onHide).toHaveBeenCalled();
  });
});
