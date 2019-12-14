import { exit } from 'process';
import log from 'signale';
import { timer, Observable } from 'rxjs';
import {
    distinctUntilChanged, map, switchMap, skipWhile, catchError,
} from 'rxjs/operators';
import songName from 'spotify-song-name';
import { Auth, OAuthToken } from './spotify';

/*
 * Emit song name
 * when it's changed in Spotify.
 */
export const spotifySong = timer(0, 5000).pipe(
    map((_) => {
        try {
            return songName();
        } catch {
            return null;
        }
    }),
    distinctUntilChanged(),
    skipWhile((v) => v === null),
);

/**
 * Get an OAuth token every 50 minutes.
 */
export const oauthToken: Observable<OAuthToken> = timer(0, 50 * 60 * 1000).pipe(
    map((_) => Auth.fromEnv()),
    catchError((_) => {
        log.error('Environment variables missing!');
        exit(1);
    }),
    switchMap((auth) => auth.getToken()),
    catchError((_) => {
        log.error('Could not get OAuth token!');
        exit(1);
    }),
);
