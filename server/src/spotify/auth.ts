import fetch from 'node-fetch';
import { FetchLike } from './types';
import { env } from 'process';

/**
 * Spotify Auth configuration object
 */
export interface AuthConfig {

    /**
     * Spotify application clientID.
     */
    fetch?: FetchLike;

    /**
     * Spotify application clientID.
     */
    clientID: string;

    /**
     * Spotify application client secret.
     */
    clientSecret: string;
}

/**
 * Represents the result of the last
 * successful OAuth authentication.
 */
export interface OAuthToken {

    /**
     * OAuth token.
     */
   access_token: string,

   /**
    * Time until the OAuth token expires.
    */
   expires_in: number,

   token_type: string,
}

type OAuthTokenOptional = OAuthToken | null;

/**
 * Spotify Client Auth via OAuth.
 */
class Auth {

    private readonly TOKEN_ENDPOINT: string = 'https://accounts.spotify.com/api/token';

    /**
      * HTTP client with a fetch-like interface.
      */
    private fetch: FetchLike;

    /**
      * Spotify application client ID.
      */
    private clientID: string;

    /**
      * Spotify application client secret.
      */
    private clientSecret: string;

    /**
      * Currently active, valid OAuth token
      */
    private _token: OAuthTokenOptional = null;

    static fromEnv(): Auth {
        const clientID = env.SPOTIFY_CLIENT_ID;
        const clientSecret = env.SPOTIFY_CLIENT_SECRET;

        if (!clientID || !clientSecret) {
            throw new Error('Environment variables missing!');
        }

        return new Auth ({
            clientID,
            clientSecret
        });
    }

    constructor(config: AuthConfig) {
        this.clientID = config.clientID;
        this.clientSecret = config.clientSecret;
        this.fetch = config.fetch || fetch;
    }

    /**
     * Get currently active OAuth token
     */
    get token(): OAuthTokenOptional {
        return this._token;
    }

    /**
     * Set currently active OAuth token
     */
    set token(value: OAuthTokenOptional) {
        this._token = value;
    }

    /**
     * Get Spotify OAuth token
     */
    async getToken(): Promise<OAuthToken> {
        const response = await this.fetch(this.TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                 'Content-Type': 'application/x-www-form-urlencoded',
                 'Authorization': `Basic ${this.formatClientCredentials()}`,
            },
            body: this.getAuthParams(),
        });

        if (!response.ok) {
            throw new Error('Authentication failure');
        }

        const token: OAuthToken = await response.json();
        this.token = token
        return token;
    }

    /**
     * Format application credentials for authentication
     * to the Spotify web API.
     */
    private formatClientCredentials(): string {
        return Buffer.from(
            `${this.clientID}:${this.clientSecret}`,
            'binary'
        ).toString('base64');
    }

    /**
     * Get OAuth token request parameters.
     */
    private getAuthParams(): URLSearchParams {
        const params = new URLSearchParams();

        params.append('grant_type', 'client_credentials');

        return params;
    }
}

export default Auth;
