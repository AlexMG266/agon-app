const getModuleState = state => state.tournaments;

export const getTournamentError = state => getModuleState(state).error;
export const getUserTournaments = state => getModuleState(state).userTournaments;
export const getFollowedTournaments = state => getModuleState(state).followedTournaments;
export const getEnrolledTournaments = state => getModuleState(state).enrolledTournaments;
