const TIPO_LABELS = {
    INVITACION: 'Invitación',
    RECORDATORIO_PARTIDO: 'Recordatorio de partido',
    RESULTADO_PARTIDO: 'Resultado de partido',
    SOLICITUD_APLAZAMIENTO: 'Solicitud de aplazamiento',
    SYSTEM: 'Sistema'
};

const ACTION_LABELS = {
    INVITACION: 'Revisar invitación',
    RECORDATORIO_PARTIDO: 'Ver partido',
    RESULTADO_PARTIDO: 'Ver resultado',
    SOLICITUD_APLAZAMIENTO: 'Revisar solicitud',
    SYSTEM: 'Revisar'
};

export const getTipoLabel = (tipo) => TIPO_LABELS[tipo] || 'Aviso';

export const getActionLabel = (tipo) => ACTION_LABELS[tipo] || 'Revisar';

export const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const truncateMessage = (message, maxLength = 80) => {
    if (!message || message.length <= maxLength) return message;
    return message.slice(0, maxLength).trimEnd() + '…';
};
