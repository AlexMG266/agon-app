import { render, screen, fireEvent } from '@testing-library/react';
import Success from './Success';

describe('Success', () => {
  it('no renderiza nada si no hay mensaje', () => {
    const { container } = render(<Success message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el mensaje de exito', () => {
    render(<Success message="Operación completada" />);
    expect(screen.getByText('Operación completada')).toBeInTheDocument();
  });

  it('muestra el boton de cerrar y llama a onClose', () => {
    const onClose = vi.fn();
    render(<Success message="Hecho" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });
});
