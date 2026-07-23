import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import teams from '../../teams';

const MyTeams = () => {
    const dispatch = useDispatch();
    const userTeams = useSelector(state => state.teams?.userTeams || []);
    const isLoading = useSelector(state => state.teams?.loading || false);

    useEffect(() => {
        dispatch(teams.actions.getMyTeams());
    }, [dispatch]);

    return (
        <div className="home-dashboard" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="dashboard-greeting" style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        <FormattedMessage id="project.teams.MyTeams.title" defaultMessage="Mis Equipos" />
                    </h1>
                    <p className="dashboard-subtitle" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                        <FormattedMessage id="project.teams.MyTeams.subtitle" defaultMessage="Equipos que has creado" />
                    </p>
                </div>
                <Link to="/teams/create" className="btn btn-dark rounded-pill px-4" style={{ fontSize: '0.9rem' }}>
                    <FormattedMessage id="project.teams.MyTeams.create" defaultMessage="+ Crear equipo" />
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="secondary" />
                </div>
            ) : userTeams.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {userTeams.map((team, index) => (
                        <div key={team.id || index} className="list-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.25rem',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            transition: 'box-shadow 0.2s'
                        }}>
                            <div>
                                <div className="list-item-title" style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                                    {team.nombreEquipo || team.nombre}
                                </div>
                                <div className="list-item-meta" style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    <span>
                                        <FormattedMessage id="project.teams.MyTeams.members" defaultMessage="{count} miembros" values={{ count: team.miembros?.length || 0 }} />
                                    </span>
                                </div>
                            </div>
                            <Link to={`/teams/view/${team.id}`} className="list-item-link" style={{ fontWeight: '500', color: '#1d1d1f', textDecoration: 'none' }}>
                                <FormattedMessage id="project.teams.MyTeams.view" defaultMessage="Ver →" />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <div className="empty-state-text" style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                        <FormattedMessage id="project.teams.MyTeams.noTeams" defaultMessage="Aún no tienes equipos" />
                    </div>
                    <div className="empty-state-help" style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        <FormattedMessage id="project.teams.MyTeams.noTeamsHelp" defaultMessage="Crea tu primer equipo para empezar a competir" />
                    </div>
                    <Link to="/teams/create" className="empty-state-action btn btn-outline-dark rounded-pill mt-3">
                        <FormattedMessage id="project.teams.MyTeams.createAction" defaultMessage="Crear equipo →" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyTeams;
