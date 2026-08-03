import reducer from './reducer';
import * as actionTypes from './actionTypes';
import { getInitialLocale } from '../../i18n';

describe('app reducer', () => {
  it('devuelve el estado inicial', () => {
    expect(reducer(undefined, {})).toEqual({ error: null, locale: getInitialLocale() });
  });

  it('guarda el error en ERROR', () => {
    const error = { message: 'algo fallo' };
    expect(reducer(undefined, { type: actionTypes.ERROR, error })).toEqual({
      error,
      locale: getInitialLocale()
    });
  });

  it('actualiza el locale en SET_LOCALE', () => {
    expect(reducer(undefined, { type: actionTypes.SET_LOCALE, locale: 'gl' }).locale).toBe('gl');
    expect(reducer(undefined, { type: actionTypes.SET_LOCALE, locale: 'en' }).locale).toBe('en');
  });

  it('ignora locales no soportados en SET_LOCALE', () => {
    const state = { error: null, locale: 'es' };
    expect(reducer(state, { type: actionTypes.SET_LOCALE, locale: 'fr' })).toBe(state);
  });

  it('mantiene el estado ante acciones desconocidas', () => {
    const state = { error: 'previo', locale: 'es' };
    expect(reducer(state, { type: 'DESCONOCIDA' })).toBe(state);
  });
});
