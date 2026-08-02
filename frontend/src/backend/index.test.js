import backend, { NetworkError } from './index';
import * as appFetch from './appFetch';
import * as userService from './userService';
import * as notificationService from './notificationService';
import * as teamService from './teamService.js';
import * as tournamentService from './tournamentService.js';

describe('backend/index', () => {
  it('exporta NetworkError', () => {
    expect(NetworkError).toBeDefined();
  });

  it('exporta las utilidades de appFetch', () => {
    expect(backend.init).toBe(appFetch.init);
    expect(backend.setReauthenticationCallback).toBe(appFetch.setReauthenticationCallback);
  });

  it('exporta los servicios', () => {
    expect(backend.userService).toBe(userService);
    expect(backend.notificationService).toBe(notificationService);
    expect(backend.teamService).toBe(teamService);
    expect(backend.tournamentService).toBe(tournamentService);
  });
});
