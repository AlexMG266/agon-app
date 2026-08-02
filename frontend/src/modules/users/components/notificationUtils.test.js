import { getTipoLabel, getActionLabel, formatTimestamp, truncateMessage } from './notificationUtils';

describe('notificationUtils', () => {
  describe('getTipoLabel', () => {
    it('devuelve la etiqueta de un tipo conocido', () => {
      expect(getTipoLabel('INVITACION')).toBe('Invitación');
      expect(getTipoLabel('RECORDATORIO_PARTIDO')).toBe('Recordatorio de partido');
      expect(getTipoLabel('SYSTEM')).toBe('Sistema');
    });

    it('devuelve Aviso para tipos desconocidos', () => {
      expect(getTipoLabel('OTRO')).toBe('Aviso');
      expect(getTipoLabel(undefined)).toBe('Aviso');
    });
  });

  describe('getActionLabel', () => {
    it('devuelve la accion de un tipo conocido', () => {
      expect(getActionLabel('INVITACION')).toBe('Revisar invitación');
      expect(getActionLabel('RESULTADO_PARTIDO')).toBe('Ver resultado');
    });

    it('devuelve Revisar para tipos desconocidos', () => {
      expect(getActionLabel('OTRO')).toBe('Revisar');
    });
  });

  describe('formatTimestamp', () => {
    it('devuelve vacio sin timestamp', () => {
      expect(formatTimestamp(null)).toBe('');
      expect(formatTimestamp(undefined)).toBe('');
      expect(formatTimestamp(0)).toBe('');
    });

    it('formatea un timestamp valido', () => {
      const d = new Date(2026, 0, 15, 10, 30);
      const result = formatTimestamp(d.getTime());
      expect(result).toBe(
        d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    });
  });

  describe('truncateMessage', () => {
    it('devuelve el mensaje si es corto', () => {
      expect(truncateMessage('corto')).toBe('corto');
    });

    it('devuelve vacio sin mensaje', () => {
      expect(truncateMessage(null)).toBeNull();
      expect(truncateMessage('')).toBe('');
    });

    it('trunca mensajes largos', () => {
      const largo = 'a'.repeat(100);
      expect(truncateMessage(largo)).toBe('a'.repeat(80) + '…');
    });

    it('respeta maxLength custom', () => {
      expect(truncateMessage('abcdefghij', 5)).toBe('abcde…');
    });
  });
});
