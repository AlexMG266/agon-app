import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import CreateTeam from './CreateTeam';
import * as actions from '../actions';

vi.mock('../actions', () => ({
  createTeam: vi.fn()
}));

const messages = {
  'project.teams.CreateTeam.title': 'Crear un nuevo equipo',
  'project.teams.CreateTeam.subtitle': 'Comienza tu camino competitivo.',
  'project.teams.CreateTeam.badge': 'Creación de equipo',
  'project.teams.CreateTeam.sideTitle': 'Tu equipo en Agón',
  'project.teams.CreateTeam.sideDescription': 'Para empezar a competir necesitas consolidar tu pareja de juego.',
  'project.teams.CreateTeam.step1.title': 'Elige la identidad',
  'project.teams.CreateTeam.step1.desc': 'Define el nombre y el lema.',
  'project.teams.CreateTeam.step2.title': 'Obtén tu código',
  'project.teams.CreateTeam.step2.desc': 'El sistema generará un código único de invitación.',
  'project.teams.CreateTeam.step3.title': 'Suma a tu compañero',
  'project.teams.CreateTeam.step3.desc': 'Comparte el código con tu pareja.',
  'project.teams.fields.name': 'Nombre del Equipo',
  'project.teams.fields.description': 'Descripción o Lema',
  'project.teams.buttons.create': 'Crear equipo',
  'project.teams.CreateTeam.saving': 'Guardando...',
  'project.teams.CreateTeam.confirm.title': '¿Confirmar creación de equipo?',
  'project.teams.CreateTeam.confirm.description': 'Estás a punto de fundar tu equipo en Agón.',
  'project.teams.CreateTeam.confirm.button': 'Crear Equipo',
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.common.ConfirmationModal.processing': 'Procesando...',
  'project.global.buttons.cancel': 'Cancelar',
  'project.global.validator.required': 'Este campo es obligatorio.',
  'project.global.fields.nombre': 'Nombre'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderCreateTeam = () => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={storeMock}>
      <MemoryRouter initialEntries={['/home', '/create-team']} initialIndex={1}>
        <Routes>
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/home" element={<div>HOME_PAGINA</div>} />
          <Route path="/teams/view/:id" element={<div>EQUIPO_CREADO</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

const rellenarFormulario = (container, nombre = 'Los Reyes', descripcion = 'Lema de prueba') => {
  fireEvent.change(container.querySelector('#teamName'), { target: { value: nombre } });
  fireEvent.change(container.querySelector('#teamDescription'), { target: { value: descripcion } });
};

describe('CreateTeam', () => {
  beforeEach(() => {
    actions.createTeam.mockReset();
  });

  it('muestra el formulario de creacion', () => {
    const { container } = renderCreateTeam();
    expect(screen.getByText('Crear un nuevo equipo')).toBeInTheDocument();
    expect(container.querySelector('#teamName')).toBeInTheDocument();
    expect(container.querySelector('#teamDescription')).toBeInTheDocument();
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
    const { container } = renderCreateTeam();
    rellenarFormulario(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    expect(screen.getByText('¿Confirmar creación de equipo?')).toBeInTheDocument();
  });

  it('confirma la creacion y navega al detalle del equipo', () => {
    actions.createTeam.mockImplementation((nombre, descripcion, onSuccess) => {
      onSuccess({ id: 7 });
    });
    const { container } = renderCreateTeam();
    rellenarFormulario(container, '  Mi Equipo  ', '  Lema  ');
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Equipo' }));
    expect(screen.getByText('EQUIPO_CREADO')).toBeInTheDocument();
    expect(actions.createTeam).toHaveBeenCalledWith('Mi Equipo', 'Lema', expect.any(Function), expect.any(Function));
  });

  it('muestra los errores del backend y cierra el modal', async () => {
    actions.createTeam.mockImplementation((nombre, descripcion, onSuccess, onError) => {
      onError({ globalError: 'Error del servidor' });
    });
    const { container } = renderCreateTeam();
    rellenarFormulario(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear Equipo' }));
    expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('¿Confirmar creación de equipo?')).not.toBeInTheDocument());
  });

  it('cancela y navega hacia atras', () => {
    renderCreateTeam();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('HOME_PAGINA')).toBeInTheDocument();
  });
});
