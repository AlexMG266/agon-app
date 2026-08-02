import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import Logout from './Logout';

const messages = {
  'project.users.Logout.title': '¿Cerrar sesión?',
  'project.common.ConfirmationModal.cancel': 'Cancelar',
  'project.users.Logout.confirm': 'Cerrar sesión'
};

const storeMock = {
  getState: () => ({}),
  dispatch: vi.fn(),
  subscribe: () => () => {}
};

const renderWithProviders = () => render(
  <IntlProvider locale="es" messages={messages}>
    <Provider store={storeMock}>
      <MemoryRouter initialEntries={['/perfil', '/logout']} initialIndex={1}>
        <Logout />
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

describe('Logout', () => {
  beforeEach(() => {
    storeMock.dispatch.mockClear();
  });

  it('muestra el modal de confirmacion', () => {
    renderWithProviders();
    expect(screen.getByText('¿Cerrar sesión?')).toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('despacha logout al confirmar', () => {
    renderWithProviders();
    fireEvent.click(screen.getByText('Cerrar sesión'));
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('cierra el modal al cancelar', async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => {
      expect(screen.queryByText('¿Cerrar sesión?')).not.toBeInTheDocument();
    });
  });
});
