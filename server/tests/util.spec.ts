import { getPort, DEFAULT_PORT } from '../src/util';
import { env } from 'process';

describe('getPort', () => {
    it('should return the default port if an override isn\'t specified in the env', () => {
        expect(getPort()).toBe(DEFAULT_PORT);
    });

    it('should return the default port if the override isn\'t valid', () => {
        env.SPOTIFY_DAEMON_PORT = 'ASD';
        expect(getPort()).toBe(DEFAULT_PORT);
    });

    it('should return the overridden port from the environment if it\'s a valid integer', () => {
        env.SPOTIFY_DAEMON_PORT = '6969';
        expect(getPort()).toBe(6969);
    });

    afterEach(() => {
        delete env.SPOTIFY_DAEMON_PORT;
    });
});

