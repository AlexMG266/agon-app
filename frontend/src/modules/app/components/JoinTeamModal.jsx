import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import ProfileAvatar from '../../common/components/ProfileAvatar';
import backend from '../../../backend';
import '../../teams/components/JoinTeam.css';

const ESTADOS = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    FOUND: 'FOUND',
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_MEMBER: 'ALREADY_MEMBER',
    TEAM_FULL: 'TEAM_FULL',
    REQUESTING: 'REQUESTING',
    REQUEST_SUCCESS: 'REQUEST_SUCCESS',
    REQUEST_ERROR: 'REQUEST_ERROR'
};

const JoinTeamModal = ({ show, onHide }) => {
    const intl = useIntl();
    const user = useSelector(state => state.users?.user);
    const formRef = useRef(null);

    const [codigo, setCodigo] = useState('');
    const [estado, setEstado] = useState(ESTADOS.IDLE);
    const [teamFound, setTeamFound] = useState(null);
    const [formValidated, setFormValidated] = useState(false);

    const resetState = () => {
        setCodigo('');
        setEstado(ESTADOS.IDLE);
        setTeamFound(null);
        setFormValidated(false);
    };

    const handleHide = () => {
        resetState();
        onHide();
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (formRef.current && !formRef.current.checkValidity()) {
            setFormValidated(true);
            return;
        }

        setEstado(ESTADOS.LOADING);
        setTeamFound(null);

        try {
            const response = await backend.teamService.getTeamByCode(codigo.trim());

            if (response.ok && response.payload) {
                const team = response.payload;

                const esMiembro = team.miembros?.some(m => m.id === user?.id);
                if (esMiembro) {
                    setEstado(ESTADOS.ALREADY_MEMBER);
                    setTeamFound(team);
                    return;
                }

                if (team.miembros?.length >= 2) {
                    setEstado(ESTADOS.TEAM_FULL);
                    setTeamFound(team);
                    return;
                }

                setEstado(ESTADOS.FOUND);
                setTeamFound(team);
            } else {
                setEstado(ESTADOS.NOT_FOUND);
            }
        } catch {
            setEstado(ESTADOS.NOT_FOUND);
        }
    };

    const handleRequestJoin = async () => {
        setEstado(ESTADOS.REQUESTING);

        try {
            const response = await backend.teamService.requestJoinWithCode(codigo.trim());

            if (response.ok) {
                setEstado(ESTADOS.REQUEST_SUCCESS);
            } else {
                setEstado(ESTADOS.REQUEST_ERROR);
            }
        } catch {
            setEstado(ESTADOS.REQUEST_ERROR);
        }
    };

    const isCaptain = teamFound && user?.id === teamFound.creadorId;

    return (
        <Modal show={show} onHide={handleHide} centered size="md" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title as="h6" className="fw-bold">
                    <i className="fa-solid fa-right-to-bracket me-2"></i>
                    <FormattedMessage id="project.teams.JoinTeam.title" defaultMessage="Unirse a un equipo" />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {estado === ESTADOS.REQUEST_SUCCESS ? (
                    <div className="join-team-success">
                        <div className="join-team-success-icon">
                            <i className="fa-regular fa-circle-check"></i>
                        </div>
                        <div className="join-team-success-text">
                            <FormattedMessage id="project.teams.JoinTeam.success.title" defaultMessage="¡Solicitud enviada con éxito!" />
                        </div>
                        <div className="join-team-success-desc">
                            <FormattedMessage id="project.teams.JoinTeam.success.description" defaultMessage="El capitán del equipo revisará tu petición y recibirás una notificación cuando sea respondida." />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-muted small mb-3">
                            <FormattedMessage id="project.teams.JoinTeam.subtitle" defaultMessage="Introduce el código de 8 caracteres que te ha proporcionado el capitán del equipo" />
                        </p>


                        <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSearch}>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder={intl.formatMessage({ id: 'project.teams.JoinTeam.placeholder', defaultMessage: 'Código del equipo (ej. a7K9pX2L)' })}
                                    maxLength={8}
                                    disabled={estado === ESTADOS.LOADING || estado === ESTADOS.REQUESTING}
                                    required
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
                                    disabled={estado === ESTADOS.LOADING || estado === ESTADOS.REQUESTING || codigo.trim().length === 0}
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
                                    {estado === ESTADOS.LOADING ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" />
                                    ) : (
                                        <><i className="fa-solid fa-search me-1"></i><FormattedMessage id="project.teams.JoinTeam.search" defaultMessage="Buscar" /></>
                                    )}
                                </Button>
                            </div>
                        </Form>

                        {teamFound && (estado === ESTADOS.FOUND || estado === ESTADOS.ALREADY_MEMBER || estado === ESTADOS.TEAM_FULL) && (
                            <div className="join-team-result">
                                <div className="join-team-result-header">
                                    <div className="join-team-result-icon">
                                        <i className="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <div className="join-team-result-info">
                                        <div className="join-team-result-name">
                                            {teamFound.nombreEquipo || teamFound.nombre}
                                        </div>
                                        <div className="join-team-result-meta">
                                            <Badge className="join-team-badge">
                                                <i className="fa-solid fa-users me-1"></i>
                                                <FormattedMessage id="project.teams.JoinTeam.members" defaultMessage="{count}/2 miembros" values={{ count: teamFound.miembros?.length || 0 }} />
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {teamFound.descripcion && (
                                    <div className="join-team-result-desc">
                                        <p className="mb-0">{teamFound.descripcion}</p>
                                    </div>
                                )}

                                <div className="join-team-result-members">
                                    <div className="join-team-members-title">
                                        <FormattedMessage id="project.teams.JoinTeam.membersLabel" defaultMessage="Miembros del equipo:" />
                                    </div>
                                    <div className="join-team-members-list">
                                        {teamFound.miembros?.map((member) => {
                                            const esCapitan = member.id === teamFound.creadorId;
                                            return (
                                                <div key={member.id} className="join-team-member">
                                                    <ProfileAvatar
                                                        imageUrl={member.imagenPerfil}
                                                        name={member.nombre}
                                                        size={32}
                                                        className="join-team-member-avatar"
                                                    />
                                                    <div className="join-team-member-info">
                                                        <span className="join-team-member-name">
                                                            {member.nombre}
                                                            {esCapitan && (
                                                                <Badge className="join-team-captain-badge ms-2">
                                                                    <i className="fa-solid fa-crown me-1"></i>
                                                                    <FormattedMessage id="project.teams.JoinTeam.captain" defaultMessage="Capitán" />
                                                                </Badge>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {estado === ESTADOS.ALREADY_MEMBER && (
                                    <div className="join-team-alert alert alert-info">
                                        <i className="fa-solid fa-circle-info me-2"></i>
                                        <FormattedMessage id="project.teams.JoinTeam.alreadyMember" defaultMessage="Ya formas parte de este equipo" />
                                    </div>
                                )}

                                {estado === ESTADOS.TEAM_FULL && (
                                    <div className="join-team-alert alert alert-warning">
                                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                                        <FormattedMessage id="project.teams.JoinTeam.teamFull" defaultMessage="Este equipo ya está completo (máximo 2 miembros)" />
                                    </div>
                                )}

                                {estado === ESTADOS.FOUND && (
                                    <div className="join-team-action">
                                        {isCaptain ? (
                                            <div className="join-team-alert alert alert-info">
                                                <i className="fa-solid fa-crown me-2"></i>
                                                <FormattedMessage id="project.teams.JoinTeam.youAreCaptain" defaultMessage="Eres el capitán de este equipo" />
                                            </div>
                                        ) : (
                                            <Button
                                                className="join-team-request-btn"
                                                onClick={handleRequestJoin}
                                                disabled={estado === ESTADOS.REQUESTING}
                                            >
                                                {estado === ESTADOS.REQUESTING ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                                        <FormattedMessage id="project.teams.JoinTeam.requesting" defaultMessage="Enviando solicitud..." />
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-paper-plane me-2"></i>
                                                        <FormattedMessage id="project.teams.JoinTeam.requestJoin" defaultMessage="Solicitar unirse" />
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {estado === ESTADOS.REQUEST_ERROR && (
                                    <div className="join-team-action">
                                        <Button
                                            className="join-team-request-btn"
                                            onClick={handleRequestJoin}
                                        >
                                            <i className="fa-solid fa-rotate me-2"></i>
                                            <FormattedMessage id="project.teams.JoinTeam.retry" defaultMessage="Reintentar" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {estado === ESTADOS.NOT_FOUND && !teamFound && (
                            <div className="join-team-not-found">
                                <i className="fa-regular fa-circle-xmark mb-2"></i>
                                <p className="m-0"><FormattedMessage id="project.teams.JoinTeam.notFound" defaultMessage="No se encontró ningún equipo con ese código" /></p>
                                <p className="small text-muted mt-1"><FormattedMessage id="project.teams.JoinTeam.notFoundHelp" defaultMessage="Verifica que el código sea correcto e inténtalo de nuevo" /></p>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default JoinTeamModal;
