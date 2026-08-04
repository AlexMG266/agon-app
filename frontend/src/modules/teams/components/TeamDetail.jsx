import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router';
import { FormattedMessage } from 'react-intl';
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
    const user = useSelector(state => state.users?.user);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendErrors, setBackendErrors] = useState(null);
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
            <div className="td-loading">
                <div className="td-skeleton">
                    <div className="td-skeleton-line" />
                    <div className="td-skeleton-line" />
                    <div className="td-skeleton-line" />
                    <div className="td-skeleton-line" />
                    <div className="td-skeleton-line" />
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="td-not-found">
                <i className="fa-regular fa-circle-xmark td-not-found-icon" />
                <p className="td-not-found-title">
                    <FormattedMessage id="project.teams.Detail.notFound" defaultMessage="No se pudo cargar el equipo" />
                </p>
                <p className="td-not-found-sub">
                    {error || <FormattedMessage id="project.teams.Detail.error.noPermissions" defaultMessage="El equipo no existe o no tienes permisos" />}
                </p>
                <Link to="/" className="td-back-link">
                    <FormattedMessage id="project.teams.Detail.backToDashboard" defaultMessage="Volver al dashboard" />
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
        <div className="td-container">
            <div className="td-header">
                <Link to="/" className="td-back">
                    <i className="fa-solid fa-arrow-left" />
                    <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                </Link>
            </div>

            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

            <div className="td-hero">
                <div className="td-hero-shield">
                    <i className="fa-solid fa-shield-halved" />
                </div>
                <div className="td-hero-info">
                    <h2 className="td-hero-name">
                        {team.nombreEquipo || team.nombre}
                        <span className={`td-hero-dot ${isActive ? 'active' : 'inactive'}`} />
                    </h2>
                    <p className="td-hero-meta">
                        <FormattedMessage
                            id="project.teams.Detail.memberCount"
                            defaultMessage="{count} {count, plural, one {miembro} other {miembros}}"
                            values={{ count: memberCount }}
                        />
                    </p>
                    <div className="td-hero-meta-list">
                        <span className="td-hero-meta-item">
                            <i className="fa-regular fa-calendar" />
                            {formatDate(team.fechaCreacion)}
                        </span>
                        <span className="td-hero-meta-sep">·</span>
                        <span className="td-hero-meta-item">
                            <i className="fa-regular fa-hashtag" />
                            <FormattedMessage id="project.teams.Detail.teamId" defaultMessage="ID {id}" values={{ id: team.id }} />
                        </span>
                        <span className="td-hero-meta-sep">·</span>
                        <span className="td-hero-meta-item">
                            {isActive ? (
                                <><i className="fa-solid fa-circle" style={{ color: '#34c759', fontSize: '0.5rem' }} /> Activo</>
                            ) : (
                                <><i className="fa-solid fa-circle" style={{ color: '#aeaeb2', fontSize: '0.5rem' }} /> Inactivo</>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="td-stats">
                <div className="td-stat">
                    <span className="td-stat-icon"><i className="fa-solid fa-users" /></span>
                    <div className="td-stat-body">
                        <span className="td-stat-label"><FormattedMessage id="project.teams.Detail.members" defaultMessage="Miembros" /></span>
                        <span className="td-stat-value">{memberCount}</span>
                    </div>
                </div>
                <div className="td-stat">
                    <span className="td-stat-icon"><i className="fa-solid fa-trophy" /></span>
                    <div className="td-stat-body">
                        <span className="td-stat-label"><FormattedMessage id="project.teams.Detail.partidas" defaultMessage="Partidas" /></span>
                        <span className="td-stat-value">—</span>
                    </div>
                </div>
                <div className="td-stat">
                    <span className="td-stat-icon"><i className="fa-regular fa-calendar-check" /></span>
                    <div className="td-stat-body">
                        <span className="td-stat-label"><FormattedMessage id="project.teams.Detail.created" defaultMessage="Creado" /></span>
                        <span className="td-stat-value">{formatDate(team.fechaCreacion)}</span>
                    </div>
                </div>
            </div>

            <div className="td-section">
                <div className="td-section-header">
                    <span className="td-section-title">
                        <FormattedMessage id="project.teams.Detail.descriptionSection" defaultMessage="Descripción" />
                    </span>
                </div>
                <div className="td-section-body">
                    <p className={`td-desc ${!team.descripcion ? 'td-desc--empty' : ''}`}>
                        {team.descripcion || (
                            <FormattedMessage id="project.teams.Detail.noDescription" defaultMessage="Sin descripción" />
                        )}
                    </p>
                </div>
            </div>

            <div className="td-section">
                <div className="td-section-header">
                    <span className="td-section-title">
                        <FormattedMessage id="project.teams.Detail.codeLabel" defaultMessage="Código de invitación" />
                    </span>
                </div>
                <div className="td-section-body">
                    <div className="td-code-area">
                        <code className="td-code">{codigoEquipo}</code>
                        <button
                            type="button"
                            className="td-copy-btn"
                            onClick={handleCopyCode}
                        >
                            {copied ? (
                                <><i className="fa-regular fa-check-circle" /> <FormattedMessage id="project.teams.Detail.codeCopied" defaultMessage="¡Copiado!" /></>
                            ) : (
                                <><i className="fa-regular fa-copy" /> <FormattedMessage id="project.teams.Detail.copy" defaultMessage="Copiar" /></>
                            )}
                        </button>
                    </div>
                    <p className="td-code-help">
                        <i className="fa-regular fa-circle-info" />
                        <FormattedMessage id="project.teams.Detail.codeHelp" defaultMessage="Comparte este código para que otros se unan al equipo" />
                    </p>
                </div>
            </div>

            <div className="td-section">
                <div className="td-section-header">
                    <span className="td-section-title">
                        <FormattedMessage id="project.teams.Detail.membersTitle" defaultMessage="Miembros" />
                    </span>
                    <span className="td-section-badge">{memberCount}</span>
                </div>
                <div className="td-section-body">
                    <div className="td-members">
                        {team.miembros?.map((member) => {
                            const isTeamCaptain = member.id === team.creadorId;
                            return (
                                <div
                                    key={member.id}
                                    className={`td-member ${isTeamCaptain ? 'captain' : ''}`}
                                >
                                    <ProfileAvatar
                                        imageUrl={member.imagenPerfil}
                                        name={member.nombre}
                                        size={40}
                                        className="td-member-avatar"
                                    />
                                    <div className="td-member-info">
                                        <div className="td-member-name-row">
                                            <span className="td-member-name">{member.nombre}</span>
                                            {member.elo != null && (
                                                <span className={`td-elo ${member.elo >= 1500 ? 'high' : ''}`}>
                                                    <i className="fa-solid fa-bolt" />
                                                    {member.elo}{member.eloProvisional && <span className="td-elo-provisional">?</span>}
                                                </span>
                                            )}
                                            {isTeamCaptain && (
                                                <span className="td-captain-badge">
                                                    <i className="fa-solid fa-crown" />
                                                    <FormattedMessage id="project.teams.Detail.captain" defaultMessage="Capitán" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="td-member-email">{member.email}</div>
                                    </div>
                                    {isCaptain && !isTeamCaptain && (
                                        <button
                                            type="button"
                                            className="td-kick-btn"
                                            onClick={() => {
                                                setMemberToKick(member);
                                                setShowKickModal(true);
                                            }}
                                        >
                                            <i className="fa-solid fa-user-minus" />
                                            <FormattedMessage id="project.teams.Detail.kickMember" defaultMessage="Expulsar" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {memberCount === 0 && (
                            <div className="td-no-members">
                                <i className="fa-regular fa-user-slash" />
                                <FormattedMessage id="project.teams.Detail.noMembers" defaultMessage="No hay miembros en este equipo" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(isCaptain || isMember) && (
                <div className="td-actions">
                    {isCaptain && (
                        <button
                            type="button"
                            className="td-delete-btn"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <i className="fa-regular fa-trash-can" />
                            <FormattedMessage id="project.teams.Detail.deleteTeam" defaultMessage="Eliminar equipo" />
                        </button>
                    )}
                    {!isCaptain && isMember && (
                        <button
                            type="button"
                            className="td-leave-btn"
                            onClick={() => setShowLeaveModal(true)}
                        >
                            <i className="fa-regular fa-right-from-bracket" />
                            <FormattedMessage id="project.teams.Detail.leaveTeam" defaultMessage="Abandonar equipo" />
                        </button>
                    )}
                </div>
            )}

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
