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
    const [backendErrors, setBackendErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;

        try {
            const response = await backend.teamService.updateTeam(id, { nombreEquipo: editName.trim() });
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
        const codigo = team?.codigoInvitacion || team?.codigo;
        if (codigo) {
            navigator.clipboard.writeText(codigo);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) return;

        try {
            const response = await backend.teamService.deleteTeam(id);
            if (response.ok) {
                dispatch(actions.deleteTeamSuccess(parseInt(id)));
                navigate('/');
            }
        } catch (error) {
            console.error('Error eliminando equipo:', error);
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm('¿Estás seguro de que quieres abandonar este equipo?')) return;

        try {
            const response = await backend.teamService.leaveTeam(id);
            if (response.ok) {
                dispatch(actions.leaveTeamSuccess(parseInt(id)));
                navigate('/');
            }
        } catch (error) {
            console.error('Error abandonando equipo:', error);
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

    const isCaptain = user?.id === team.capitan?.id;
    const isMember = team.miembros?.some(m => m.id === user?.id);
    const codigoEquipo = team.codigoEquipo || 'No disponible';

    return (
        <Container className="team-detail-container">
            <div className="team-detail-header">
                <Link to="/" className="team-detail-back">
                    <i className="fa-solid fa-arrow-left me-2"></i> Volver
                </Link>
            </div>

            <div className="team-detail-card">
                <div className="team-detail-top">
                    <div className="team-detail-title-section">
                        {isEditing ? (
                            <Form onSubmit={handleUpdateName} className="team-detail-edit-form">
                                <Form.Control
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="team-detail-edit-input"
                                    autoFocus
                                    required
                                />
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
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </Form>
                        ) : (
                            <>
                                <h1 className="team-detail-name">{team.nombreEquipo || team.nombre}</h1>
                                {isCaptain && (
                                    <Button 
                                        variant="light" 
                                        className="team-detail-edit-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="fa-solid fa-pen me-1"></i> Editar
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {success && (
                        <div className="team-detail-success">
                            Equipo actualizado correctamente
                        </div>
                    )}
                    <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

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
                </div>

                <div className="team-detail-bottom">
                    <Row className="g-4">
                        <Col md={6}>
                            <div className="team-detail-section">
                                <h5 className="team-detail-section-title">
                                    <i className="fa-solid fa-crown me-2" style={{ color: '#ffb800' }}></i>
                                    Capitán
                                </h5>
                                <div className="team-detail-member captain">
                                    <div className="team-detail-member-avatar">
                                        {team.capitan?.nombre?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="team-detail-member-name">{team.capitan?.nombre}</div>
                                        <div className="team-detail-member-email">{team.capitan?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="team-detail-section">
                                <h5 className="team-detail-section-title">
                                    <i className="fa-solid fa-users me-2"></i>
                                    Miembros ({team.miembros?.length || 0})
                                </h5>
                                <div className="team-detail-members-list">
                                    {team.miembros?.map((member) => (
                                        <div key={member.id} className="team-detail-member">
                                            <div className="team-detail-member-avatar">
                                                {member.nombre?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="team-detail-member-name">{member.nombre}</div>
                                                <div className="team-detail-member-email">{member.email}</div>
                                            </div>
                                            {member.id === team.capitan?.id && (
                                                <Badge className="team-detail-captain-badge">Capitán</Badge>
                                            )}
                                        </div>
                                    ))}
                                    {(!team.miembros || team.miembros.length === 0) && (
                                        <div className="team-detail-no-members">
                                            No hay miembros en este equipo
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="team-detail-actions">
                        {isCaptain && (
                            <Button 
                                variant="danger" 
                                className="team-detail-delete-btn"
                                onClick={handleDeleteTeam}
                            >
                                <i className="fa-regular fa-trash-can me-2"></i>
                                Eliminar equipo
                            </Button>
                        )}
                        {!isCaptain && isMember && (
                            <Button 
                                variant="outline-danger" 
                                className="team-detail-leave-btn"
                                onClick={handleLeaveTeam}
                            >
                                <i className="fa-regular fa-right-from-bracket me-2"></i>
                                Abandonar equipo
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default TeamDetail;