import createCache from '@emotion/cache';

const WITTCODE = 'wittcode';

export default () => {
    return createCache({ key: WITTCODE });
}