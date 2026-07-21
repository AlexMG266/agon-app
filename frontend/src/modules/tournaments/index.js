import CreateTournament from './components/CreateTournament';
import TournamentDetail from './components/TournamentDetail';
import * as actions from './actions';
import * as actionTypes from './actionTypes';
import reducer from './reducer';
import * as selectors from './selectors';

export default { actions, actionTypes, reducer, selectors };
export { CreateTournament, TournamentDetail };
