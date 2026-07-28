import { useState } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import backend from '../../../backend';
import '../../tournaments/components/BrowseTournaments.css';

const CodeSearchModal = ({ show, onHide }) => {
    const intl = useIntl();

    const [codeSearchTerm, setCodeSearchTerm] = useState('');
    const [codeSearchResult, setCodeSearchResult] = useState(null);
    const [codeSearching, setCodeSearching] = useState(false);
    const [codeError, setCodeError] = useState(null);

    const resetState = () => {
        setCodeSearchTerm('');
        setCodeSearchResult(null);
        setCodeSearching(false);
        setCodeError(null);
    };

    const handleHide = () => {
        resetState();
        onHide();
    };

    const handleCodeSearch = async (e) => {
        e.preventDefault();
        const code = codeSearchTerm.trim();
        if (!code) return;

        setCodeSearching(true);
        setCodeError(null);
        setCodeSearchResult(null);
        try {
            const response = await backend.tournamentService.getTournamentByCode(code);
            if (response.ok && response.payload) {
                setCodeSearchResult(response.payload);
            } else {
                setCodeError(intl.formatMessage({
                    id: 'project.app.Home.dashboard.codeNotFound',
                    defaultMessage: 'No se encontró ningún torneo con ese código'
                }));
            }
        } catch (err) {
            console.error('Error searching tournament by code:', err);
            setCodeError(err.message || intl.formatMessage({
                id: 'project.app.Home.dashboard.codeError',
                defaultMessage: 'Error al buscar el torneo'
            }));
        } finally {
            setCodeSearching(false);
        }
    };

    return (
        <Modal show={show} onHide={handleHide} centered size="md" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title as="h6" className="fw-bold">
                    <i className="fa-solid fa-key me-2"></i>
                    <FormattedMessage id="project.app.Home.dashboard.codeSearchTitle" defaultMessage="Buscar torneo por código" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">
                    <FormattedMessage id="project.tournaments.Browse.codeSearchTitle" defaultMessage="Buscar por código de torneo" />
                </p>


                <Form onSubmit={handleCodeSearch}>
                    <div className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            value={codeSearchTerm}
                            onChange={(e) => setCodeSearchTerm(e.target.value)}
                            placeholder={intl.formatMessage({ id: 'project.app.Home.dashboard.codePlaceholder', defaultMessage: 'Ej. T22-K9M8' })}
                            disabled={codeSearching}
                            className="flex-grow-1"
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.6rem',
                                borderRadius: 8,
                                border: '1.5px solid #d2d2d7',
                                background: '#f5f5f7',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.02em'
                            }}
                        />
                        <Button
                            type="submit"
                            variant="light"
                            disabled={codeSearching || !codeSearchTerm.trim()}
                            className="px-2"
                            style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                borderRadius: 8,
                                padding: '0.35rem 0.65rem',
                                background: '#1d1d1f',
                                border: 'none',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {codeSearching ? (
                                <Spinner as="span" animation="border" size="sm" role="status" />
                            ) : (
                                <><i className="fa-solid fa-search me-1"></i><FormattedMessage id="project.app.Home.dashboard.codeSearch" defaultMessage="Buscar" /></>
                            )}
                        </Button>
                    </div>
                </Form>

                {codeSearchResult && (
                    <Link
                        to={`/tournaments/view/${codeSearchResult.id}`}
                        className="bt-code-result mt-3"
                        onClick={handleHide}
                    >
                        <div>
                            <div className="bt-code-result-name">
                                {codeSearchResult.privado && <span className="me-1">🔒</span>}
                                {codeSearchResult.nombre}
                            </div>
                            <div className="bt-code-result-meta">
                                <FormattedMessage id="project.app.Home.dashboard.codeFound" defaultMessage="Código: {code}" values={{ code: codeSearchResult.codigoTorneo }} />
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-right bt-code-result-arrow" />
                    </Link>
                )}

                {codeError && !codeSearchResult && (
                    <div className="bt-message bt-message--error mt-3">
                        <i className="fa-regular fa-circle-xmark"></i>
                        <span><FormattedMessage id="project.app.Home.dashboard.codeNotFound" defaultMessage="No se encontró ningún torneo con ese código" /></span>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button
                    variant="light"
                    className="w-100"
                    onClick={handleHide}
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 8,
                        padding: '0.4rem 1rem',
                        border: '1.5px solid #d2d2d7',
                        color: '#1d1d1f',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FormattedMessage id="project.common.ConfirmationModal.cancel" defaultMessage="Cancelar" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CodeSearchModal;
