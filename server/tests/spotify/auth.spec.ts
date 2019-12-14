import { Auth, AuthConfig, OAuthToken } from '../../src/spotify';
import { FetchLike, FetchLikeResponse } from '../../src/spotify/types';

describe('Spotify Auth', () => {
    const init: AuthConfig = {
        clientID: 'clienttestid',
        clientSecret: 'clienttestsecret',
    };

    describe('Auth#getAuthParams', () => {
        it('should prepare the correct authentication params', () => {
            const auth = new Auth(init);
            const result = (auth as any).getAuthParams();
            expect(result.toString()).toBe('grant_type=client_credentials');
        });
    });

    describe('Auth#formatClientCredentials', () => {
        it('should take the client id and client secret and base64 encode it', () => {
            const auth = new Auth(init);
            const result = (auth as any).formatClientCredentials();

            // b64encoded "clienttestid:clienttestsecret"
            expect(result.toString()).toBe('Y2xpZW50dGVzdGlkOmNsaWVudHRlc3RzZWNyZXQ=');
        });
    });

    describe('Auth#authenticate', () => {
        it('should get the access token from the Spotify API', async () => {
            const tokenData: OAuthToken = {
                access_token: 'abc',
                token_type: 'bearer',
                expires_in: 3600,
                scope: '',
            };
            const fakeJson = jest.fn(async (): Promise<OAuthToken> => tokenData);
            const fetch = jest.fn(async (): Promise<FetchLikeResponse> => ({
                ok: true,
                json: fakeJson as any,
            }));
            const fetchInit = {
                fetch,
                ...init,
            };
            const auth = new Auth(fetchInit);
            const result = await auth.getToken();
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');

            expect(result).toEqual(tokenData);
            expect(fetch).toBeCalledWith('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic Y2xpZW50dGVzdGlkOmNsaWVudHRlc3RzZWNyZXQ=',
                },
                body: params,
            });
        });

        it('should throw if the response from the Spotify API is not successful', () => {
            const fakeJson = jest.fn(async (): Promise<null> => null);
            const fetch = jest.fn(async (): Promise<FetchLikeResponse> => ({
                ok: false,
                json: fakeJson as any,
            }));
            const fetchInit = {
                fetch,
                ...init,
            };

            const auth = new Auth(fetchInit);
            const result = auth.getToken();
            expect(result).rejects.toThrow('Authentication failure');
        });
    });
});

