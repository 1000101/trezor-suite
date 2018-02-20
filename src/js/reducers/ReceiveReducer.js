/* @flow */
'use strict';

import * as RECEIVE from '../actions/constants/receive';

export type State = {
    +checksum: ?string;
    +accountIndex: ?number;
    +coin: ?string;
    location: string;
    addressVerified: boolean;
    adressUnverified: boolean;
}

export const initialState: State = {
    checksum: null,
    accountIndex: null,
    coin: null,
    location: '',
    addressVerified: false,
    addressUnverified: false,
};

export default (state: State = initialState, action: any): State => {

    switch (action.type) {

        case RECEIVE.INIT :
            return action.state;

        case RECEIVE.DISPOSE :
            return initialState;

        case RECEIVE.SHOW_ADDRESS :
            return {
                ...state,
                addressVerified: true,
                addressUnverified: false
            }
        case RECEIVE.SHOW_UNVERIFIED_ADDRESS :
            return {
                ...state,
                addressVerified: false,
                addressUnverified: true
            }

        default:
            return state;
    }

}