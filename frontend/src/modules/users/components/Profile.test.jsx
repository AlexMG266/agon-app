import { render, screen, fireEvent, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Profile from './Profile';
import * as actions from '../actions';
import backend from '../../../backend';

vi.mock('../../../backend', () => ({
  default: {
    userService: {
      updateProfile: vi.fn(),
      changePassword: vi.fn()
    }
  }
}));

const messages = {
  'project.users.Profile.elo': 'ELO Actual',
  'project.users.Profile.provisional': 'Provisional',
  'project.users.Profile.teams': 'Equipos',
  'project.users.Profile.active': 'Activos',
  'project.users.Profile.wins': 'Victorias',
  'project.users.Profile.season': 'Esta temporada',
  'project.users.Profile.tabs.profileInfo': 'Información del Perfil',
  'project.users.Profile.tabs.changePassword': 'Cambiar Contraseña',
  'project.users.UpdateProfile.title': 'Actualizar perfil',
  'project.users.Profile.success.profileUpdated': 'Perfil actualizado correctamente',
  'project.users.Profile.success.passwordChanged': 'Contraseña cambiada correctamente',
  'project.users.Profile.fields.profileImage': 'Imagen de Perfil',
  'project.users.Profile.uploadPhoto': 'Subir foto',
  'project.users.Profile.buttons.removeImage': 'Eliminar Imagen',
  'project.global.fields.email': 'Correo electrónico',
  'project.global.validator.email': 'Introduzca una dirección de correo electrónico correcta',
  'project.global.fields.fechaNacimiento': 'Fecha de Nacimiento',
  'project.global.validator.required': 'Campo obligatorio',
  'project.users.Profile.fields.notifications': 'Avisos de partidos',
  'project.users.Profile.fields.notificationsHint': 'Recibirás un aviso cuando se acerque un partido',
  'project.users.Profile.fields.notificationsDays': 'Avisar antes',
  'project.users.Profile.fields.notificationsSameDay': 'El mismo día',
  'project.users.Profile.fields.notificationsDaysValue': '{days} días antes',
  'project.users.Profile.fields.notificationsDaysHint': 'Días de antelación del aviso',
  'project.global.fields.userName': 'Usuario',
  'project.users.Profile.fields.userNameDisabled': 'El nombre de usuario no puede ser modificado',
  'project.global.buttons.save': 'Guardar',
  'project.users.ChangePassword.title': 'Cambiar contraseña',
  'project.users.ChangePassword.fields.oldPassword': 'Contraseña antigua',
  'project.users.ChangePassword.fields.newPassword': 'Contraseña nueva',
  'project.users.SignUp.fields.confirmPassword': 'Confirmar contraseña',
  'project.global.validator.passwordsDoNotMatch': 'Las contraseñas no coinciden'
};

const user = {
  id: 1,
  nombre: 'ana',
  email: 'ana@test.com',
  fechaNacimiento: '2000-01-01',
  elo: 1200,
  victorias: 3,
  notificacionesPartidos: true,
  diasAntelacionPartidos: 2
};

const createStore = (usuario) => ({
  getState: () => ({ users: { user: usuario } }),
  dispatch: vi.fn(),
  subscribe: () => () => {}
});

const renderProfile = (usuario = user, store = createStore(usuario)) => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={store}>
      <Profile />
    </Provider>
  </IntlProvider>
);

class FakeFileReader {
  constructor() {
    FakeFileReader.instance = this;
    this.onload = null;
  }
  readAsDataURL() {}
}

const cambiarEmail = (container, valor) =>
  fireEvent.change(container.querySelector('#email'), { target: { value: valor } });

const rellenarContrasenas = (container, antigua, nueva, confirmacion) => {
  fireEvent.change(container.querySelector('#oldPassword'), { target: { value: antigua } });
  fireEvent.change(container.querySelector('#newPassword'), { target: { value: nueva } });
  fireEvent.change(container.querySelector('#confirmNewPassword'), { target: { value: confirmacion } });
};

