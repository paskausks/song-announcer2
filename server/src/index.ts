import log from 'signale';
import { exit } from 'process';
import { Auth } from './spotify';

const main = async () => {
    let auth: Auth;

    try {
        auth = Auth.fromEnv();
    } catch {
        log.error('Environment variables missing!');
        exit(1);
    }

    try {
        await auth.authenticate();
    } catch {
        log.error('Authentication error!');
        exit(1);
    }
};

main();
