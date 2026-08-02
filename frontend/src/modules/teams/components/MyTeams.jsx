import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import teams from '../../teams';
import CreateTeamModal from './CreateTeam';
import './MyTeams.css';

const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const MyTeams = () => {
    const dispatch = useDispatch();
    const userTeams = useSelector(state => state.teams?.userTeams || []);
    const isLoading = useSelector(state => state.teams?.loading || false);

    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        dispatch(teams.actions.getMyTeams());
    }, [dispatch]);

    return (
        <div className="mt-container">
            <div className="mt-header">
                <div>
                    <h1 className="mt-title">
                        <FormattedMessage id="project.teams.MyTeams.title" defaultMessage="Mis Equipos" />
                    </h1>
                    <p className="mt-subtitle">
                        <FormattedMessage id="project.teams.MyTeams.subtitle" defaultMessage="Equipos que has creado" />
                    </p>
                </div>
                <button className="mt-create-btn" onClick={() => setShowCreateModal(true)}>
                    <FormattedMessage id="project.teams.MyTeams.create" defaultMessage="+ Crear equipo" />
                </button>
            </div>

            {isLoading ? (
                <div className="mt-loading">
                    <Spinner animation="border" variant="secondary" />
                </div>
            ) : userTeams.length > 0 ? (
                <div className="mt-list">
                    {userTeams.map((team, index) => (
                        <Link key={team.id || index} to={`/teams/view/${team.id}`} className="mt-row">
                            <div className="mt-row-left">
                                <div className="mt-row-shield">
                                    <i className="fa-solid fa-shield-halved" />
                                </div>
                                <div className="mt-row-info">
                                    <div className="mt-row-name">
                                        {team.nombreEquipo || team.nombre}
                                    </div>
                                    <div className="mt-row-meta">
                                        <span className="mt-row-meta-item">
                                            <i className="fa-regular fa-calendar" />
                                            {formatDate(team.fechaCreacion)}
                                        </span>
                                        <span className="mt-row-meta-sep">·</span>
                                        <span className="mt-row-meta-item">
                                            <FormattedMessage id="project.teams.MyTeams.members" defaultMessage="{count} miembros" values={{ count: team.miembros?.length || 0 }} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right mt-chevron" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="mt-empty">
                    <span className="mt-empty-icon">📋</span>
                    <h3 className="mt-empty-title">
                        <FormattedMessage id="project.teams.MyTeams.noTeams" defaultMessage="Aún no tienes equipos" />
                    </h3>
                    <p className="mt-empty-desc">
                        <FormattedMessage id="project.teams.MyTeams.noTeamsHelp" defaultMessage="Crea tu primer equipo para empezar a competir" />
                    </p>
                    <button className="mt-create-btn mt-create-btn--empty" onClick={() => setShowCreateModal(true)}>
                        <FormattedMessage id="project.teams.MyTeams.createAction" defaultMessage="Crear equipo →" />
                    </button>
                </div>
            )}

            <CreateTeamModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onCreated={() => dispatch(teams.actions.getMyTeams())}
            />
        </div>
    );
};

export default MyTeams;
