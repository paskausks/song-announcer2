import log from 'signale';
import WebSocket from 'ws';
import { spotifySong } from './observables';

const main = async (): Promise<void> => {
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws) => {
        spotifySong.subscribe((data) => {
            ws.send(data);
        });

        log.info('Client connected.');
    });
};

main();
