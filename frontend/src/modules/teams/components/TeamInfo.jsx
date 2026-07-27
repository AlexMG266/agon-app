import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import ProfileAvatar from '../../common/components/ProfileAvatar';
import backend from '../../../backend';
import './TeamDetail.css';

const TeamInfo = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Error de conexión');
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="td-loading">
                <div className="text-center text-muted py-5">
                    <Spinner animation="border" variant="secondary" className="mb-3" />
                    <p className="small m-0">
                        <FormattedMessage id="project.teams.Detail.loading" defaultMessage="Cargando equipo..." />
                    </p>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="td-container">
                <div className="td-header">
                    <Link to="/users/notifications" className="td-back">
                        <i className="fa-solid fa-arrow-left" />
                        <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                    </Link>
                </div>
                <div className="td-not-found">
                    <i className="fa-regular fa-circle-xmark td-not-found-icon" />
                    <p className="td-not-found-title">
                        <FormattedMessage id="project.teams.Detail.notFound" defaultMessage="No se pudo cargar el equipo" />
                    </p>
                    <p className="td-not-found-sub">
                        {error || <FormattedMessage id="project.teams.Detail.error.noPermissions" defaultMessage="El equipo no existe o no tienes permisos" />}
                    </p>
                </div>
            </div>
        );
    }

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
                <Link to="/users/notifications" className="td-back">
                    <i className="fa-solid fa-arrow-left" />
                    <FormattedMessage id="project.teams.Detail.back" defaultMessage="Volver" />
                </Link>
            </div>

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
                            {isActive ? (
                                <><i className="fa-solid fa-circle" style={{ color: '#34c759', fontSize: '0.5rem' }} /> Activo</>
                            ) : (
                                <><i className="fa-solid fa-circle" style={{ color: '#aeaeb2', fontSize: '0.5rem' }} /> Inactivo</>
                            )}
                        </span>
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
                                                    {member.elo}{member.eloProvisional && <span className="td-elo-provisional">*</span>}
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
        </div>
    );
};

export default TeamInfo;
