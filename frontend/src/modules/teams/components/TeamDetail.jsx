import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
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
            <Container className="team-detail-loading">
                <div className="team-detail-skeleton">
                    <div className="team-detail-skeleton-line" />
                    <div className="team-detail-skeleton-line" />
                    <div className="team-detail-skeleton-line" />
                    <div className="team-detail-skeleton-line" />
                    <div className="team-detail-skeleton-line" />
                </div>
            </Container>
        );
    }

    if (error || !team) {
        return (
            <div className="team-detail-not-found">
                <i className="fa-regular fa-circle-xmark team-detail-not-found-icon" />
                <p className="team-detail-not-found-title">
                    <FormattedMessage id="project.teams.Detail.notFound" defaultMessage="No se pudo cargar el equipo" />
                </p>
                <p className="team-detail-not-found-sub">
                    {error || <FormattedMessage id="project.teams.Detail.error.noPermissions" defaultMessage="El equipo no existe o no tienes permisos" />}
                </p>
                <Link to="/" className="text-decoration-none">
                    <Button variant="dark" className="rounded-pill px-4">
                        <FormattedMessage id="project.teams.Detail.backToDashboard" defaultMessage="Volver al dashboard" />
                    </Button>
                </Link>
            </div>
        );
    }

    const isCaptain = user?.id === team.creadorId;
    const isMember = team.miembros?.some(m => m.id === user?.id);
    const codigoEquipo = team.codigoEquipo || team.codigoInvitacion || (
        <FormattedMessage id="project.teams.Detail.codeNotAvailable" defaultMessage="No disponible" />
    );
    const memberCount = team.miembros?.length || 0;
    const isActive = team.estado === 'ACTIVO';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '—';
        }
    };

    return (
        <Container className="team-detail-container">
            <div className="team-detail-header">
                <Link to="/" className="team-detail-back">
                    <i className="fa-solid fa-arrow-left" />
                    <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                </Link>
            </div>

            {success && (
                <div className="team-detail-success-toast">
                    <i className="fa-regular fa-circle-check" />
                    <FormattedMessage id="project.teams.Detail.updateSuccess" defaultMessage="Equipo actualizado correctamente" />
                </div>
            )}

            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

            <div className="team-detail-card">
                <div className="team-detail-left">
                    {isEditing ? (
                        <Form onSubmit={handleUpdateTeam} className="team-detail-edit-form">
                            <Form.Group className="mb-3">
                                <Form.Label>
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
                                <Form.Label>
                                    <FormattedMessage id="project.teams.Detail.editForm.descriptionLabel" defaultMessage="Descripción o lema" />
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={editDescripcion}
                                    onChange={(e) => setEditDescripcion(e.target.value)}
                                    className="team-detail-edit-input"
                                    placeholder={intl.formatMessage({
                                        id: 'project.teams.Detail.editForm.descriptionPlaceholder',
                                        defaultMessage: 'Escribe el lema de tu equipo...'
                                    })}
                                />
                            </Form.Group>
                            <div className="team-detail-edit-actions">
                                <Button type="submit" className="team-detail-save-btn">
                                    <i className="fa-regular fa-floppy-disk me-1" />
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
                        <>
                            <div className="team-detail-name-row">
                                <h1 className="team-detail-name">
                                    <span>{team.nombreEquipo || team.nombre}</span>
                                    <span className={`team-detail-status-dot ${isActive ? 'active' : 'inactive'}`} />
                                </h1>
                                {isCaptain && (
                                    <Button
                                        variant="light"
                                        className="team-detail-edit-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="fa-solid fa-pen me-1" />
                                        <FormattedMessage id="project.teams.Detail.editTeam" defaultMessage="Editar" />
                                    </Button>
                                )}
                            </div>

                            <div className="team-detail-meta-row">
                                <span className="team-detail-meta-item">
                                    <i className="fa-regular fa-user" />
                                    <FormattedMessage
                                        id="project.teams.Detail.memberCount"
                                        defaultMessage="{count} {count, plural, one {miembro} other {miembros}}"
                                        values={{ count: memberCount }}
                                    />
                                </span>
                                <span className="team-detail-meta-item">
                                    <i className="fa-regular fa-calendar" />
                                    {formatDate(team.fechaCreacion)}
                                </span>
                                <span className="team-detail-meta-item">
                                    <i className="fa-regular fa-hashtag" />
                                    <FormattedMessage
                                        id="project.teams.Detail.teamId"
                                        defaultMessage="ID {id}"
                                        values={{ id: team.id }}
                                    />
                                </span>
                                <span className="team-detail-meta-item">
                                    {isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="team-detail-description">
                                {team.descripcion ? (
                                    <p>{team.descripcion}</p>
                                ) : (
                                    <p className="team-detail-no-description">
                                        <FormattedMessage id="project.teams.Detail.noDescription" defaultMessage="Sin descripción" />
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="team-detail-stats-group">
                        <div className="team-detail-stat-box">
                            <i className="fa-solid fa-users team-detail-stat-icon" />
                            <span className="team-detail-stat-value">{memberCount}</span>
                            <span className="team-detail-stat-label">
                                <FormattedMessage id="project.teams.Detail.members" defaultMessage="Miembros" />
                            </span>
                        </div>
                        <div className="team-detail-stat-box">
                            <i className="fa-solid fa-trophy team-detail-stat-icon" />
                            <span className="team-detail-stat-value">—</span>
                            <span className="team-detail-stat-label">
                                <FormattedMessage id="project.teams.Detail.partidas" defaultMessage="Partidas" />
                            </span>
                        </div>
                        <div className="team-detail-stat-box">
                            <i className="fa-regular fa-calendar-check team-detail-stat-icon" />
                            <span className="team-detail-stat-value">{formatDate(team.fechaCreacion)}</span>
                            <span className="team-detail-stat-label">
                                <FormattedMessage id="project.teams.Detail.created" defaultMessage="Creado" />
                            </span>
                        </div>
                    </div>

                    <div className="team-detail-code-box">
                        <div className="team-detail-code-header">
                            <span className="team-detail-code-label">
                                <i className="fa-solid fa-key" />
                                <FormattedMessage id="project.teams.Detail.codeLabel" defaultMessage="Código de invitación" />
                            </span>
                            {copied && (
                                <span className="team-detail-code-copied">
                                    <i className="fa-regular fa-check-circle" />
                                    <FormattedMessage id="project.teams.Detail.codeCopied" defaultMessage="¡Copiado!" />
                                </span>
                            )}
                        </div>
                        <div className="team-detail-code-display">
                            <code className="team-detail-code">{codigoEquipo}</code>
                            <Button variant="light" className="team-detail-copy-btn" onClick={handleCopyCode}>
                                <i className="fa-regular fa-copy me-1" />
                                <FormattedMessage id="project.teams.Detail.copy" defaultMessage="Copiar" />
                            </Button>
                        </div>
                        <p className="team-detail-code-help">
                            <i className="fa-regular fa-circle-info" />
                            <FormattedMessage id="project.teams.Detail.codeHelp" defaultMessage="Comparte este código para que otros se unan al equipo" />
                        </p>
                    </div>
                </div>

                <div className="team-detail-right">
                    <div className="team-detail-right-header">
                        <h5 className="team-detail-members-title">
                            <i className="fa-solid fa-users" />
                            <FormattedMessage id="project.teams.Detail.membersTitle" defaultMessage="Miembros" />
                        </h5>
                    </div>

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
                                        <div className="team-detail-member-name-row">
                                            <span className="team-detail-member-name">{member.nombre}</span>
                                            {member.elo != null && (
                                                <span className={`team-detail-elo-badge ${member.elo >= 1500 ? 'high' : ''}`}>
                                                    <i className="fa-solid fa-bolt" />
                                                    {member.elo}{member.eloProvisional && <span style={{ fontSize: '0.5rem', opacity: 0.6 }}>*</span>}
                                                </span>
                                            )}
                                            {isCaptainMember && (
                                                <span className="team-detail-captain-badge">
                                                    <i className="fa-solid fa-crown" />
                                                    <FormattedMessage id="project.teams.Detail.captain" defaultMessage="Capitán" />
                                                </span>
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
                                            <i className="fa-solid fa-user-minus" />
                                            <FormattedMessage id="project.teams.Detail.kickMember" defaultMessage="Expulsar" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                        {memberCount === 0 && (
                            <div className="team-detail-no-members">
                                <i className="fa-regular fa-user-slash mb-2" style={{ fontSize: '1.3rem', display: 'block' }} />
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
                                <i className="fa-regular fa-trash-can" />
                                <FormattedMessage id="project.teams.Detail.deleteTeam" defaultMessage="Eliminar equipo" />
                            </Button>
                        )}
                        {!isCaptain && isMember && (
                            <Button
                                variant="outline-danger"
                                className="team-detail-leave-btn"
                                onClick={() => setShowLeaveModal(true)}
                            >
                                <i className="fa-regular fa-right-from-bracket" />
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
