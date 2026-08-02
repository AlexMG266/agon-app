import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import ConfirmationModal from './ConfirmationModal';

const messages = {
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.common.ConfirmationModal.processing': 'Procesando...'
};

const renderModal = (props = {}) => render(
  <IntlProvider locale="es" messages={messages}>
    <ConfirmationModal
      show
      onHide={() => {}}
      onConfirm={() => {}}
      title="¿Seguro?"
      description="Descripción"
      confirmText="Confirmar"
      {...props}
    />
  </IntlProvider>
);

describe('ConfirmationModal', () => {
  it('muestra titulo, descripcion y botones', () => {
    renderModal();
    expect(screen.getByText('¿Seguro?')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('no muestra el modal cuando show es false', () => {
    renderModal({ show: false });
    expect(screen.queryByText('¿Seguro?')).not.toBeInTheDocument();
  });

  it('llama a onHide al cancelar', () => {
    const onHide = vi.fn();
    renderModal({ onHide });
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onHide).toHaveBeenCalled();
  });

  it('llama a onConfirm al confirmar', () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('deshabilita botones y muestra spinner cuando isSubmitting', () => {
    renderModal({ isSubmitting: true });
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
    expect(screen.getByText('Cancelar').closest('button')).toBeDisabled();
  });
});
