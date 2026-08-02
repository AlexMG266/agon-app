import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import ForbiddenPage from './ForbiddenPage';

const renderWithProviders = () => render(
  <IntlProvider locale="es">
    <MemoryRouter>
      <ForbiddenPage />
    </MemoryRouter>
  </IntlProvider>
);

describe('ForbiddenPage', () => {
  it('muestra el titulo de acceso denegado', () => {
    renderWithProviders();
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });

  it('muestra el boton de volver al inicio', () => {
    renderWithProviders();
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
  });
});
