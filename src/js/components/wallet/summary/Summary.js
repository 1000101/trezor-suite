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
import { findAccountTokens } from '../../../reducers/TokensReducer';

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
    const abstractAccount = props.abstractAccount;

    if (!device || !account || !abstractAccount) return <section></section>;

    
    const tokens = findAccountTokens(props.tokens, account);
    const explorerLink: string = `${abstractAccount.coin.explorer.address}${account.address}`;

    return (

        <section className="summary">
            { deviceStatusNotification }

            <h2 className={ `summary-header ${abstractAccount.network}` }>
                Address #{ parseInt(abstractAccount.index) + 1 }
                <a href={ explorerLink } className="gray" target="_blank" rel="noreferrer noopener">See full transaction history</a>
            </h2>

            <SummaryDetails 
                coin={ abstractAccount.coin }
                summary={ props.summary } 
                balance={ account.balance }
                network={ abstractAccount.network }
                fiat={ props.fiat }
                localStorage={ props.localStorage }
                onToggle={ props.onDetailsToggle } />

            <h2>Tokens</h2>
            {/* 0x58cda554935e4a1f2acbe15f8757400af275e084 Lahod */}
            {/* 0x58cda554935e4a1f2acbe15f8757400af275e084 T01 */}
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
                        (options: Array<NetworkToken>, search: string, values: Array<NetworkToken>) => {
                            return options.map(o => {
                                const added = tokens.find(t => t.symbol === o.symbol);
                                if (added) {
                                    return {
                                        ...o,
                                        name: `${o.name} (Already added)`,
                                        disabled: true
                                    };
                                } else {
                                    return o;
                                }
                            });

                            // return options.filter(o => {
                            //     return !tokens.find(t => t.symbol === o.symbol);
                            // });
                        }
                    }
                    valueKey="symbol" 
                    labelKey="name" 
                    placeholder="Search for token"
                    searchPromptText="Type token name or address"
                    noResultsText="Token not found"
                    
                     />

            </div>
                    
            <SummaryTokens tokens={ tokens } removeToken={ props.removeToken } />

        </section>

    );
}