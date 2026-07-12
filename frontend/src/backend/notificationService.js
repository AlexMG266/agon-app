import {appFetch} from './appFetch';

export const NOTIFICATIONS_UPDATED_EVENT = 'notifications-updated';

const notifyNotificationsUpdated = () =>
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));

export const getNotifications = async () =>
    await appFetch('GET', '/notifications');

export const getNotification = async (notificationId) =>
    await appFetch('GET', `/notifications/${notificationId}`);

export const markAsRead = async (notificationId) => {
    const response = await appFetch('PUT', `/notifications/${notificationId}`);
    if (response.ok) {
        notifyNotificationsUpdated();
    }
    return response;
};
