import CreateTournament from './components/CreateTournament';
import TournamentDetail from './components/TournamentDetail';
import MyTournaments from './components/MyTournaments';
import BrowseTournaments from './components/BrowseTournaments';
import MyMatches from './components/MyMatches';
import * as actions from './actions';
import * as actionTypes from './actionTypes';
import reducer from './reducer';
import * as selectors from './selectors';

export default { actions, actionTypes, reducer, selectors };
export { CreateTournament, TournamentDetail, MyTournaments, BrowseTournaments, MyMatches };
