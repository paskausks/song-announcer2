/**
 * Spotify Auth configuration object
 */
export interface AuthConfig {

    /**
     * Spotify application clientID.
     */
    clientID: string;

    /**
     * Spotify application OAuth redirect URI
     */
    redirectURI: string;
}

/**
 * Represents the result of the last
 * successful OAuth authentication.
 */
export interface OAuthToken {

    /**
     * OAuth token.
     */
    token: string;

    /**
     * Time until the OAuth token expires.
     */
    expiresIn: Date;
}

type OAuthTokenOptional = OAuthToken | null;

/**
 * Spotify Implicit grant via OAuth.
 */
class Auth {

    private readonly TOKEN_ENDPOINT: string = 'https://accounts.spotify.com/authorize';

    /**
      * Spotify application client ID.
      */
    private clientID: string;

    /**
      * Spotify application redirect URI.
      */
    private redirectURI: string;

    /**
      * Currently active, valid OAuth token
      */
    private _token: OAuthTokenOptional = null;

    /**
     * Nonce for CSRF request protection.
     */
    private state: string;

    constructor(config: AuthConfig) {
        this.clientID = config.clientID;
        this.redirectURI = config.redirectURI;

        this.state = this.getNewState();
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
     * Get Spotify implicit grant OAuth URL.
     */
    getAuthUrl(): string {
        return `${this.TOKEN_ENDPOINT}?${this.getAuthParams().toString()}`
    }

    /**
     * Get OAuth token request parameters.
     */
    private getAuthParams(): URLSearchParams {
        const params = new URLSearchParams();

        params.append('client_id', this.clientID);
        params.append('response_type', 'token');
        params.append('redirect_uri', this.redirectURI);
        params.append('state', this.state);

        return params;
    }

    /**
     * Update CSRF nonce.
     */
    private getNewState(): string {
        return new Date().getTime().toString();
    }
}

export default Auth;
