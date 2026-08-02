import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import SignUp from './SignUp';
import * as actions from '../actions';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    userService: {
      signUp: vi.fn(),
      logout: vi.fn()
    }
  }
}));

const messages = {
  'project.global.fields.firstName': 'Nombre',
  'project.global.fields.email': 'Email',
  'project.global.fields.fechaNacimiento': 'Fecha de Nacimiento',
  'project.global.fields.password': 'Contraseña',
  'project.global.buttons.processing': 'Procesando...',
  'project.users.SignUp.fields.confirmPassword': 'Confirmar Contraseña',
  'project.global.validator.required': 'Campo obligatorio',
  'project.global.validator.passwordsDoNotMatch': 'Las contraseñas no coinciden',
  'project.users.SignUp.error.connection': 'Error de conexión con el servidor',
  'project.users.SignUp.error.nombre.required': 'El nombre es obligatorio.',
  'project.users.SignUp.error.nombre.minLength': 'El nombre debe tener al menos 3 caracteres.',
  'project.users.SignUp.error.nombre.maxLength': 'El nombre no puede superar los 15 caracteres.',
  'project.users.SignUp.error.nombre.startsWithNumber': 'El nombre no puede empezar con un número.',
  'project.users.SignUp.error.nombre.onlyNumbers': 'El nombre no puede estar compuesto solo por números.',
  'project.users.SignUp.error.nombre.invalid': 'Formato de nombre inválido.',
  'project.users.SignUp.error.password.required': 'La contraseña es obligatoria.',
  'project.users.SignUp.error.password.minLength': 'Debe tener al menos 8 caracteres.',
  'project.users.SignUp.error.password.uppercase': 'Debe incluir al menos una mayúscula.',
  'project.users.SignUp.error.password.lowercase': 'Debe incluir al menos una minúscula.',
  'project.users.SignUp.error.password.number': 'Debe incluir al menos un número.',
  'project.users.SignUp.error.password.symbol': 'Debe incluir al menos un símbolo (ej. @, $, !, %).',
  'project.users.SignUp.error.password.invalid': 'Formato de contraseña inválido.',
  'project.users.SignUp.error.email.required': 'El correo electrónico es obligatorio.',
  'project.users.SignUp.error.email.invalid': 'Introduce una dirección de correo válida.',
  'project.users.SignUp.error.fechaNacimiento.required': 'La fecha de nacimiento es obligatoria.',
  'project.users.SignUp.error.fechaNacimiento.future': 'La fecha de nacimiento no puede ser futura.',
  'project.users.SignUp.title': 'Crea una cuenta',
  'project.users.SignUp.subtitle': 'Completa el formulario para registrarte en Agón.',
  'project.users.SignUp.hasAccount': '¿Ya tienes una cuenta?',
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
  'project.users.Login.title': 'Identifícate'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderSignUp = () => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={storeMock}>
      <MemoryRouter initialEntries={['/users/signup']}>
        <Routes>
          <Route path="/users/signup" element={<SignUp />} />
          <Route path="/" element={<div>PAGINA_INICIO</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

const rellenarFormularioValido = () => {
  fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'ana' } });
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'ana@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('Fecha de Nacimiento'), { target: { value: '2000-01-01' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Abcdef12@' } });
  fireEvent.change(screen.getByPlaceholderText('Confirmar Contraseña'), { target: { value: 'Abcdef12@' } });
};

describe('SignUp', () => {
  beforeEach(() => {
    storeMock.dispatch.mockClear();
    backend.userService.signUp.mockReset();
    backend.userService.logout.mockClear();
  });

  it('muestra el formulario de registro', () => {
    renderSignUp();
    expect(screen.getByRole('heading', { level: 2, name: 'Crea una cuenta' })).toBeInTheDocument();
  });

  it('registra, despacha signUpCompleted y navega al inicio', async () => {
    backend.userService.signUp.mockResolvedValue({ ok: true, payload: { id: 1, nombre: 'ana' } });
    const { container } = renderSignUp();
    rellenarFormularioValido();
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('PAGINA_INICIO')).toBeInTheDocument();
    expect(backend.userService.signUp).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'ana',
      email: 'ana@test.com',
      fechaNacimiento: '2000-01-01'
    }), expect.any(Function));
    expect(storeMock.dispatch).toHaveBeenCalledWith(actions.signUpCompleted({ id: 1, nombre: 'ana' }));
  });

  it('no registra si las contrasenas no coinciden', () => {
    const { container } = renderSignUp();
    rellenarFormularioValido();
    fireEvent.change(screen.getByPlaceholderText('Confirmar Contraseña'), { target: { value: 'Otra123@' } });
    fireEvent.submit(container.querySelector('form'));
    expect(backend.userService.signUp).not.toHaveBeenCalled();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('muestra el error del backend si el registro falla', async () => {
    backend.userService.signUp.mockResolvedValue({ ok: false, payload: { globalError: 'el email ya existe' } });
    const { container } = renderSignUp();
    rellenarFormularioValido();
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('el email ya existe')).toBeInTheDocument();
  });

  it('muestra error de conexion si el backend lanza', async () => {
    backend.userService.signUp.mockRejectedValue(new Error('boom'));
    const { container } = renderSignUp();
    rellenarFormularioValido();
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Error de conexión con el servidor')).toBeInTheDocument();
  });
});
