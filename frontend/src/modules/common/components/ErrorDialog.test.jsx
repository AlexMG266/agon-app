import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import ErrorDialog from './ErrorDialog';
import { NetworkError } from '../../../backend';

const messages = {
  'project.global.exceptions.NetworkError': 'Error de red',
  'project.common.ErrorDialog.title': 'Error',
  'project.global.buttons.close': 'Cerrar'
};

const renderWithProviders = (error, onClose) => render(
  <IntlProvider locale="es" messages={messages}>
    <ErrorDialog error={error} onClose={onClose} />
  </IntlProvider>
);

describe('ErrorDialog', () => {
  it('no renderiza nada si el error es null', () => {
    const { container } = renderWithProviders(null, () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el mensaje de un error normal', () => {
    renderWithProviders(new Error('algo falló'), () => {});
    expect(screen.getByText('algo falló')).toBeInTheDocument();
  });

  it('muestra el mensaje traducido para NetworkError', () => {
    renderWithProviders(new NetworkError(), () => {});
    expect(screen.getByText('Error de red')).toBeInTheDocument();
  });

  it('llama a onClose al pulsar cerrar', () => {
    const onClose = vi.fn();
    renderWithProviders(new Error('fallo'), onClose);
    fireEvent.click(screen.getByText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });
});
