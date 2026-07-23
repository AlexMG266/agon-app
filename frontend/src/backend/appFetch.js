// src/backend/appFetch.js
const SERVICE_TOKEN_NAME = 'serviceToken';

let networkErrorCallback;
let reauthenticationCallback;

export const init = callback => networkErrorCallback = callback;

export const setReauthenticationCallback = callback => reauthenticationCallback = callback;

export const setServiceToken = serviceToken =>
    localStorage.setItem(SERVICE_TOKEN_NAME, serviceToken);

export const getServiceToken = () => localStorage.getItem(SERVICE_TOKEN_NAME);

export const removeServiceToken = () =>
    localStorage.removeItem(SERVICE_TOKEN_NAME);

const isJson = response => {
    const contentType = response.headers.get("content-type");
    return contentType && contentType.indexOf("application/json") !== -1;
}

const getOptions = (method, body) => {
    const options = {};
    options.method = method;

    if (body) {
        if (body instanceof FormData) {
            options.body = body;
        } else {
            options.headers = {'Content-Type': 'application/json'};
            options.body = JSON.stringify(body);
        }
    }

    let serviceToken = getServiceToken();

    if (serviceToken) {
        if (options.headers) {
            options.headers['Authorization'] = `Bearer ${serviceToken}`;
        } else {
            options.headers = {'Authorization': `Bearer ${serviceToken}`};
        }
    }

    return options;
}

export const appFetch = async (method, path, body) => {
    try {
        const url = `${import.meta.env.VITE_BACKEND_URL}${path}`;
        console.log('Fetching:', url, method, body);

        const response = await fetch(url, getOptions(method, body));
        console.log('Response status:', response.status);

        const appFetchResponse = {ok: response.ok, payload: null, status: response.status};

        if (response.status === 401 && reauthenticationCallback) {
            reauthenticationCallback();
            return appFetchResponse;
        }

        if (response.status === 403) {
            console.error('Error 403: No tienes permisos para acceder a este recurso');
            appFetchResponse.error = 'No tienes permisos para acceder a este recurso';
            return appFetchResponse;
        }

        if (isJson(response)) {
            appFetchResponse.payload = await response.json();
            console.log('Response payload:', appFetchResponse.payload);
        }

        return appFetchResponse;
    } catch (error) {
        console.error('Error en appFetch:', error);
        if (networkErrorCallback) {
            networkErrorCallback();
        }
        return { ok: false, payload: null, error: error.message };
    }
}