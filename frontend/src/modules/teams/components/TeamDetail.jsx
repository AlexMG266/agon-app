import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
        <div className="td-team-container">
            <Container style={{ maxWidth: '1000px' }}>
                <div className="td-team-header">
                    <Link to="/" className="td-team-back">
                        <i className="fa-solid fa-arrow-left" />
                        <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                    </Link>
                </div>

                {success && (
                    <div className="td-team-success-toast">
                        <i className="fa-regular fa-circle-check" />
                        <FormattedMessage id="project.teams.Detail.updateSuccess" defaultMessage="Equipo actualizado correctamente" />
                    </div>
                )}

                <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                <Row className="g-4">
                    {/*
                     * ========================================
                     * LEFT COLUMN — shield + name + meta
                     * ========================================
                     */}
                    <Col lg={4} className="text-center d-flex flex-column align-items-center">
                        <div className="td-team-image-container">
                            <i className="fa-solid fa-shield-halved" />
                        </div>
                        <h2 className="td-team-display-name mt-3">
                            {team.nombreEquipo || team.nombre}
                            <span className={`td-team-status-dot ms-2 ${isActive ? 'active' : 'inactive'}`} />
                        </h2>
                        <p className="td-team-email-text">
                            <FormattedMessage
                                id="project.teams.Detail.memberCount"
                                defaultMessage="{count} {count, plural, one {miembro} other {miembros}}"
                                values={{ count: memberCount }}
                            />
                        </p>
                        <div className="td-team-meta-list">
                            <div className="td-team-meta-item">
                                <i className="fa-regular fa-calendar" />
                                <span>{formatDate(team.fechaCreacion)}</span>
                            </div>
                            <div className="td-team-meta-item">
                                <i className="fa-regular fa-hashtag" />
                                <FormattedMessage id="project.teams.Detail.teamId" defaultMessage="ID {id}" values={{ id: team.id }} />
                            </div>
                            <div className="td-team-meta-item">
                                {isActive ? (
                                    <><i className="fa-solid fa-circle" style={{ color: '#34c759', fontSize: '0.5rem' }} />
                                        <FormattedMessage id="project.teams.Detail.active" defaultMessage="Activo" /></>
                                ) : (
                                    <><i className="fa-solid fa-circle" style={{ color: '#aeaeb2', fontSize: '0.5rem' }} />
                                        <FormattedMessage id="project.teams.Detail.inactive" defaultMessage="Inactivo" /></>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/*
                     * ========================================
                     * RIGHT COLUMN — stats + sections
                     * ========================================
                     */}
                    <Col lg={8}>
                        {/*
                         * STATS ROW
                         */}
                        <div className="td-team-stats-row">
                            <div className="td-team-stat-item">
                                <span className="td-team-stat-icon">
                                    <i className="fa-solid fa-users" />
                                </span>
                                <div>
                                    <div className="td-team-stat-label">
                                        <FormattedMessage id="project.teams.Detail.members" defaultMessage="Miembros" />
                                    </div>
                                    <div className="td-team-stat-value">{memberCount}</div>
                                </div>
                            </div>
                            <div className="td-team-stat-item">
                                <span className="td-team-stat-icon">
                                    <i className="fa-solid fa-trophy" />
                                </span>
                                <div>
                                    <div className="td-team-stat-label">
                                        <FormattedMessage id="project.teams.Detail.partidas" defaultMessage="Partidas" />
                                    </div>
                                    <div className="td-team-stat-value">—</div>
                                </div>
                            </div>
                            <div className="td-team-stat-item">
                                <span className="td-team-stat-icon">
                                    <i className="fa-regular fa-calendar-check" />
                                </span>
                                <div>
                                    <div className="td-team-stat-label">
                                        <FormattedMessage id="project.teams.Detail.created" defaultMessage="Creado" />
                                    </div>
                                    <div className="td-team-stat-value">{formatDate(team.fechaCreacion)}</div>
                                </div>
                            </div>
                        </div>

                        {/*
                         * INFO ROW: Descripción / Editar equipo
                         */}
                        <div className="td-team-info-row">
                            <div className="td-team-info-label">
                                <FormattedMessage id="project.teams.Detail.descriptionSection" defaultMessage="Descripción" />
                                {isCaptain && !isEditing && (
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="td-team-section-edit-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="fa-solid fa-pen" />
                                    </Button>
                                )}
                            </div>
                            <div className="td-team-info-value">
                                {isEditing ? (
                                    <Form onSubmit={handleUpdateTeam} className="td-team-edit-form">
                                        <Form.Group className="mb-3">
                                            <Form.Label className="td-team-form-label">
                                                <FormattedMessage id="project.teams.Detail.editForm.nameLabel" defaultMessage="Nombre del equipo" />
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="td-team-form-control"
                                                autoFocus
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="td-team-form-label">
                                                <FormattedMessage id="project.teams.Detail.editForm.descriptionLabel" defaultMessage="Descripción o lema" />
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={editDescripcion}
                                                onChange={(e) => setEditDescripcion(e.target.value)}
                                                className="td-team-form-control"
                                                placeholder={intl.formatMessage({
                                                    id: 'project.teams.Detail.editForm.descriptionPlaceholder',
                                                    defaultMessage: 'Escribe el lema de tu equipo...'
                                                })}
                                            />
                                        </Form.Group>
                                        <div className="td-team-edit-actions">
                                            <Button type="submit" className="td-team-save-btn">
                                                <i className="fa-regular fa-floppy-disk me-1" />
                                                <FormattedMessage id="project.teams.Detail.editForm.save" defaultMessage="Guardar" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="light"
                                                className="td-team-cancel-btn"
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
                                    <p className={`td-team-section-text ${!team.descripcion ? 'td-team-section-text--empty' : ''}`}>
                                        {team.descripcion || (
                                            <FormattedMessage id="project.teams.Detail.noDescription" defaultMessage="Sin descripción" />
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/*
                         * INFO ROW: Código de invitación
                         */}
                        <div className="td-team-info-row">
                            <div className="td-team-info-label">
                                <FormattedMessage id="project.teams.Detail.codeLabel" defaultMessage="Código de invitación" />
                            </div>
                            <div className="td-team-info-value">
                                <div className="td-team-code-area">
                                    <code className="td-team-code">{codigoEquipo}</code>
                                    <Button
                                        variant="light"
                                        className="td-team-copy-btn"
                                        onClick={handleCopyCode}
                                    >
                                        {copied ? (
                                            <><i className="fa-regular fa-check-circle" /> <FormattedMessage id="project.teams.Detail.codeCopied" defaultMessage="¡Copiado!" /></>
                                        ) : (
                                            <><i className="fa-regular fa-copy" /> <FormattedMessage id="project.teams.Detail.copy" defaultMessage="Copiar" /></>
                                        )}
                                    </Button>
                                </div>
                                <p className="td-team-code-help">
                                    <i className="fa-regular fa-circle-info" />
                                    <FormattedMessage id="project.teams.Detail.codeHelp" defaultMessage="Comparte este código para que otros se unan al equipo" />
                                </p>
                            </div>
                        </div>

                        {/*
                         * SECTION: Miembros
                         */}
                        <div className="td-team-section">
                            <h3 className="td-team-section-title">
                                <FormattedMessage id="project.teams.Detail.membersTitle" defaultMessage="Miembros" />
                                <span className="td-team-section-badge">{memberCount}</span>
                            </h3>
                            <div className="td-team-members-list">
                                {team.miembros?.map((member) => {
                                    const isTeamCaptain = member.id === team.creadorId;
                                    return (
                                        <div
                                            key={member.id}
                                            className={`td-team-member ${isTeamCaptain ? 'captain' : ''}`}
                                        >
                                            <ProfileAvatar
                                                imageUrl={member.imagenPerfil}
                                                name={member.nombre}
                                                size={40}
                                                className="td-team-member-avatar"
                                            />
                                            <div className="td-team-member-info">
                                                <div className="td-team-member-name-row">
                                                    <span className="td-team-member-name">{member.nombre}</span>
                                                    {member.elo != null && (
                                                        <span className={`td-team-elo-badge ${member.elo >= 1500 ? 'high' : ''}`}>
                                                            <i className="fa-solid fa-bolt" />
                                                            {member.elo}{member.eloProvisional && <span style={{ fontSize: '0.5rem', opacity: 0.6 }}>*</span>}
                                                        </span>
                                                    )}
                                                    {isTeamCaptain && (
                                                        <span className="td-team-captain-badge">
                                                            <i className="fa-solid fa-crown" />
                                                            <FormattedMessage id="project.teams.Detail.captain" defaultMessage="Capitán" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="td-team-member-email">{member.email}</div>
                                            </div>
                                            {isCaptain && !isTeamCaptain && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="td-team-kick-btn"
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
                                    <div className="td-team-no-members">
                                        <i className="fa-regular fa-user-slash" />
                                        <FormattedMessage id="project.teams.Detail.noMembers" defaultMessage="No hay miembros en este equipo" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/*
                         * ACCIONES
                         */}
                        {(isCaptain || isMember) && (
                            <div className="td-team-actions-row">
                                {isCaptain && (
                                    <Button
                                        variant="danger"
                                        className="td-team-delete-btn"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <i className="fa-regular fa-trash-can" />
                                        <FormattedMessage id="project.teams.Detail.deleteTeam" defaultMessage="Eliminar equipo" />
                                    </Button>
                                )}
                                {!isCaptain && isMember && (
                                    <Button
                                        variant="outline-danger"
                                        className="td-team-leave-btn"
                                        onClick={() => setShowLeaveModal(true)}
                                    >
                                        <i className="fa-regular fa-right-from-bracket" />
                                        <FormattedMessage id="project.teams.Detail.leaveTeam" defaultMessage="Abandonar equipo" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

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
        </div>
    );
};

export default TeamDetail;
