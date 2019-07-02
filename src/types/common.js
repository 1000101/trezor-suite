/* @flow */

/* Common types used in both params and responses */

export type BlockchainSettings = {
    name: string,
    worker: string | Function,
    server: Array<string>,
    debug?: boolean,
};

/* Transaction */

export type TokenTransfer = {
    type: 'sent' | 'recv' | 'self' | 'unknown',
    name: string,
    symbol: string,
    address: string,
    decimals: number,
    amount: string,
    from?: string,
    to?: string,
};

export type Target = {
    addresses?: Array<string>,
    isAddress: boolean,
    amount?: string,
    coinbase?: string,
};

export type Transaction = {
    type: 'sent' | 'recv' | 'self' | 'unknown',

    txid: string,
    blockTime: ?number,
    blockHeight: ?number,
    blockHash: ?string,

    amount: string,
    fee: string,
    // total: string, // amount + total

    targets: Array<Target>,
    tokens: Array<TokenTransfer>,
};

/* Account */

export type Address = {
    address: string,
    path: string,
    transfers: number,
    // decimal: number,
    balance?: string,
    sent?: string,
    received?: string,
};

export type AccountAddresses = {
    change: Array<Address>,
    used: Array<Address>,
    unused: Array<Address>,
};

export type TokenInfo = {
    type: string, // token type: ERC20...
    address: string, // token address
    balance: string, // token balance
    name: string, // token name
    symbol: string, // token symbol
    decimals: number, //
    // transfers: number, // total transactions?
};

export type AccountInfo = {
    descriptor: string,
    balance: string,
    availableBalance: string,
    tokens?: Array<TokenInfo>, // ethereum tokens
    addresses?: AccountAddresses, // bitcoin addresses
    history: {
        total: number, // total transactions (unknown in ripple)
        tokens?: number, // tokens transactions
        unconfirmed: number, // unconfirmed transactions
        transactions?: Array<Transaction>, // list of transactions
        txids?: Array<string>, // not implemented
    },
    misc?: {
        // ETH
        nonce?: string,
        // XRP
        sequence?: number,
        reserve?: string,
    },
    page?: ?{
        // blockbook
        index: number,
        size: number,
        total: number,
    },
    marker?: ?{
        // ripple-lib
        ledger: number,
        seq: number,
    },
};

export type SubscriptionAccountInfo = {
    descriptor: string,
    addresses?: AccountAddresses, // bitcoin addresses
};
