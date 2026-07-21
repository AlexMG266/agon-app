import {combineReducers} from 'redux';

import app from '../modules/app';
import users from '../modules/users';
import teams from '../modules/teams';
import tournaments from '../modules/tournaments';

const rootReducer = combineReducers({
    app: app.reducer,
    users: users.reducer,
    teams: teams.reducer,
    tournaments: tournaments.reducer
});

export default rootReducer;
