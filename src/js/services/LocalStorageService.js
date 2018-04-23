/* @flow */
'use strict';

import * as LocalStorageActions from '../actions/LocalStorageActions';

import { DEVICE } from 'trezor-connect';
import * as CONNECT from '../actions/constants/TrezorConnect';
import * as MODAL from '../actions/constants/modal';
import * as TOKEN from '../actions/constants/token';
import * as ADDRESS from '../actions/constants/address';
import * as DISCOVERY from '../actions/constants/discovery';
import * as SEND from '../actions/constants/send';
import * as WEB3 from '../actions/constants/web3';
import * as PENDING from '../actions/constants/pendingTx';
import { LOCATION_CHANGE } from 'react-router-redux';

import type { 
    Middleware,
    MiddlewareAPI,
    MiddlewareDispatch,
    State,
    Dispatch,
    Action,
    AsyncAction,
    GetState 
} from '../flowtype';

import type { TrezorDevice } from '../flowtype';
import type { Account } from '../reducers/AccountsReducer';
import type { Token } from '../reducers/TokensReducer';
import type { PendingTx } from '../reducers/PendingTxReducer';
import type { Discovery } from '../reducers/DiscoveryReducer';


// https://github.com/STRML/react-localstorage/blob/master/react-localstorage.js
// or
// https://www.npmjs.com/package/redux-react-session

const findAccounts = (devices: Array<TrezorDevice>, accounts: Array<Account>): Array<Account> => {
    return devices.reduce((arr, dev) => {
        return arr.concat(accounts.filter(a => a.deviceState === dev.state));
    }, []);
}

const findTokens = (accounts: Array<Account>, tokens: Array<Token>): Array<Token> => {
    return accounts.reduce((arr, account) => {
        return arr.concat(tokens.filter(a => a.ethAddress === account.address));
    }, []);
}

const findDiscovery = (devices: Array<TrezorDevice>, discovery: Array<Discovery>): Array<Discovery> => {
    return devices.reduce((arr, dev) => {
        return arr.concat(discovery.filter(a => a.deviceState === dev.state));
    }, []);
}

const findPendingTxs = (accounts: Array<Account>, pending: Array<PendingTx>): Array<PendingTx> => {
    return accounts.reduce((arr, account) => {
        return arr.concat(pending.filter(a => a.address === account.address));
    }, []);
}

const save = (dispatch: Dispatch, getState: GetState): void => {
    const devices: Array<TrezorDevice> = getState().connect.devices.filter(d => d.features && d.remember === true);
    const accounts: Array<Account> = findAccounts(devices, getState().accounts);
    const tokens: Array<Token> = findTokens(accounts, getState().tokens);
    const pending: Array<PendingTx> = findPendingTxs(accounts, getState().pending);
    const discovery: Array<Discovery> = findDiscovery(devices, getState().discovery);

    // save devices
    dispatch( LocalStorageActions.save('devices', JSON.stringify(devices) ) );

    // save already preloaded accounts
    dispatch( LocalStorageActions.save('accounts', JSON.stringify(accounts) ) );

    // save discovery state
    dispatch( LocalStorageActions.save('discovery', JSON.stringify(discovery) ) );

    // tokens
    dispatch( LocalStorageActions.save('tokens', JSON.stringify( tokens ) ) );

    // pending transactions
    dispatch( LocalStorageActions.save('pending', JSON.stringify( pending ) ) );
}


const LocalStorageService: Middleware = (api: MiddlewareAPI) => (next: MiddlewareDispatch) => (action: Action): Action => {

    if (action.type === LOCATION_CHANGE) {
        const { location } = api.getState().router;
        if (!location) {
            // load data from config.json and local storage
            api.dispatch( LocalStorageActions.loadData() );
        }
    }

    next(action);

    switch (action.type) {

        // first time saving
        case CONNECT.REMEMBER :
            save(api.dispatch, api.getState);
        break;

        case TOKEN.ADD :
        case TOKEN.REMOVE :
        case TOKEN.SET_BALANCE :
            save(api.dispatch, api.getState);
        break;

        case ADDRESS.CREATE :
        case ADDRESS.SET_BALANCE :
        case ADDRESS.SET_NONCE :
            save(api.dispatch, api.getState);
        break;

        case DISCOVERY.START :
        case DISCOVERY.STOP :
        case DISCOVERY.COMPLETE :
        // case DISCOVERY.WAITING :
            save(api.dispatch, api.getState);
        break;

        case CONNECT.FORGET :
        case CONNECT.FORGET_SINGLE :
        case DEVICE.CHANGED :
        case DEVICE.DISCONNECT :
        case CONNECT.AUTH_DEVICE :
        case CONNECT.SELECT_DEVICE :
            save(api.dispatch, api.getState);
        break;

        case SEND.TX_COMPLETE :
        case PENDING.TX_RESOLVED :
            save(api.dispatch, api.getState);
        break;

    }

    return action;
};

export default LocalStorageService;