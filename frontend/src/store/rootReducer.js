import {combineReducers} from 'redux';

import app from '../modules/app';
import users from '../modules/users';
import teams from '../modules/teams';

const rootReducer = combineReducers({
    app: app.reducer,
    users: users.reducer, 
    teams: teams.reducer
});

export default rootReducer;
