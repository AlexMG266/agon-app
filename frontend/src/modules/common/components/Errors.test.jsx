import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Errors from './Errors';

const messages = {
  'project.global.fields.nombre': 'Nombre',
  'project.global.fields.password': 'Contraseña'
};

const renderWithProviders = (errors, onClose) => render(
  <IntlProvider locale="es" messages={messages}>
    <Errors errors={errors} onClose={onClose} />
  </IntlProvider>
);

describe('Errors', () => {
  it('no renderiza nada si no hay errores', () => {
    const { container } = renderWithProviders(null, () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el error global', () => {
    renderWithProviders({ globalError: 'Credenciales incorrectas' }, () => {});
    expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
  });

  it('no renderiza nada si no hay errores que mostrar', () => {
    const { container } = renderWithProviders({}, () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra los errores de campo traducidos', () => {
    renderWithProviders({ fieldErrors: [{ fieldName: 'nombre', message: 'es obligatorio' }] }, () => {});
    expect(screen.getByText('Nombre: es obligatorio')).toBeInTheDocument();
  });

  it('llama a onClose al pulsar cerrar', () => {
    const onClose = vi.fn();
    renderWithProviders({ globalError: 'fallo' }, onClose);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });
});
