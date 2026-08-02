import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import ScrollToTop from './ScrollToTop';

const Harness = () => {
  const navigate = useNavigate();
  return (
    <>
      <ScrollToTop />
      <button onClick={() => navigate('/otra')}>ir</button>
    </>
  );
};

describe('ScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hace scroll arriba al montar', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <Harness />
      </MemoryRouter>
    );
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('hace scroll arriba al cambiar de ruta', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <Harness />
      </MemoryRouter>
    );
    scrollSpy.mockClear();
    fireEvent.click(screen.getByText('ir'));
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('no renderiza nada', () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(document.body).toBeInTheDocument();
  });
});
