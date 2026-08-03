import * as actionTypes from './actionTypes';
import { error, setLocale } from './actions';

describe('app actions', () => {
  it('error crea la accion con el mensaje', () => {
    expect(error('fallo')).toEqual({ type: actionTypes.ERROR, error: 'fallo' });
  });

  it('setLocale crea la accion con el locale', () => {
    expect(setLocale('gl')).toEqual({ type: actionTypes.SET_LOCALE, locale: 'gl' });
  });
});
