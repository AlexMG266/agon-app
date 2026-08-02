import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Pager from './Pager';

const messages = {
  'project.global.buttons.back': 'Atrás',
  'project.global.buttons.next': 'Siguiente'
};

const renderPager = (back, next) => render(
  <IntlProvider locale="es" messages={messages}>
    <Pager back={back} next={next} />
  </IntlProvider>
);

describe('Pager', () => {
  it('muestra los botones de navegacion', () => {
    renderPager({ enabled: true, onClick: () => {} }, { enabled: true, onClick: () => {} });
    expect(screen.getByText('Atrás')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('deshabilita los botones cuando no estan habilitados', () => {
    renderPager({ enabled: false, onClick: () => {} }, { enabled: false, onClick: () => {} });
    const prev = screen.getByText('Atrás').closest('li');
    const next = screen.getByText('Siguiente').closest('li');
    expect(prev).toHaveClass('disabled');
    expect(next).toHaveClass('disabled');
  });

  it('llama a los callbacks al pulsar los botones habilitados', () => {
    const backClick = vi.fn();
    const nextClick = vi.fn();
    renderPager({ enabled: true, onClick: backClick }, { enabled: true, onClick: nextClick });
    fireEvent.click(screen.getByText('Atrás'));
    fireEvent.click(screen.getByText('Siguiente'));
    expect(backClick).toHaveBeenCalled();
    expect(nextClick).toHaveBeenCalled();
  });
});
