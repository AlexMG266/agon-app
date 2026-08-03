import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';

import store from './store';
import { App } from './modules/app';
import backend from './backend';
import { NetworkError } from './backend';
import app from './modules/app';
import AppIntlProvider from './modules/app/components/AppIntlProvider';
import './styles.css';

// Create TanStack Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

/* Configure backend proxy. */
backend.init(() => store.dispatch(app.actions.error(new NetworkError())));

/* Render application. */
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={defaultSystem}>
                    <AppIntlProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </AppIntlProvider>
                </ChakraProvider>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);
