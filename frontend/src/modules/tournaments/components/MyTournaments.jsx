import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import tournaments from '../../tournaments';

const MyTournaments = () => {
    const dispatch = useDispatch();
    const userTournaments = useSelector(state => state.tournaments?.userTournaments || []);
    const isLoading = useSelector(state => state.tournaments?.loading || false);

    useEffect(() => {
        dispatch(tournaments.actions.getMyTournaments());
    }, [dispatch]);

    return (
        <div className="home-dashboard" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="dashboard-greeting" style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.title" defaultMessage="Mis Torneos" />
                    </h1>
                    <p className="dashboard-subtitle" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.subtitle" defaultMessage="Torneos que has creado" />
                    </p>
                </div>
                <Link to="/tournaments/create" className="btn btn-dark rounded-pill px-4" style={{ fontSize: '0.9rem' }}>
                    <FormattedMessage id="project.tournaments.MyTournaments.create" defaultMessage="+ Crear torneo" />
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="secondary" />
                </div>
            ) : userTournaments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {userTournaments.map(tournament => (
                        <div key={tournament.id} className="list-item" style={{
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
                                    {tournament.nombre}
                                </div>
                                <div className="list-item-meta" style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    <span>
                                        <FormattedMessage id="project.tournaments.MyTournaments.estado" defaultMessage="Estado: {estado}" values={{ estado: tournament.estado }} />
                                    </span>
                                </div>
                            </div>
                            <Link to={`/tournaments/view/${tournament.id}`} className="list-item-link" style={{ fontWeight: '500', color: '#1d1d1f', textDecoration: 'none' }}>
                                <FormattedMessage id="project.tournaments.MyTournaments.view" defaultMessage="Ver →" />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                    <div className="empty-state-text" style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.noTournaments" defaultMessage="Aún no has creado ningún torneo" />
                    </div>
                    <div className="empty-state-help" style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.noTournamentsHelp" defaultMessage="Crea tu primer torneo para empezar a competir" />
                    </div>
                    <Link to="/tournaments/create" className="empty-state-action btn btn-outline-dark rounded-pill mt-3">
                        <FormattedMessage id="project.tournaments.MyTournaments.createAction" defaultMessage="Crear torneo →" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyTournaments;
