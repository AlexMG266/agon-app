import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router';
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

    if (loading) {
        return (
            <div className="team-detail-loading">
                <Spinner animation="border" variant="secondary" size="sm" className="mb-2" />
                <p className="small text-muted m-0">Cargando equipo...</p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="team-detail-not-found">
                <i className="fa-regular fa-circle-xmark mb-3"></i>
                <p className="m-0">No se pudo cargar el equipo</p>
                <p className="small text-muted mt-2">{error || 'El equipo no existe o no tienes permisos'}</p>
                <Link to="/" className="mt-3 text-decoration-none">
                    <Button variant="dark" className="rounded-pill px-4">
                        Volver al dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    const isCaptain = user?.id === team.creadorId;
    const isMember = team.miembros?.some(m => m.id === user?.id);
    const codigoEquipo = team.codigoEquipo || team.codigoInvitacion || 'No disponible';

    return (
        <Container className="team-detail-container">
            <div className="team-detail-header">
                <Link to="/" className="team-detail-back">
                    <i className="fa-solid fa-arrow-left me-2"></i> Volver
                </Link>
            </div>

            <div className="team-detail-card">
                {/* Sección 1: Nombre y Descripción */}
                <div className="team-detail-top">
                    {isEditing ? (
                        <Form onSubmit={handleUpdateTeam} className="team-detail-edit-form">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small text-muted">Nombre del equipo</Form.Label>
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
                                <Form.Label className="fw-semibold small text-muted">Descripción o lema</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={editDescripcion}
                                    onChange={(e) => setEditDescripcion(e.target.value)}
                                    className="team-detail-edit-input"
                                    placeholder="Escribe el lema de tu equipo..."
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button type="submit" className="team-detail-save-btn">
                                    Guardar
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
                                    Cancelar
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
                                        <i className="fa-solid fa-pen me-1"></i> Editar equipo
                                    </Button>
                                )}
                            </Col>
                            <Col md={6} className="mt-3 mt-md-0">
                                <div className="team-detail-description">
                                    {team.descripcion ? (
                                        <p className="text-secondary mb-0">{team.descripcion}</p>
                                    ) : (
                                        <p className="text-muted fst-italic mb-0">Sin descripción</p>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>

                {/* Sección 2: Código de equipo */}
                <div className="team-detail-code-section">
                    <div className="team-detail-code-header">
                        <span className="team-detail-code-label">Código de equipo</span>
                        {copied && (
                            <span className="team-detail-code-copied">
                                <i className="fa-regular fa-check-circle me-1"></i> ¡Copiado!
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
                            <i className="fa-regular fa-copy me-1"></i> Copiar
                        </Button>
                    </div>
                    <p className="team-detail-code-help">
                        Comparte este código con tu compañero para que se una al equipo
                    </p>
                </div>

                {/* Sección 3: Miembros */}
                <div className="team-detail-bottom">
                    <h5 className="team-detail-members-title">
                        <i className="fa-solid fa-users me-2"></i>
                        Miembros ({team.miembros?.length || 0})
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
                                                    <i className="fa-solid fa-crown me-1"></i> Capitán
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="team-detail-member-email">{member.email}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!team.miembros || team.miembros.length === 0) && (
                            <div className="team-detail-no-members">
                                No hay miembros en este equipo
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
                                Eliminar equipo
                            </Button>
                        )}
                        {!isCaptain && isMember && (
                            <Button 
                                variant="outline-danger" 
                                className="team-detail-leave-btn"
                                onClick={() => setShowLeaveModal(true)}
                            >
                                <i className="fa-regular fa-right-from-bracket me-2"></i>
                                Abandonar equipo
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                show={showDeleteModal}
                onHide={() => !isSubmitting && setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar equipo?"
                description={`¿Estás seguro de que quieres eliminar el equipo "${team.nombreEquipo || team.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isSubmitting={isSubmitting}
                variant="danger"
            />

            <ConfirmationModal
                show={showLeaveModal}
                onHide={() => !isSubmitting && setShowLeaveModal(false)}
                onConfirm={handleConfirmLeave}
                title="¿Abandonar equipo?"
                description={`¿Estás seguro de que quieres abandonar el equipo "${team.nombreEquipo || team.nombre}"?`}
                confirmText="Abandonar"
                isSubmitting={isSubmitting}
                variant="danger"
            />
        </Container>
    );
};

export default TeamDetail;