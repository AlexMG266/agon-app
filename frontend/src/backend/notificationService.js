import {appFetch} from './appFetch';

export const getNotifications = async () =>
    await appFetch('GET', '/notifications');
