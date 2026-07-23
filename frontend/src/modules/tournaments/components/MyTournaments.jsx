import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import tournaments from '../../tournaments';
import './MyTournaments.css';

const MyTournaments = () => {
    const dispatch = useDispatch();
    const userTournaments = useSelector(state => state.tournaments?.userTournaments || []);
    const followedTournaments = useSelector(state => state.tournaments?.followedTournaments || []);
    const enrolledTournaments = useSelector(state => state.tournaments?.enrolledTournaments || []);
    const isLoading = useSelector(state => state.tournaments?.loading || false);

    useEffect(() => {
        dispatch(tournaments.actions.getMyTournaments());
        dispatch(tournaments.actions.getFollowedTournaments());
        dispatch(tournaments.actions.getEnrolledTournaments());
    }, [dispatch]);

    const loggedUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

    return (
        <div className="home-dashboard" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="dashboard-greeting" style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.title" defaultMessage="Mis Torneos" />
                    </h1>
                    <p className="dashboard-subtitle" style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                        <FormattedMessage id="project.tournaments.MyTournaments.subtitle" defaultMessage="Torneos que has creado, sigues o en los que estás inscrito" />
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
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

                    {/* --- Column 1: Created --- */}
                    <div className="my-t-section">
                        <div className="my-t-section-header">
                            <span className="my-t-section-badge my-t-section-badge--created">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.created" defaultMessage="Creados" />
                            </span>
                            <span className="my-t-section-count">{userTournaments.length}</span>
                        </div>
                        {userTournaments.length > 0 ? (
                            <div className="my-t-list">
                                {userTournaments.map(t => (
                                    <TournamentRow key={t.id} tournament={t} loggedUserId={loggedUserId} />
                                ))}
                            </div>
                        ) : (
                            <div className="my-t-empty">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.created.empty" defaultMessage="No has creado torneos" />
                            </div>
                        )}
                    </div>

                    {/* --- Column 2: Followed --- */}
                    <div className="my-t-section">
                        <div className="my-t-section-header">
                            <span className="my-t-section-badge my-t-section-badge--followed">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.followed" defaultMessage="Siguiendo" />
                            </span>
                            <span className="my-t-section-count">{followedTournaments.length}</span>
                        </div>
                        {followedTournaments.length > 0 ? (
                            <div className="my-t-list">
                                {followedTournaments.map(t => (
                                    <TournamentRow key={t.id} tournament={t} loggedUserId={loggedUserId} />
                                ))}
                            </div>
                        ) : (
                            <div className="my-t-empty">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.followed.empty" defaultMessage="No sigues ningún torneo" />
                            </div>
                        )}
                    </div>

                    {/* --- Column 3: Enrolled --- */}
                    <div className="my-t-section">
                        <div className="my-t-section-header">
                            <span className="my-t-section-badge my-t-section-badge--enrolled">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.enrolled" defaultMessage="Inscrito" />
                            </span>
                            <span className="my-t-section-count">{enrolledTournaments.length}</span>
                        </div>
                        {enrolledTournaments.length > 0 ? (
                            <div className="my-t-list">
                                {enrolledTournaments.map(t => (
                                    <TournamentRow key={t.id} tournament={t} loggedUserId={loggedUserId} />
                                ))}
                            </div>
                        ) : (
                            <div className="my-t-empty">
                                <FormattedMessage id="project.tournaments.MyTournaments.section.enrolled.empty" defaultMessage="No estás inscrito en torneos" />
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

function TournamentRow({ tournament, loggedUserId }) {
    return (
        <Link to={`/tournaments/view/${tournament.id}`} className="my-t-row">
            <div className="my-t-row-top">
                {tournament.privado && <span style={{ marginRight: '0.25rem', fontSize: '0.8rem' }}>🔒</span>}
                <span className="my-t-row-name">{tournament.nombre}</span>
            </div>
            <div className="my-t-row-meta">
                <span className="my-t-row-estado">{tournament.estado}</span>
                {tournament.organizadorId === loggedUserId && (
                    <span className="my-t-row-org-tag">
                        <FormattedMessage id="project.tournaments.MyTournaments.organizer" defaultMessage="organizador" />
                    </span>
                )}
            </div>
        </Link>
    );
}

export default MyTournaments;
