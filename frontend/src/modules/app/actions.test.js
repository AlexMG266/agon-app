import * as actionTypes from './actionTypes';
import { error } from './actions';

describe('app actions', () => {
  it('error crea la accion con el mensaje', () => {
    expect(error('fallo')).toEqual({ type: actionTypes.ERROR, error: 'fallo' });
  });
});