describe('Profile', () => {
  let store;

  beforeEach(() => {
    store = createStore(user);
    backend.userService.updateProfile.mockReset();
    backend.userService.changePassword.mockReset();
  });

  it('muestra las estadisticas y los datos del usuario', () => {
    renderProfile(user, store);
    expect(screen.getByRole('heading', { level: 2, name: 'ana' })).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    expect(screen.getByText('ELO Actual')).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('Equipos')).toBeInTheDocument();
    expect(screen.getByText('Victorias')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2 días antes')).toBeInTheDocument();
  });

  it('muestra valores por defecto si el usuario no tiene datos', () => {
    renderProfile({ id: 1, nombre: 'ana', email: 'ana@test.com' });
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('muestra el subindice provisional si el ELO es provisional', () => {
    renderProfile({ ...user, eloProvisional: true });
    expect(screen.getByText('Provisional')).toBeInTheDocument();
  });

  it('actualiza el perfil correctamente', async () => {
    backend.userService.updateProfile.mockResolvedValue({ ok: true, payload: { id: 1, nombre: 'ana' } });
    const { container } = renderProfile(user, store);
    cambiarEmail(container, 'nuevo@test.com');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Perfil actualizado correctamente')).toBeInTheDocument();
    expect(backend.userService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      nombre: 'ana',
      email: 'nuevo@test.com',
      imagenPerfil: null,
      fechaNacimiento: '2000-01-01'
    }));
    expect(store.dispatch).toHaveBeenCalledWith(actions.updateProfileCompleted({ id: 1, nombre: 'ana' }));
  });

  it('muestra el error del backend al actualizar el perfil', async () => {
    backend.userService.updateProfile.mockResolvedValue({ ok: false, payload: { globalError: 'no se pudo guardar' } });
    const { container } = renderProfile(user, store);
    cambiarEmail(container, 'nuevo@test.com');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('no se pudo guardar')).toBeInTheDocument();
  });

  it('no llama al backend si faltan campos obligatorios', () => {
    const { container } = renderProfile({ id: 1, nombre: 'ana', email: 'ana@test.com' });
    fireEvent.submit(container.querySelector('form'));
    expect(backend.userService.updateProfile).not.toHaveBeenCalled();
    expect(screen.getAllByText('Campo obligatorio').length).toBeGreaterThan(0);
  });

  it('cambia la contrasena correctamente', async () => {
    backend.userService.changePassword.mockResolvedValue({ ok: true, payload: {} });
    const { container } = renderProfile(user, store);
    fireEvent.click(screen.getByRole('tab', { name: 'Cambiar Contraseña' }));
    rellenarContrasenas(container, 'vieja1', 'Nueva12@', 'Nueva12@');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Contraseña cambiada correctamente')).toBeInTheDocument();
    expect(backend.userService.changePassword).toHaveBeenCalledWith(1, 'vieja1', 'Nueva12@');
    expect(container.querySelector('#newPassword').value).toBe('');
  });

  it('no cambia la contrasena si las contrasenas no coinciden', () => {
    const { container } = renderProfile(user, store);
    fireEvent.click(screen.getByRole('tab', { name: 'Cambiar Contraseña' }));
    rellenarContrasenas(container, 'vieja1', 'Nueva12@', 'Otra123@');
    fireEvent.submit(container.querySelector('form'));
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(backend.userService.changePassword).not.toHaveBeenCalled();
  });

  it('muestra el error del backend al cambiar la contrasena', async () => {
    backend.userService.changePassword.mockResolvedValue({ ok: false, payload: { globalError: 'contraseña incorrecta' } });
    const { container } = renderProfile(user, store);
    fireEvent.click(screen.getByRole('tab', { name: 'Cambiar Contraseña' }));
    rellenarContrasenas(container, 'mala1', 'Nueva12@', 'Nueva12@');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('contraseña incorrecta')).toBeInTheDocument();
  });

  it('desactiva el selector de dias al apagar las notificaciones', () => {
    const { container } = renderProfile(user, store);
    expect(container.querySelector('#diasAntelacionPartidos').disabled).toBe(false);
    fireEvent.click(container.querySelector('#notificacionesPartidosSwitch'));
    expect(container.querySelector('#diasAntelacionPartidos').disabled).toBe(true);
  });

  it('permite subir y eliminar una imagen de perfil', () => {
    FakeFileReader.instance = null;
    vi.stubGlobal('FileReader', FakeFileReader);
    const { container } = renderProfile(user, store);
    fireEvent.change(container.querySelector('#profileImage'), {
      target: { files: [new File(['x'], 'foto.png', { type: 'image/png' })] }
    });
    act(() => {
      FakeFileReader.instance.onload({ target: { result: 'data:image/png;base64,xxxx' } });
    });
    const removeBtn = screen.getByRole('button', { name: 'Eliminar Imagen' });
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(screen.queryByRole('button', { name: 'Eliminar Imagen' })).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
