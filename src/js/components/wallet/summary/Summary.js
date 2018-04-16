/* @flow */
'use strict';

import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { Async } from 'react-select';
import { resolveAfter } from '../../../utils/promiseUtils';
import AbstractAccount from '../account/AbstractAccount';
import { Notification } from '../../common/Notification';
import SummaryDetails from './SummaryDetails.js';
import SummaryTokens from './SummaryTokens.js';
import { findDevice } from '../../../utils/reducerUtils';

import type { Props } from './index';
import type { AccountState } from '../account/AbstractAccount';

import type { TrezorDevice } from '../../../flowtype';
import type { NetworkToken } from '../../../reducers/LocalStorageReducer';
import type { Account } from '../../../reducers/AccountsReducer';
import type { Discovery } from '../../../reducers/DiscoveryReducer';

export default class Summary extends AbstractAccount<Props> {
    render() {
        return super.render() || _render(this.props, this.state);
    }
}

const _render = (props: Props, state: AccountState): React$Element<string> => {

    const {
        device,
        account,
        deviceStatusNotification
    } = state;

    if (!device || !account) return <section></section>;

    const abstractAccount = props.abstractAccount;
    const tokens = props.tokens.filter(t => t.ethAddress === account.address);

    return (

        <section className="summary">
            { deviceStatusNotification }

            <h2 className={ `summary-header ${abstractAccount.network}` }>Address #{ parseInt(abstractAccount.index) + 1 }</h2>

            <SummaryDetails 
                summary={ props.summary } 
                balance={ account.balance }
                network={ abstractAccount.network }
                fiat={ props.fiat }
                localStorage={ props.localStorage }
                onToggle={ props.onDetailsToggle } />

            <h2>Tokens</h2>
            {/* 0x58cda554935e4a1f2acbe15f8757400af275e084 */}
            <div className="filter">
                <Async 
                    className="token-select"
                    multi={ false }
                    autoload={ false }
                    ignoreCase={ true }
                    backspaceRemoves={ true }
                    value={ null }
                    onChange={ token => props.addToken(token, account) } 
                    loadOptions={ input => props.loadTokens(input, account.network) } 
                    filterOptions= { 
                        (options: Array<NetworkToken>, search: string, values) => {
                            return options.filter(o => {
                                return !tokens.find(t => t.symbol === o.symbol);
                            });
                        }
                    }
                    valueKey="symbol" 
                    labelKey="symbol" 
                    placeholder="Search for token"
                    searchPromptText="Type token name or address"
                    noResultsText="Token not found"
                    
                     />

            </div>

            <SummaryTokens tokens={ tokens } removeToken={ props.removeToken } />

        </section>

    );
}