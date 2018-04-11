/* @flow */
'use strict';

import * as NOTIFICATION from './constants/notification';


// called from RouterService
export const clear = (currentParams, requestedParams): any => {
    return async (dispatch, getState) => {
        // if route has been changed from device view into something else (like other device, settings...) 
        // try to remove all Notifications which are linked to previous device (they are not cancelable by user)
        if (currentParams.device !== requestedParams.device || currentParams.deviceInstance !== requestedParams.deviceInstance) {
            const entries = getState().notifications.filter(entry => typeof entry.devicePath === 'string');
            entries.forEach(entry => {
                dispatch({
                    type: NOTIFICATION.CLOSE,
                    payload: {
                        devicePath: entry.devicePath
                    }
                })
            });
        }
    }
}
