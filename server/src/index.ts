import { oauthToken, spotifySong } from './observables';

const main = async (): Promise<void> => {
    oauthToken.subscribe();
    spotifySong.subscribe();

    await new Promise(() => null);
};

main();
