import { Linking } from 'react-native';
import { Actions } from 'react-native-router-flux';

export const LOCATION_CHANGE = '@router-location-change';
export const UPDATE = 'goto';

export const onLocationChange = (pathname: string) => {
    return {
        type: LOCATION_CHANGE,
        pathname,
    };
};

// links inside of application
export const goto = (url: string) => () => {
    // TODO: check if requested url != current url
    const [pathname, hash] = url.split('#');
    try {
        Actions[pathname].call(undefined, hash ? { hash } : undefined);
    } catch (error) {
        // TODO: catch error
    }

    // TODO: check requested scene depth and perform push replace or reset
    // Actions.push(scene, { hash: hash });
    // Actions.replace(pathname, { hash: hash });
};

// external links
export const gotoUrl = (url: string) => {
    Linking.openURL(url);
};
