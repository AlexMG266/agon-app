import { init, setReauthenticationCallback, setForbiddenCallback } from './appFetch';
import * as userService from './userService';
import * as notificationService from './notificationService';
import * as teamService from './teamService.js';
import * as tournamentService from './tournamentService.js';

export { default as NetworkError } from "./NetworkError";

export default {
    init,
    setReauthenticationCallback,
    setForbiddenCallback,
    userService,
    notificationService,
    teamService,
    tournamentService
};