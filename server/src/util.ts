import { env } from 'process';

export const DEFAULT_PORT = 7047;

/**
 * Get daemon port from environment,
 * or return default - 7047
 */
export const getPort = (): number => {
    const defaultPort = 7047;
    const envPort = env.SPOTIFY_DAEMON_PORT;

    if (!envPort) {
        return defaultPort;
    }

    const envPortParsed = parseInt(envPort, 10);

    if (isNaN(envPortParsed)) {
        return defaultPort;
    }

    return envPortParsed;
};
