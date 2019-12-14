import { oauthToken, spotifySong } from './observables';

const main = async () => {
    oauthToken.subscribe(console.log);
    spotifySong.subscribe(console.log);

    await new Promise(() => null);
};

main();

