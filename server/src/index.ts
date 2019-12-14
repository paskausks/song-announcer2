import log from 'signale';
import app from './http';
import { env, exit } from 'process';
import { getPort } from './util';
import { Auth } from './spotify';

const main = () => {
    const port = getPort();
    const clientID = env.SPOTIFY_CLIENT_ID;

    if (!clientID) {
        log.error('SPOTIFY_CLIENT_ID not found in the environment.');
        exit(1);
    }

    const auth = new Auth({
        redirectURI: `http://localhost:${port}`,
        clientID,
    });

    if (!auth.token) {
        log.log(`Please go to ${auth.getAuthUrl()} to authenticate!`);
    }

    app.listen(port);
    log.success('Server running!');
};

main();
