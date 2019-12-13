import { Auth, AuthConfig } from '../../src/spotify';

describe('Spotify Auth', () => {
    const init: AuthConfig = {
        clientID: 'clienttestid',
        redirectURI: 'https://test.dev',
    };

    describe('Auth#getAuthUrl', () => {
        it('should return the proper auth URL', () => {
            const auth = new Auth(init);
            (auth as any).state = 'xyz';
            expect(auth.getAuthUrl()).toBe('https://accounts.spotify.com/authorize?client_id=clienttestid&response_type=token&redirect_uri=https%3A%2F%2Ftest.dev&state=xyz');
        });
    });

    describe('Auth#getAuthParams', () => {
        it('should prepare the correct authentication params', () => {
            const auth = new Auth(init);
            (auth as any).state = 'xyz';
            const result = (auth as any).getAuthParams();
            expect(result.toString()).toBe('client_id=clienttestid&response_type=token&redirect_uri=https%3A%2F%2Ftest.dev&state=xyz');
        });
    });
});

