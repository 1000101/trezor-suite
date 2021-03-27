import { AppState } from '@suite-types';
import { UseFormMethods } from 'react-hook-form';
import { Account, Network, CoinFiatRates } from '@wallet-types';
import { FeeLevel } from 'trezor-connect';
import { SellFiatTrade, SellFiatTradeQuoteRequest, ExchangeCoinInfo } from 'invity-api';
import { CoinmarketSellAction, SellInfo } from '@wallet-actions/coinmarketSellActions';
import { TypedValidationRules } from './form';
import { FeeInfo, FormState, PrecomposedLevels } from '@wallet-types/sendForm';

export const CRYPTO_INPUT = 'outputs[0].amount';
export const CRYPTO_TOKEN = 'outputs[0].token';
export const FIAT_INPUT = 'outputs[0].fiat';
export const FIAT_CURRENCY = 'outputs[0].currency';

export type Option = { value: string; label: string };
export type defaultCountryOption = { value: string; label?: string };

export interface ComponentProps {
    selectedAccount: AppState['wallet']['selectedAccount'];
    fiat: AppState['wallet']['fiat'];
    device: AppState['suite']['device'];
    localCurrency: AppState['wallet']['settings']['localCurrency'];
    fees: AppState['wallet']['fees'];
    quotesRequest: AppState['wallet']['coinmarket']['sell']['quotesRequest'];
    exchangeCoinInfo: AppState['wallet']['coinmarket']['exchange']['exchangeCoinInfo'];
}

export interface Props extends ComponentProps {
    selectedAccount: Extract<ComponentProps['selectedAccount'], { status: 'loaded' }>;
}

export type SellFormState = FormState & {
    receiveCryptoSelect: Option;
    sendCryptoSelect: Option;
};

export interface AmountLimits {
    currency: string;
    min?: number;
    max?: number;
}

export type SellFormContextValues = Omit<UseFormMethods<SellFormState>, 'register'> & {
    register: (rules?: TypedValidationRules) => (ref: any) => void;
    onSubmit: () => void;
    account: Account;
    isComposing: boolean;
    changeFeeLevel: (level: FeeLevel['label']) => void;
    sellInfo?: SellInfo;
    sellCoinInfo?: ExchangeCoinInfo[];
    localCurrencyOption: { label: string; value: string };
    composeRequest: (field?: string) => void;
    updateFiatCurrency: (selectedCurrency: { value: string; label: string }) => void;
    updateSendCryptoValue: (fiatValue: string, decimals: number) => void;
    saveQuoteRequest: (request: SellFiatTradeQuoteRequest) => CoinmarketSellAction;
    saveQuotes: (
        fixedQuotes: SellFiatTrade[],
        floatQuotes: SellFiatTrade[],
    ) => CoinmarketSellAction;
    saveTrade: (sellTrade: SellFiatTrade, account: Account, date: string) => CoinmarketSellAction;
    amountLimits?: AmountLimits;
    composedLevels?: PrecomposedLevels;
    fiatRates?: CoinFiatRates;
    setAmountLimits: (limits?: AmountLimits) => void;
    quotesRequest: AppState['wallet']['coinmarket']['sell']['quotesRequest'];
    isLoading: boolean;
    updateFiatValue: (amount: string) => void;
    noProviders: boolean;
    network: Network;
    feeInfo: FeeInfo;
};
