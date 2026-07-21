import * as actionTypes from './actionTypes';

const initialState = {
    error: null
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.CREATE_TOURNAMENT_COMPLETED:
            return { ...state, error: null };
        case actionTypes.CLEAR_TOURNAMENT_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export default reducer;
