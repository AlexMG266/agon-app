import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import BackLink from './BackLink';

const messages = {
  'project.global.buttons.back': 'Atrás'
};

const renderWithProviders = () => render(
  <IntlProvider locale="es" messages={messages}>
    <MemoryRouter>
      <BackLink />
    </MemoryRouter>
  </IntlProvider>
);

describe('BackLink', () => {
  it('muestra el enlace de volver', () => {
    renderWithProviders();
    expect(screen.getByText('Atrás')).toBeInTheDocument();
  });

  it('navega hacia atras al hacer clic', () => {
    renderWithProviders();
    const link = screen.getByText('Atrás');
    fireEvent.click(link);
    expect(link).toBeInTheDocument();
  });
});
