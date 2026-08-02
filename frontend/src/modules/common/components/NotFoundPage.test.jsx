import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import NotFoundPage from './NotFoundPage';

const renderWithProviders = () => render(
  <IntlProvider locale="es">
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  </IntlProvider>
);

describe('NotFoundPage', () => {
  it('muestra el titulo de pagina no encontrada', () => {
    renderWithProviders();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('muestra el boton de volver al inicio', () => {
    renderWithProviders();
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
  });
});
