import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Spinner from 'react-bootstrap/Spinner';
import tournaments from '../../tournaments';
import './MyTournaments.css';

const SECTIONS = [
    {
        key: 'created',
        badgeClass: 'my-t-badge--created',
        titleId: 'project.tournaments.MyTournaments.section.created',
        titleDefault: 'Creados',
        descId: 'project.tournaments.MyTournaments.section.created.desc',
        descDefault: 'Torneos que organizas y administras',
        dataKey: 'userTournaments',
        emptyId: 'project.tournaments.MyTournaments.section.created.empty',
        emptyDefault: 'Aún no has creado ningún torneo',
    },
    {
        key: 'followed',
        badgeClass: 'my-t-badge--followed',
        titleId: 'project.tournaments.MyTournaments.section.followed',
        titleDefault: 'Siguiendo',
        descId: 'project.tournaments.MyTournaments.section.followed.desc',
        descDefault: 'Torneos que sigues para estar al día',
        dataKey: 'followedTournaments',
        emptyId: 'project.tournaments.MyTournaments.section.followed.empty',
        emptyDefault: 'No sigues ningún torneo todavía',
    },
    {
        key: 'enrolled',
        badgeClass: 'my-t-badge--enrolled',
        titleId: 'project.tournaments.MyTournaments.section.enrolled',
        titleDefault: 'Inscrito',
        descId: 'project.tournaments.MyTournaments.section.enrolled.desc',
        descDefault: 'Torneos en los que participas con tu equipo',
        dataKey: 'enrolledTournaments',
        emptyId: 'project.tournaments.MyTournaments.section.enrolled.empty',
        emptyDefault: 'No estás inscrito en ningún torneo',
    },
];

const MyTournaments = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector(state => state.tournaments?.loading || false);
    const lists = useSelector(state => ({
        userTournaments: state.tournaments?.userTournaments || [],
        followedTournaments: state.tournaments?.followedTournaments || [],
        enrolledTournaments: state.tournaments?.enrolledTournaments || [],
    }));
    const loggedUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

    useEffect(() => {
        dispatch(tournaments.actions.getMyTournaments());
        dispatch(tournaments.actions.getFollowedTournaments());
        dispatch(tournaments.actions.getEnrolledTournaments());
    }, [dispatch]);

    return (
        <div className="my-t-dashboard">
            <div className="my-t-header">
                <div>
                    <h1 className="my-t-title">
                        <FormattedMessage id="project.tournaments.MyTournaments.title" defaultMessage="Mis Torneos" />
                    </h1>
                    <p className="my-t-subtitle">
                        <FormattedMessage
                            id="project.tournaments.MyTournaments.subtitle"
                            defaultMessage="Torneos que has creado, sigues o en los que estás inscrito"
                        />
                    </p>
                </div>
                <Link to="/tournaments/create" className="my-t-create-btn">
                    <i className="fa-solid fa-plus" />
                    <FormattedMessage id="project.tournaments.MyTournaments.create" defaultMessage="Crear torneo" />
                </Link>
            </div>

            {isLoading ? (
                <div className="my-t-loading">
                    <Spinner animation="border" variant="secondary" />
                </div>
            ) : (
                <div className="my-t-grid">
                    {SECTIONS.map(section => {
                        const items = lists[section.dataKey];
                        return (
                            <div key={section.key} className={`my-t-column my-t-column--${section.key}`}>
                                <div className="my-t-column-header">
                                    <div className="my-t-column-title-row">
                                        <span className={`my-t-badge ${section.badgeClass}`}>
                                            <FormattedMessage id={section.titleId} defaultMessage={section.titleDefault} />
                                        </span>
                                        <span className="my-t-count">{items.length}</span>
                                    </div>
                                    <p className="my-t-column-desc">
                                        <FormattedMessage id={section.descId} defaultMessage={section.descDefault} />
                                    </p>
                                </div>

                                <div className="my-t-list">
                                    {items.length > 0 ? (
                                        items.map(t => (
                                            <TournamentRow key={t.id} tournament={t} loggedUserId={loggedUserId} />
                                        ))
                                    ) : (
                                        <div className="my-t-empty">
                                            <i className="fa-regular fa-circle" />
                                            <span>
                                                <FormattedMessage id={section.emptyId} defaultMessage={section.emptyDefault} />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

function TournamentRow({ tournament, loggedUserId }) {
    const isOrganizer = tournament.organizadorId === loggedUserId;

    return (
        <Link to={`/tournaments/view/${tournament.id}`} className="my-t-row">
            <div className="my-t-row-left">
                <div className="my-t-row-icon">
                    <i className="fa-solid fa-trophy" />
                </div>
            </div>
            <div className="my-t-row-body">
                <div className="my-t-row-name">
                    {tournament.privado && <span className="my-t-row-lock"><i className="fa-solid fa-lock" /></span>}
                    {tournament.nombre}
                </div>
                <div className="my-t-row-meta">
                    <span className={`my-t-row-estado my-t-row-estado--${(tournament.estado || '').toLowerCase()}`}>
                        {tournament.estado}
                    </span>
                    {isOrganizer && (
                        <span className="my-t-row-org-tag">
                            <i className="fa-solid fa-crown" />
                            <FormattedMessage id="project.tournaments.MyTournaments.organizer" defaultMessage="Organizador" />
                        </span>
                    )}
                </div>
            </div>
            <div className="my-t-row-chevron">
                <i className="fa-solid fa-chevron-right" />
            </div>
        </Link>
    );
}

export default MyTournaments;
