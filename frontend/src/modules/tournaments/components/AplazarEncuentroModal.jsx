import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import backend from '../../../backend';
import './EncuentroModal.css';

const AplazarEncuentroModal = ({ show, encuentro, onHide, onEnviado, onSuccessClose }) => {
    const intl = useIntl();
    const [fecha, setFecha] = useState('');
    const [motivo, setMotivo] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Resetear el formulario cada vez que se abre.
    useEffect(() => {
        if (show) {
            setFecha('');
            setMotivo('');
            setSaving(false);
            setError(null);
            setSuccess(false);
        }
    }, [show]);

    // Al cerrar desde la pantalla de éxito se cierran todos los modales
    // (solicitud de aplazamiento y detalle del encuentro).
    const handleClose = () => {
        if (success && onSuccessClose) {
            onSuccessClose();
        } else {
            onHide();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fecha) {
            setError(intl.formatMessage({ id: 'project.encuentro.error.aplazarFecha', defaultMessage: 'Debes indicar una nueva fecha.' }));
            return;
        }
        setSaving(true);
        setError(null);
        try {
            // se envia la fecha tal cual la devuelve el input datetime-local
            // (formato yyyy-MM-ddTHH:mm), que es el que espera el backend.
            const response = await backend.tournamentService.solicitarAplazamiento(encuentro.id, fecha, motivo);
            if (response.ok) {
                // se muestra la pantalla de confirmacion y se avisa al padre
                if (onEnviado) onEnviado(encuentro.id);
                setSuccess(true);
            } else {
                const msg =
                    (response.payload && (response.payload.message || response.payload.error || response.payload.globalError)) ||
                    response.error ||
                    intl.formatMessage({ id: 'project.encuentro.error.aplazar', defaultMessage: 'No se pudo solicitar el aplazamiento.' });
                setError(msg);
            }
        } catch (err) {
            setError(err.message || intl.formatMessage({ id: 'project.encuentro.error.aplazar', defaultMessage: 'No se pudo solicitar el aplazamiento.' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            keyboard={false}
            backdropClassName="enm-backdrop"
            dialogClassName="enm-dialog-sm"
            contentClassName="enm-content"
        >
            <Modal.Header closeButton className="enm-header" onHide={handleClose}>
                <Modal.Title className="enm-title">
                    <span className="enm-title-icon">
                        <i className="fa-regular fa-calendar-plus" />
                    </span>
                    <FormattedMessage id="project.encuentro.aplazarTitle" defaultMessage="Solicitar aplazamiento" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="enm-body">
                {success ? (
                    <div className="enm-success">
                        <i className="fa-solid fa-circle-check enm-success-icon" />
                        <p className="enm-success-title">
                            <FormattedMessage id="project.encuentro.aplazarEnviado" defaultMessage="Solicitud enviada" />
                        </p>
                        <p className="enm-success-detail">
                            <FormattedMessage id="project.encuentro.aplazarEnviadoDetail" defaultMessage="El otro capitán recibirá una notificación para aceptar o rechazar el aplazamiento." />
                        </p>
                        <Button variant="outline-dark" size="sm" className="enm-btn enm-btn-cancel" onClick={handleClose}>
                            <FormattedMessage id="project.encuentro.close" defaultMessage="Cerrar" />
                        </Button>
                    </div>
                ) : (
                <>
                <div className="enm-aplazar-sub">
                    <FormattedMessage
                        id="project.encuentro.aplazarSubtitle"
                        defaultMessage="Indica la nueva fecha y hora para el encuentro. El otro capitán deberá aceptarla para que el aplazamiento se haga efectivo."
                    />
                </div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="enm-field">
                        <Form.Label className="enm-field-label">
                            <FormattedMessage id="project.encuentro.aplazarFecha" defaultMessage="Nueva fecha" />
                        </Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            className="enm-datetime"
                        />
                    </Form.Group>
                    <Form.Group className="enm-field">
                        <Form.Label className="enm-field-label">
                            <FormattedMessage id="project.encuentro.aplazarMotivo" defaultMessage="Motivo (opcional)" />
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            className="enm-textarea"
                        />
                    </Form.Group>
                    {error && (
                        <div className="enm-alert" role="alert">
                            <i className="fa-regular fa-triangle-exclamation" />
                            {error}
                        </div>
                    )}
                    <div className="enm-actions">
                        <Button variant="light" className="enm-btn enm-btn-cancel" onClick={handleClose} disabled={saving}>
                            <FormattedMessage id="project.encuentro.cancel" defaultMessage="Cancelar" />
                        </Button>
                        <Button type="submit" variant="dark" className="enm-btn enm-btn-primary" disabled={saving}>
                            {saving ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <>
                                    <i className="fa-regular fa-paper-plane" />
                                    <FormattedMessage id="project.encuentro.aplazarSubmit" defaultMessage="Solicitar aplazamiento" />
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
                </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AplazarEncuentroModal;
