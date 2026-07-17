import { init, setReauthenticationCallback, setForbiddenCallback } from './appFetch';
import * as userService from './userService';
import * as notificationService from './notificationService';
import * as teamService from './teamService.js';

export { default as NetworkError } from "./NetworkError";

export default {
    init,
    setReauthenticationCallback,
    setForbiddenCallback,
    userService,
    notificationService,
    teamService
};