const getModuleState = state => state.tournaments;

export const getTournamentError = state => getModuleState(state).error;
export const getUserTournaments = state => getModuleState(state).userTournaments;
