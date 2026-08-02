import reducer from './reducer';
import * as actionTypes from './actionTypes';

describe('app reducer', () => {
  it('devuelve el estado inicial', () => {
    expect(reducer(undefined, {})).toEqual({ error: null });
  });

  it('guarda el error en ERROR', () => {
    const error = { message: 'algo fallo' };
    expect(reducer(undefined, { type: actionTypes.ERROR, error })).toEqual({ error });
  });

  it('mantiene el estado ante acciones desconocidas', () => {
    const state = { error: 'previo' };
    expect(reducer(state, { type: 'DESCONOCIDA' })).toBe(state);
  });
});
