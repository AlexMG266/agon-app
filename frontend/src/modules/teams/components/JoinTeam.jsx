import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import { Errors } from '../../common';
import ProfileAvatar from '../../common/components/ProfileAvatar';
import backend from '../../../backend';
import './JoinTeam.css';

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

const JoinTeam = () => {
    const user = useSelector(state => state.users?.user);
    const formRef = useRef(null);

    const [codigo, setCodigo] = useState('');
    const [estado, setEstado] = useState(ESTADOS.IDLE);
    const [teamFound, setTeamFound] = useState(null);
    const [backendErrors, setBackendErrors] = useState(null);
    const [formValidated, setFormValidated] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (formRef.current && !formRef.current.checkValidity()) {
            setFormValidated(true);
            return;
        }

        setBackendErrors(null);
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
                if (response.status === 404) {
                    setBackendErrors('No se encontró ningún equipo activo con ese código');
                } else {
                    setBackendErrors(response.error || 'Error al buscar el equipo');
                }
            }
        } catch (error) {
            setEstado(ESTADOS.NOT_FOUND);
            setBackendErrors(error.message || 'Error de conexión al buscar el equipo');
        }
    };

    const handleRequestJoin = async () => {
        setEstado(ESTADOS.REQUESTING);
        setBackendErrors(null);

        try {
            const response = await backend.teamService.requestJoinWithCode(codigo.trim());

            if (response.ok) {
                setEstado(ESTADOS.REQUEST_SUCCESS);
            } else {
                setEstado(ESTADOS.REQUEST_ERROR);
                setBackendErrors(response.payload?.message || response.payload?.error || 'No se pudo enviar la solicitud');
            }
        } catch (error) {
            setEstado(ESTADOS.REQUEST_ERROR);
            setBackendErrors(error.message || 'Error de conexión al enviar la solicitud');
        }
    };

    const handleReset = () => {
        setCodigo('');
        setEstado(ESTADOS.IDLE);
        setTeamFound(null);
        setBackendErrors(null);
        setFormValidated(false);
    };

    const isCaptain = teamFound && user?.id === teamFound.creadorId;

    return (
        <div className="join-team">
            <div className="join-team-header">
                <h5 className="join-team-title">
                    <i className="fa-solid fa-right-to-bracket me-2"></i>
                    Unirse a un equipo
                </h5>
            </div>

            {estado === ESTADOS.REQUEST_SUCCESS ? (
                <div className="join-team-success">
                    <div className="join-team-success-icon">
                        <i className="fa-regular fa-circle-check"></i>
                    </div>
                    <p className="join-team-success-text">
                        ¡Solicitud enviada con éxito!
                    </p>
                    <p className="join-team-success-desc">
                        El capitán del equipo revisará tu petición y recibirás una notificación cuando sea respondida.
                    </p>
                    <Button
                        variant="dark"
                        className="join-team-reset-btn rounded-pill px-4"
                        onClick={handleReset}
                    >
                        Enviar otra solicitud
                    </Button>
                </div>
            ) : (
                <>
                    <p className="join-team-subtitle">
                        Introduce el código de 8 caracteres que te ha proporcionado el capitán del equipo
                    </p>

                    <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                    <Form
                        ref={formRef}
                        noValidate
                        validated={formValidated}
                        onSubmit={handleSearch}
                        className="join-team-form"
                    >
                        <div className="join-team-input-group">
                            <Form.Control
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Código del equipo (ej. a7K9pX2L)"
                                maxLength={8}
                                className="join-team-input"
                                disabled={estado === ESTADOS.LOADING || estado === ESTADOS.REQUESTING}
                                required
                            />
                            <Button
                                type="submit"
                                className="join-team-search-btn"
                                disabled={
                                    estado === ESTADOS.LOADING ||
                                    estado === ESTADOS.REQUESTING ||
                                    codigo.trim().length === 0
                                }
                            >
                                {estado === ESTADOS.LOADING ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" className="me-1" />
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-search me-1"></i>
                                        Buscar
                                    </>
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
                                            {teamFound.miembros?.length || 0}/2 miembros
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
                                <div className="join-team-members-title">Miembros del equipo:</div>
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
                                                                <i className="fa-solid fa-crown me-1"></i>Capitán
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
                                    Ya formas parte de este equipo
                                </div>
                            )}

                            {estado === ESTADOS.TEAM_FULL && (
                                <div className="join-team-alert alert alert-warning">
                                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                                    Este equipo ya está completo (máximo 2 miembros)
                                </div>
                            )}

                            {estado === ESTADOS.FOUND && (
                                <div className="join-team-action">
                                    {isCaptain ? (
                                        <div className="join-team-alert alert alert-info">
                                            <i className="fa-solid fa-crown me-2"></i>
                                            Eres el capitán de este equipo
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
                                                    Enviando solicitud...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-paper-plane me-2"></i>
                                                    Solicitar unirse
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
                                        Reintentar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {estado === ESTADOS.NOT_FOUND && !teamFound && (
                        <div className="join-team-not-found">
                            <i className="fa-regular fa-circle-xmark mb-2"></i>
                            <p className="m-0">No se encontró ningún equipo con ese código</p>
                            <p className="small text-muted mt-1">Verifica que el código sea correcto e inténtalo de nuevo</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JoinTeam;
