/* @flow */
'use strict';

import { LOCATION_CHANGE } from 'react-router-redux';
import * as SEND from '../actions/constants/SendForm';
import * as WEB3 from '../actions/constants/Web3';
import * as ADDRESS from '../actions/constants/Address';
import EthereumjsUnits from 'ethereumjs-units';
import BigNumber from 'bignumber.js';
import { getFeeLevels } from '../actions/SendFormActions';

export type State = {
    +senderAddress: ?string;
    +coin: string;
    token: string;
    balance: string;
    tokenBalance: string;
    balanceNeedUpdate: boolean;
    

    // form fields
    advanced: boolean;
    untouched: boolean; // set to true when user made some changes in form
    touched: {[k: string]: boolean};
    address: string;
    amount: string;
    setMax: boolean;
    feeLevels: Array<FeeLevel>;
    selectedFeeLevel: ?FeeLevel;
    recommendedGasPrice: string;
    gasPriceNeedsUpdate: boolean;
    gasLimit: string;
    gasPrice: string;
    data: string;
    nonce: string;
    total: string;
    sending: boolean;
    sendingStatus: ?SendStatus;
    errors: {[k: string]: string};
    warnings: {[k: string]: string};
    infos: {[k: string]: string};
}

export type FeeLevel = {
    label: string;
    gasPrice: string;
    value: string;
}

type SendStatus = {
    success: boolean;
    message: string;
}

export const initialState: State = {
    senderAddress: null,
    coin: '',
    token: '',
    advanced: false,
    untouched: true,
    touched: {},
    balance: '0',
    tokenBalance: '0',
    balanceNeedUpdate: false,
    //address: '',
    address: '0x574BbB36871bA6b78E27f4B4dCFb76eA0091880B',
    amount: '',
    setMax: false,
    feeLevels: [],
    selectedFeeLevel: null,
    recommendedGasPrice: '0',
    gasPriceNeedsUpdate: false,
    gasLimit: '0',
    gasPrice: '0',
    data: '',
    nonce: '0',
    total: '0',
    sending: false,
    sendingStatus: null,
    errors: {},
    warnings: {},
    infos: {},
}


const onGasPriceUpdated = (state: State, action: any): State => {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const newPrice = getRandomInt(10, 50).toString();
    //const newPrice = EthereumjsUnits.convert(action.gasPrice, 'wei', 'gwei');
    if (action.coin === state.coin && newPrice !== state.recommendedGasPrice) {
        const newState: State = { ...state };
        if (!state.untouched) {
            newState.gasPriceNeedsUpdate = true;
            newState.recommendedGasPrice = newPrice;
        } else {
            const newFeeLevels = getFeeLevels(state.coin, newPrice, state.gasLimit);
            const selectedFeeLevel = newFeeLevels.find(f => f.value === 'Normal');
            newState.recommendedGasPrice = newPrice;
            newState.feeLevels = newFeeLevels;
            newState.selectedFeeLevel = selectedFeeLevel;
            newState.gasPrice = selectedFeeLevel.gasPrice;
        }
        return newState;
    }
    return state;
}

const onBalanceUpdated = (state: State, action: any): State => {
    // balanceNeedUpdate
    if (state.senderAddress === action.address) {
        return {
            ...state,
            balance: '1'
        }
    }
    return state;
}


export default (state: State = initialState, action: any): State => {

    switch (action.type) {

        case SEND.INIT :
            return action.state;

        case SEND.DISPOSE :
            return initialState;

        // this will be called right after Web3 instance initialization before any view is shown
        // and async during app live time
        case WEB3.GAS_PRICE_UPDATED :
            return onGasPriceUpdated(state, action);

        case ADDRESS.SET_BALANCE :
            return onBalanceUpdated(state, action);

        case SEND.TOGGLE_ADVANCED :
            return {
                ...state,
                advanced: !state.advanced
            }


        // user actions
        case SEND.ADDRESS_CHANGE :
        case SEND.AMOUNT_CHANGE :
        case SEND.SET_MAX :
        case SEND.CURRENCY_CHANGE :
        case SEND.FEE_LEVEL_CHANGE :
        case SEND.UPDATE_FEE_LEVELS :
        case SEND.GAS_PRICE_CHANGE :
        case SEND.GAS_LIMIT_CHANGE :
        case SEND.DATA_CHANGE :
            return action.state;

        case SEND.SEND :
            return {
                ...state,
                sending: true,
                sendingStatus: null,
            }

        case SEND.TX_COMPLETE :
            return {
                ...state,
                sending: false,
                sendingStatus: {
                    success: true,
                    message: action.txid
                }
            }
        case SEND.TX_ERROR :
            return {
                ...state,
                sending: false,
                sendingStatus: {
                    success: false,
                    message: action.response
                }
            }


        case SEND.VALIDATION :
            return {
                ...state,
                errors: action.errors,
                warnings: action.warnings,
                infos: action.infos,
            }

        default:
            return state;
    }

}