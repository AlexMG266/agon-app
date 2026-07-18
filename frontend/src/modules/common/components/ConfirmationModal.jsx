import { FormattedMessage } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const ConfirmationModal = ({
                               show,
                               onHide,
                               onConfirm,
                               title,
                               description,
                               confirmText,
                               isSubmitting = false,
                               variant = 'primary'
                           }) => {
    const isDanger = variant === 'danger';
    const activeColor = isDanger ? '#ff3b30' : '#0071e3';

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            contentClassName="border-0 rounded-4 shadow"
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
        >
            <Modal.Body className="p-4 text-center">
                <h5 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>
                    {title}
                </h5>
                <p className="text-secondary small mb-4">
                    {description}
                </p>

                <div className="d-flex gap-2 justify-content-center">
                    <Button
                        variant="light"
                        className="rounded-pill px-4 fw-medium text-secondary"
                        onClick={onHide}
                        disabled={isSubmitting}
                        style={{ fontSize: '0.88rem', border: '1px solid #d2d2d7' }}
                    >
                        <FormattedMessage id="project.common.ConfirmationModal.cancel" defaultMessage="Cancelar" />
                    </Button>
                    <Button
                        variant={isDanger ? 'danger' : 'primary'}
                        className="rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        style={{
                            fontSize: '0.88rem',
                            backgroundColor: activeColor,
                            borderColor: activeColor
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                <FormattedMessage id="project.common.ConfirmationModal.processing" defaultMessage="Procesando..." />
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ConfirmationModal;