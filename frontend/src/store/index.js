import {configureStore} from '@reduxjs/toolkit'

import rootReducer from './rootReducer';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // To avoid an error shown in the browser console when the action "project/app/error"
            // is dispatched (the "error" field in the action is not serializable).
            serializableCheck: {
                // Ignore these action types.
                ignoredActions: ['project/app/error'],
                // Ignore these paths in the state.
                ignoredPaths: ['app.error'],  
            }
    }),
});

export default store;