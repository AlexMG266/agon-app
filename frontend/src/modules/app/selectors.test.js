import { getError } from './selectors';

describe('app selectors', () => {
  it('obtiene el error del estado', () => {
    expect(getError({ app: { error: 'fallo' } })).toBe('fallo');
  });

  it('devuelve null sin error', () => {
    expect(getError({ app: { error: null } })).toBeNull();
  });
});
