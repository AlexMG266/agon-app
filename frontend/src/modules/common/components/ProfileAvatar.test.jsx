import { render, screen } from '@testing-library/react';
import ProfileAvatar from './ProfileAvatar';

describe('ProfileAvatar', () => {
  it('muestra la imagen cuando hay imageUrl', () => {
    render(<ProfileAvatar imageUrl="http://img/avatar.png" name="Ana" />);
    const img = screen.getByAltText('Profile');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://img/avatar.png');
  });

  it('muestra la inicial cuando no hay imagen', () => {
    render(<ProfileAvatar name="ana" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('muestra ? cuando no hay nombre', () => {
    render(<ProfileAvatar name={null} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('aplica estilos de tamaño numérico', () => {
    render(<ProfileAvatar name="ana" size={50} />);
    const placeholder = screen.getByText('A');
    expect(placeholder).toHaveStyle({ width: '50px', height: '50px' });
  });

  it('no aplica estilos de tamaño no numérico', () => {
    render(<ProfileAvatar name="ana" size="sm" />);
    const placeholder = screen.getByText('A');
    expect(placeholder).not.toHaveStyle({ width: '50px' });
  });
});
