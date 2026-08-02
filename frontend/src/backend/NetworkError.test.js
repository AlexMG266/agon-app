import NetworkError from './NetworkError';

describe('NetworkError', () => {
  it('es una instancia de Error', () => {
    const error = new NetworkError();
    expect(error).toBeInstanceOf(Error);
  });

  it('tiene el mensaje por defecto', () => {
    const error = new NetworkError();
    expect(error.message).toBe('Network error');
  });

  it('se puede lanzar y capturar', () => {
    try {
      throw new NetworkError();
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError);
    }
  });
});
