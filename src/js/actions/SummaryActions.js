/* @flow */
'use strict';

import EthereumjsUtil from 'ethereumjs-util';
import * as ACTIONS from './index';
import * as SUMMARY from './constants/summary';
import * as TOKEN from './constants/Token';
import * as ADDRESS from './constants/Address';
import { resolveAfter } from '../utils/promiseUtils';
import { getTokenInfoAsync, getTokenBalanceAsync } from './Web3Actions';

import { initialState } from '../reducers/SummaryReducer';
import type { State } from '../reducers/SummaryReducer';
import { findSelectedDevice } from '../reducers/TrezorConnectReducer';


export const init = (): any => {
    return (dispatch, getState): void => {
        const { location } = getState().router;
        const urlParams = location.params;

        const selected = findSelectedDevice( getState().connect );
        if (!selected) return;

        const state: State = {
            ...initialState,
            deviceState: selected.state,
            accountIndex: parseInt(urlParams.address),
            network: urlParams.network,
            location: location.pathname,
        };

        dispatch({
            type: SUMMARY.INIT,
            state: state
        });
    }
}


export const update = (newProps: any): any => {
    return (dispatch, getState): void => {
        const {
            summary,
            router
        } = getState();

        const isLocationChanged: boolean = router.location.pathname !== summary.location;
        if (isLocationChanged) {
            dispatch( init() );
            return;
        }
    }
}

export const dispose = (address: string): any => {
    return {
        type: SUMMARY.DISPOSE
    }
}

export const onDetailsToggle = (): any => {
    return {
        type: SUMMARY.DETAILS_TOGGLE
    }
}


export const loadTokens = (input: string, account: any): any => {
    return async (dispatch, getState): Promise<any> => {

        if (input.length < 1) return null;

        const tokens = getState().localStorage.tokens[ account.network ];
        const value = input.toLowerCase();
        const result = tokens.filter(t => 
            t.symbol.toLowerCase().indexOf(value) >= 0 || 
            t.address.toLowerCase().indexOf(value) >= 0 ||
            t.name.toLowerCase().indexOf(value) >= 0
        );

        if (result.length > 0) {
            return { options: result };
        } else {
            const web3instance = getState().web3.find(w3 => w3.network === account.network);

            const info = await getTokenInfoAsync(web3instance.erc20, input);
            info.address = input;

            if (info) {
                return {
                    options: [ info ]
                }
            } else {
                return {

                }
            }

            //await resolveAfter(300000);
            //await resolveAfter(3000);

        }

    }
}

export const selectToken = (token: any, account: any): any => {
    return async (dispatch, getState): Promise<any> => {

        const web3instance = getState().web3.find(w3 => w3.network === account.network);
        dispatch({
            type: TOKEN.ADD,
            payload: {
                ...token,
                ethAddress: account.address,
                deviceState: account.deviceState
            }
        });

        const tokenBalance = await getTokenBalanceAsync(web3instance.erc20, token.address, account.address);
        dispatch({
            type: TOKEN.SET_BALANCE,
            payload: {
                ethAddress: account.address,
                address: token.address,
                balance: tokenBalance.toString()
            }
        })

    }
}

export const removeToken = (token: any): any => {
    return {
        type: TOKEN.REMOVE,
        token
    }
}



export const onTokenSearch = (search: string): any => {
    return {
        type: ACTIONS.TOKENS_SEARCH,
        search
    }
}

export const onCustomTokenToggle = (): any => {
    return {
        type: ACTIONS.TOKENS_CUSTOM_TOGGLE
    }
}

export const onCustomTokenAddressChange = (value: string): any => {
    // todo:
    // -validate address
    // - if adresss is ok, try to fetch token info
    // return {
    //     type: ACTIONS.TOKENS_CUSTOM_ADDRESS_CHANGE,
    //     value
    // }

    return async (dispatch, getState) => {

        const valid: boolean = EthereumjsUtil.isValidAddress(value);
        if (valid) {
            
            dispatch({
                type: ACTIONS.TOKENS_CUSTOM_ADDRESS_CHANGE,
                value,
                valid,
                fetching: true
            });

            const { web3, abi } = getState().web3;
            const contract = web3.eth.contract(abi).at(value);

            contract.name.call((error, name) => {
                if (error) {
                    // TODO: skip
                }
                contract.symbol.call((error, symbol) => {
                    if (error) {
                        // TODO: skip
                    }
    
                    contract.decimals.call((error, decimals) => {
                        console.log("fetched!", name, symbol, decimals)
                    })
                });
                
                
            })

        } else {
            dispatch({
                type: ACTIONS.TOKENS_CUSTOM_ADDRESS_CHANGE,
                value,
                valid
            });
        }

        console.log("VALID!!!", valid);
    }
}

export const onCustomTokenNameChange = (value: string): any => {
    return {
        type: ACTIONS.TOKENS_CUSTOM_NAME_CHANGE,
        value
    }
}

export const onCustomTokenShortcutChange = (value: string): any => {
    return {
        type: ACTIONS.TOKENS_CUSTOM_SHORTCUT_CHANGE,
        value
    }
}

export const onCustomTokenDecimalChange = (value: string): any => {
    return {
        type: ACTIONS.TOKENS_CUSTOM_DECIMAL_CHANGE,
        value
    }
}

export const onCustomTokenAdd = (): any => {
    return {
        type: ACTIONS.TOKENS_CUSTOM_ADD
    }
}