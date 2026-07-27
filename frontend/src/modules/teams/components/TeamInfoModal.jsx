import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import ProfileAvatar from '../../common/components/ProfileAvatar';
import backend from '../../../backend';

const TeamInfoModal = ({ show, equipoId, onHide }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && equipoId) {
            loadTeam(equipoId);
        } else {
            setTeam(null);
        }
    }, [show, equipoId]);

    const loadTeam = async (id) => {
        setLoading(true);
        try {
            const response = await backend.teamService.getTeam(id);
            if (response.ok && response.payload) {
                setTeam(response.payload);
            } else {
                setTeam(null);
            }
        } catch (err) {
            console.error('Error cargando equipo:', err);
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '\u2014';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '\u2014';
        }
    };

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
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="secondary" size="sm" className="mb-2" />
                        <p className="small text-muted m-0">
                            <FormattedMessage id="project.teams.Detail.loading" defaultMessage="Cargando equipo..." />
                        </p>
                    </div>
                ) : !team ? (
                    <div className="text-center py-4">
                        <i className="fa-regular fa-circle-xmark text-muted mb-2" style={{ fontSize: '2rem' }} />
                        <p className="small text-muted m-0">
                            <FormattedMessage id="project.teams.Detail.notFound" defaultMessage="No se pudo cargar el equipo" />
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Cabecera del equipo */}
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: '#f5f5f7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.3rem',
                                    color: '#86868b',
                                    flexShrink: 0
                                }}
                            >
                                <i className="fa-solid fa-shield-halved" />
                            </div>
                            <div className="min-w-0">
                                <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                                    {team.nombreEquipo || team.nombre}
                                    <span
                                        className="ms-2"
                                        style={{
                                            display: 'inline-block',
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: team.estado === 'ACTIVO' ? '#34c759' : '#aeaeb2'
                                        }}
                                    />
                                </h5>
                                <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.8rem' }}>
                                    <span>
                                        <i className="fa-regular fa-calendar me-1" style={{ fontSize: '0.7rem' }} />
                                        {formatDate(team.fechaCreacion)}
                                    </span>
                                    <span>·</span>
                                    <span>
                                        <FormattedMessage
                                            id="project.teams.Detail.memberCount"
                                            defaultMessage="{count} {count, plural, one {miembro} other {miembros}}"
                                            values={{ count: team.miembros?.length || 0 }}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Descripcion */}
                        <div className="mb-3">
                            <div
                                className="text-secondary"
                                style={{
                                    fontSize: '0.82rem',
                                    lineHeight: 1.5,
                                    background: '#f5f5f7',
                                    borderRadius: 10,
                                    padding: '10px 14px'
                                }}
                            >
                                {team.descripcion || (
                                    <span className="text-muted">
                                        <FormattedMessage id="project.teams.Detail.noDescription" defaultMessage="Sin descripci\u00f3n" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Miembros */}
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
                                    <FormattedMessage id="project.teams.Detail.membersTitle" defaultMessage="Miembros" />
                                </span>
                                <span
                                    className="badge rounded-pill"
                                    style={{ background: '#f5f5f7', color: '#86868b', fontSize: '0.75rem', fontWeight: 500 }}
                                >
                                    {team.miembros?.length || 0}
                                </span>
                            </div>
                            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                {team.miembros?.map((member) => {
                                    const isCaptain = member.id === team.creadorId;
                                    return (
                                        <div
                                            key={member.id}
                                            className="d-flex align-items-center gap-2 py-2 px-2 rounded-3"
                                            style={{
                                                background: isCaptain ? 'rgba(0, 113, 227, 0.06)' : 'transparent'
                                            }}
                                        >
                                            <ProfileAvatar
                                                imageUrl={member.imagenPerfil}
                                                name={member.nombre}
                                                size={32}
                                            />
                                            <div className="min-w-0 flex-grow-1">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span
                                                        className="fw-medium text-dark"
                                                        style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                    >
                                                        {member.nombre}
                                                    </span>
                                                    {isCaptain && (
                                                        <span
                                                            className="badge rounded-pill"
                                                            style={{
                                                                background: '#0071e3',
                                                                color: '#fff',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 500,
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-crown me-1" style={{ fontSize: '0.6rem' }} />
                                                            <FormattedMessage id="project.teams.Detail.captain" defaultMessage="Capit\u00e1n" />
                                                        </span>
                                                    )}
                                                </div>
                                                {member.elo != null && (
                                                    <span
                                                        className="d-inline-flex align-items-center gap-1"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: member.elo >= 1500 ? '#ff9500' : '#86868b',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-bolt" style={{ fontSize: '0.6rem' }} />
                                                        {member.elo}{member.eloProvisional && '*'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!team.miembros || team.miembros.length === 0) && (
                                    <div className="text-center text-muted py-3" style={{ fontSize: '0.82rem' }}>
                                        <i className="fa-regular fa-user-slash me-1" />
                                        <FormattedMessage id="project.teams.Detail.noMembers" defaultMessage="No hay miembros en este equipo" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Boton cerrar */}
                        <div className="text-center mt-3">
                            <button
                                onClick={onHide}
                                className="btn rounded-pill px-4 fw-medium"
                                style={{
                                    fontSize: '0.85rem',
                                    background: '#f5f5f7',
                                    color: '#1d1d1f',
                                    border: '1px solid #d2d2d7'
                                }}
                            >
                                <FormattedMessage id="project.common.ConfirmationModal.cancel" defaultMessage="Cerrar" />
                            </button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default TeamInfoModal;
