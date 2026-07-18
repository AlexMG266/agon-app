import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { Errors } from '../../common';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import ProfileAvatar from '../../common/components/ProfileAvatar';
import * as actions from '../actions';
import backend from '../../../backend';
import './TeamDetail.css';

const TeamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const intl = useIntl();
    const user = useSelector(state => state.users?.user);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescripcion, setEditDescripcion] = useState('');
    const [backendErrors, setBackendErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showKickModal, setShowKickModal] = useState(false);
    const [memberToKick, setMemberToKick] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTeam();
    }, [id]);

    const loadTeam = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await backend.teamService.getTeam(id);
            console.log("Respuesta:", response);
            
            if (response.ok && response.payload) {
                setTeam(response.payload);
                setEditName(response.payload.nombreEquipo || response.payload.nombre);
                setEditDescripcion(response.payload.descripcion || '');
            } else {
                setError(response.error || 'No se pudo cargar el equipo');
                setTeam(null);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error de conexión');
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;

        try {
            const response = await backend.teamService.updateTeam(id, { 
                nombreEquipo: editName.trim(),
                descripcion: editDescripcion.trim()
            });
            if (response.ok && response.payload) {
                setTeam(response.payload);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                setIsEditing(false);
                setBackendErrors(null);
                dispatch(actions.updateTeamSuccess(response.payload));
            } else {
                setBackendErrors(response.payload);
            }
        } catch (error) {
            console.error('Error actualizando equipo:', error);
        }
    };

    const handleCopyCode = () => {
        const codigo = team?.codigoEquipo || team?.codigoInvitacion || team?.codigo;
        if (codigo) {
            navigator.clipboard.writeText(codigo);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);
        try {
            const response = await backend.teamService.deleteTeam(id);
            if (response.ok) {
                dispatch(actions.deleteTeamSuccess(parseInt(id)));
                setShowDeleteModal(false);
                setIsSubmitting(false);
                navigate('/');
            } else {
                console.error("Error al eliminar:", response);
                setShowDeleteModal(false);
                setIsSubmitting(false);
                setBackendErrors(response.payload);
            }
        } catch (error) {
            console.error('Error eliminando equipo:', error);
            setShowDeleteModal(false);
            setIsSubmitting(false);
        }
    };

    const handleConfirmLeave = async () => {
        setIsSubmitting(true);
        try {
            const response = await backend.teamService.leaveTeam(id);
            if (response.ok) {
                dispatch(actions.leaveTeamSuccess(parseInt(id)));
                setShowLeaveModal(false);
                setIsSubmitting(false);
                navigate('/');
            } else {
                setShowLeaveModal(false);
                setIsSubmitting(false);
                setBackendErrors(response.payload);
            }
        } catch (error) {
            console.error('Error abandonando equipo:', error);
            setShowLeaveModal(false);
            setIsSubmitting(false);
        }
    };

    const handleConfirmKick = async () => {
        if (!memberToKick) return;
        setIsSubmitting(true);
        try {
            const response = await backend.teamService.kickMember(id, memberToKick.id);
            if (response.ok) {
                // Recargar el equipo para reflejar la expulsión
                await loadTeam();
                setShowKickModal(false);
                setMemberToKick(null);
                setIsSubmitting(false);
            } else {
                setShowKickModal(false);
                setMemberToKick(null);
                setIsSubmitting(false);
                setBackendErrors(response.payload);
            }
        } catch (error) {
            console.error('Error expulsando miembro:', error);
            setShowKickModal(false);
            setMemberToKick(null);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="team-detail-loading">
                <Spinner animation="border" variant="secondary" size="sm" className="mb-2" />
                <p className="small text-muted m-0">
                    <FormattedMessage id="project.teams.Detail.loading" defaultMessage="Cargando equipo..." />
                </p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="team-detail-not-found">
                <i className="fa-regular fa-circle-xmark mb-3"></i>
                <p className="m-0">
                    <FormattedMessage id="project.teams.Detail.notFound" defaultMessage="No se pudo cargar el equipo" />
                </p>
                <p className="small text-muted mt-2">{error || <FormattedMessage id="project.teams.Detail.error.noPermissions" defaultMessage="El equipo no existe o no tienes permisos" />}</p>
                <Link to="/" className="mt-3 text-decoration-none">
                    <Button variant="dark" className="rounded-pill px-4">
                        <FormattedMessage id="project.teams.Detail.backToDashboard" defaultMessage="Volver al dashboard" />
                    </Button>
                </Link>
            </div>
        );
    }

    const isCaptain = user?.id === team.creadorId;
    const isMember = team.miembros?.some(m => m.id === user?.id);
    const codigoEquipo = team.codigoEquipo || team.codigoInvitacion || <FormattedMessage id="project.teams.Detail.codeNotAvailable" defaultMessage="No disponible" />;

    return (
        <Container className="team-detail-container">
            <div className="team-detail-header">
                <Link to="/" className="team-detail-back">
                    <i className="fa-solid fa-arrow-left me-2"></i> <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                </Link>
            </div>

            <div className="team-detail-card">
                {/* Sección 1: Nombre y Descripción */}
                <div className="team-detail-top">
                    {isEditing ? (
                        <Form onSubmit={handleUpdateTeam} className="team-detail-edit-form">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-muted">
                                    <FormattedMessage id="project.teams.Detail.editForm.nameLabel" defaultMessage="Nombre del equipo" />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="team-detail-edit-input"
                                    autoFocus
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-muted">
                                    <FormattedMessage id="project.teams.Detail.editForm.descriptionLabel" defaultMessage="Descripción o lema" />
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={editDescripcion}
                                    onChange={(e) => setEditDescripcion(e.target.value)}
                                    className="team-detail-edit-input"
                                    placeholder={intl.formatMessage({ id: 'project.teams.Detail.editForm.descriptionPlaceholder', defaultMessage: 'Escribe el lema de tu equipo...' })}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button type="submit" className="team-detail-save-btn">
                                    <FormattedMessage id="project.teams.Detail.editForm.save" defaultMessage="Guardar" />
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="light" 
                                    className="team-detail-cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditName(team.nombreEquipo || team.nombre);
                                        setEditDescripcion(team.descripcion || '');
                                    }}
                                >
                                    <FormattedMessage id="project.teams.Detail.editForm.cancel" defaultMessage="Cancelar" />
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <Row className="align-items-start">
                            <Col md={6}>
                                <h1 className="team-detail-name">{team.nombreEquipo || team.nombre}</h1>
                                {isCaptain && (
                                    <Button 
                                        variant="light" 
                                        className="team-detail-edit-btn mt-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="fa-solid fa-pen me-1"></i> <FormattedMessage id="project.teams.Detail.editTeam" defaultMessage="Editar equipo" />
                                    </Button>
                                )}
                            </Col>
                            <Col md={6} className="mt-3 mt-md-0">
                                <div className="team-detail-description">
                                    {team.descripcion ? (
                                        <p className="text-secondary mb-0">{team.descripcion}</p>
                                    ) : (
                                        <p className="text-muted fst-italic mb-0">
                                            <FormattedMessage id="project.teams.Detail.noDescription" defaultMessage="Sin descripción" />
                                        </p>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>

                {/* Sección 2: Código de equipo */}
                <div className="team-detail-code-section">
                    <div className="team-detail-code-header">
                        <span className="team-detail-code-label">
                            <FormattedMessage id="project.teams.Detail.codeLabel" defaultMessage="Código de equipo" />
                        </span>
                        {copied && (
                            <span className="team-detail-code-copied">
                                <i className="fa-regular fa-check-circle me-1"></i> <FormattedMessage id="project.teams.Detail.codeCopied" defaultMessage="¡Copiado!" />
                            </span>
                        )}
                    </div>
                    <div className="team-detail-code-wrapper">
                        <code className="team-detail-code">{codigoEquipo}</code>
                        <Button 
                            variant="light" 
                            className="team-detail-copy-btn"
                            onClick={handleCopyCode}
                        >
                            <i className="fa-regular fa-copy me-1"></i> <FormattedMessage id="project.teams.Detail.copy" defaultMessage="Copiar" />
                        </Button>
                    </div>
                    <p className="team-detail-code-help">
                        <FormattedMessage id="project.teams.Detail.codeHelp" defaultMessage="Comparte este código con tu compañero para que se una al equipo" />
                    </p>
                </div>

                {/* Sección 3: Miembros */}
                <div className="team-detail-bottom">
                    <h5 className="team-detail-members-title">
                        <i className="fa-solid fa-users me-2"></i>
                        <FormattedMessage id="project.teams.Detail.membersTitle" defaultMessage="Miembros ({count})" values={{ count: team.miembros?.length || 0 }} />
                    </h5>

                    <div className="team-detail-members-list">
                        {team.miembros?.map((member) => {
                            const isCaptainMember = member.id === team.creadorId;
                            return (
                                <div
                                    key={member.id}
                                    className={`team-detail-member ${isCaptainMember ? 'captain' : ''}`}
                                >
                                    <ProfileAvatar
                                        imageUrl={member.imagenPerfil}
                                        name={member.nombre}
                                        size={40}
                                        className="team-detail-member-avatar"
                                    />
                                    <div className="team-detail-member-info">
                                        <div className="team-detail-member-name">
                                            {member.nombre}
                                            {isCaptainMember && (
                                                <Badge className="team-detail-captain-badge">
                                                    <i className="fa-solid fa-crown me-1"></i> <FormattedMessage id="project.teams.Detail.captain" defaultMessage="Capitán" />
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="team-detail-member-email">{member.email}</div>
                                    </div>
                                    {isCaptain && !isCaptainMember && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="team-detail-kick-btn"
                                            onClick={() => {
                                                setMemberToKick(member);
                                                setShowKickModal(true);
                                            }}
                                        >
                                            <i className="fa-solid fa-user-minus me-1"></i>
                                            <FormattedMessage id="project.teams.Detail.kickMember" defaultMessage="Expulsar" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                        {(!team.miembros || team.miembros.length === 0) && (
                            <div className="team-detail-no-members">
                                <FormattedMessage id="project.teams.Detail.noMembers" defaultMessage="No hay miembros en este equipo" />
                            </div>
                        )}
                    </div>

                    <div className="team-detail-actions">
                        {isCaptain && (
                            <Button 
                                variant="danger" 
                                className="team-detail-delete-btn"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <i className="fa-regular fa-trash-can me-2"></i>
                                <FormattedMessage id="project.teams.Detail.deleteTeam" defaultMessage="Eliminar equipo" />
                            </Button>
                        )}
                        {!isCaptain && isMember && (
                            <Button 
                                variant="outline-danger" 
                                className="team-detail-leave-btn"
                                onClick={() => setShowLeaveModal(true)}
                            >
                                <i className="fa-regular fa-right-from-bracket me-2"></i>
                                <FormattedMessage id="project.teams.Detail.leaveTeam" defaultMessage="Abandonar equipo" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                show={showDeleteModal}
                onHide={() => !isSubmitting && setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title={<FormattedMessage id="project.teams.Detail.deleteModal.title" defaultMessage="¿Eliminar equipo?" />}
                description={
                    <FormattedMessage
                        id="project.teams.Detail.deleteModal.description"
                        defaultMessage={'¿Estás seguro de que quieres eliminar el equipo "{teamName}"? Esta acción no se puede deshacer.'}
                        values={{ teamName: team.nombreEquipo || team.nombre }}
                    />
                }
                confirmText={<FormattedMessage id="project.teams.Detail.deleteConfirm" defaultMessage="Eliminar" />}
                isSubmitting={isSubmitting}
                variant="danger"
            />

            <ConfirmationModal
                show={showLeaveModal}
                onHide={() => !isSubmitting && setShowLeaveModal(false)}
                onConfirm={handleConfirmLeave}
                title={<FormattedMessage id="project.teams.Detail.leaveModal.title" defaultMessage="¿Abandonar equipo?" />}
                description={
                    <FormattedMessage
                        id="project.teams.Detail.leaveModal.description"
                        defaultMessage={'¿Estás seguro de que quieres abandonar el equipo "{teamName}"?'}
                        values={{ teamName: team.nombreEquipo || team.nombre }}
                    />
                }
                confirmText={<FormattedMessage id="project.teams.Detail.leaveConfirm" defaultMessage="Abandonar" />}
                isSubmitting={isSubmitting}
                variant="danger"
            />

            <ConfirmationModal
                show={showKickModal}
                onHide={() => !isSubmitting && setShowKickModal(false)}
                onConfirm={handleConfirmKick}
                title={<FormattedMessage id="project.teams.Detail.kickModal.title" defaultMessage="¿Expulsar miembro?" />}
                description={
                    <FormattedMessage
                        id="project.teams.Detail.kickModal.description"
                        defaultMessage={'¿Estás seguro de que quieres expulsar a "{memberName}" del equipo? Esta acción no se puede deshacer.'}
                        values={{ memberName: memberToKick?.nombre || '' }}
                    />
                }
                confirmText={<FormattedMessage id="project.teams.Detail.kickConfirm" defaultMessage="Expulsar" />}
                isSubmitting={isSubmitting}
                variant="danger"
            />
        </Container>
    );
};

export default TeamDetail;
