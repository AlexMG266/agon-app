import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import Login from './Login';
import * as actions from '../actions';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    userService: {
      login: vi.fn(),
      logout: vi.fn()
    }
  }
}));

const messages = {
  'project.global.fields.userName': 'Usuario',
  'project.global.fields.password': 'Contraseña',
  'project.global.validator.required': 'Campo obligatorio',
  'project.global.buttons.processing': 'Procesando...',
  'project.users.Login.error.connection': 'Error de conexión con el servidor',
  'project.users.Login.hero.title': 'Organiza, inscríbete y domina la mesa.',
  'project.users.Login.hero.description': 'La plataforma definitiva para la gestión de tus partidas.',
  'project.users.Login.hero.feature1.title': 'Gestión de Torneos',
  'project.users.Login.hero.feature1.desc': 'Crea formatos competitivos.',
  'project.users.Login.hero.feature2.title': 'Inscripción Inmediata',
  'project.users.Login.hero.feature2.desc': 'Explora las mesas activas.',
  'project.users.Login.hero.feature3.title': 'Sistema ELO Nativo',
  'project.users.Login.hero.feature3.desc': 'Cálculo preciso de tu nivel.',
  'project.users.Login.hero.feature4.title': 'Perfil de Jugador',
  'project.users.Login.hero.feature4.desc': 'Historial centralizado.',
  'project.users.Login.footer': '© {year} Agón Arena.',
  'project.users.Login.title': 'Autenticarse',
  'project.users.Login.subtitle': 'Introduce tus datos de acceso para continuar.',
  'project.users.Login.newUser': '¿Eres nuevo en la plataforma?',
  'project.users.SignUp.title': 'Registrarse'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderLogin = () => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={storeMock}>
      <MemoryRouter initialEntries={['/users/login']}>
        <Routes>
          <Route path="/users/login" element={<Login />} />
          <Route path="/" element={<div>PAGINA_INICIO</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

const rellenarCredenciales = (usuario, contrasena) => {
  fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: usuario } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: contrasena } });
};

describe('Login', () => {
  beforeEach(() => {
    storeMock.dispatch.mockClear();
    backend.userService.login.mockReset();
    backend.userService.logout.mockClear();
  });

  it('muestra el formulario de acceso', () => {
    renderLogin();
    expect(screen.getByRole('heading', { level: 2, name: 'Autenticarse' })).toBeInTheDocument();
  });

  it('inicia sesion, despacha loginCompleted y navega al inicio', async () => {
    backend.userService.login.mockResolvedValue({ ok: true, payload: { id: 1, nombre: 'ana' } });
    const { container } = renderLogin();
    rellenarCredenciales('ana', 'secreta1');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('PAGINA_INICIO')).toBeInTheDocument();
    expect(backend.userService.login).toHaveBeenCalledWith('ana', 'secreta1', expect.any(Function));
    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.loginCompleted({ id: 1, nombre: 'ana' }));
  });

  it('muestra el error del backend si el login falla', async () => {
    backend.userService.login.mockResolvedValue({ ok: false, payload: { globalError: 'credenciales incorrectas' } });
    const { container } = renderLogin();
    rellenarCredenciales('ana', 'mala');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('credenciales incorrectas')).toBeInTheDocument();
  });

  it('no llama al backend si faltan campos', () => {
    const { container } = renderLogin();
    fireEvent.submit(container.querySelector('form'));
    expect(backend.userService.login).not.toHaveBeenCalled();
    expect(screen.getAllByText('Campo obligatorio').length).toBeGreaterThan(0);
  });

  it('muestra error de conexion si el backend lanza', async () => {
    backend.userService.login.mockRejectedValue(new Error('boom'));
    const { container } = renderLogin();
    rellenarCredenciales('ana', 'secreta1');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Error de conexión con el servidor')).toBeInTheDocument();
  });

  it('desconecta al usuario cuando el token caduca', async () => {
    backend.userService.login.mockImplementation((usuario, contrasena, reautenticar) => {
      reautenticar();
      return Promise.resolve({ ok: false, payload: { globalError: 'sesion caducada' } });
    });
    const { container } = renderLogin();
    rellenarCredenciales('ana', 'secreta1');
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => {
      expect(storeMock.dispatch).toHaveBeenCalledWith(actions.logout());
    });
  });
});
