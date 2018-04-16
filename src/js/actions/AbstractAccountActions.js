/* @flow */
'use strict';

import * as ACCOUNT from './constants/account';

import { initialState } from '../reducers/AbstractAccountReducer';
import { findSelectedDevice } from '../reducers/TrezorConnectReducer';

import type { AsyncAction, Action, GetState, Dispatch, TrezorDevice } from '../flowtype';
import type { State } from '../reducers/AbstractAccountReducer';
import type { Coin } from '../reducers/LocalStorageReducer';

export type AbstractAccountAction = {
    type: typeof ACCOUNT.INIT,
    state: State
} | {
    type: typeof ACCOUNT.DISPOSE,
};

export const init = (): AsyncAction => {
    return (dispatch: Dispatch, getState: GetState): void => {

        const { location } = getState().router;
        const urlParams = location.state;

        const selected: ?TrezorDevice = findSelectedDevice( getState().connect );
        if (!selected) return;

        const { config } = getState().localStorage;
        const coin: ?Coin = config.coins.find(c => c.network === urlParams.network);
        if (!coin) return;

        const state: State = {
            index: parseInt(urlParams.address),
            deviceState: selected.state || '0',
            deviceId: selected.features ? selected.features.device_id : '0',
            deviceInstance: selected.instance,
            network: urlParams.network,
            coin,
            location: location.pathname,
        };

        dispatch({
            type: ACCOUNT.INIT,
            state: state
        });

    }
}

export const update = (): AsyncAction => {
    return (dispatch: Dispatch, getState: GetState): void => {
        const {
            abstractAccount,
            router
        } = getState();
        const isLocationChanged: boolean = router.location.pathname !== abstractAccount.location;
        if (isLocationChanged) {
            dispatch( init() );
            return;
        }
    }
}

export const dispose = (): Action => {
    return {
        type: ACCOUNT.DISPOSE
    }
}

export default {
    init,
    update,
    dispose
}