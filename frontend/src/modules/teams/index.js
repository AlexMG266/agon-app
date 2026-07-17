import CreateTeam from './components/CreateTeam';
import TeamDetail from './components/TeamDetail';
import * as actions from './actions';
import * as actionTypes from './actionTypes';
import reducer from './reducer';
import * as selectors from './selectors';

export default { actions, actionTypes, reducer, selectors };
export { CreateTeam, TeamDetail };