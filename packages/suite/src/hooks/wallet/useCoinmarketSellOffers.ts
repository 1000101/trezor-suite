import { createContext, useContext, useState, useEffect } from 'react';
import invityAPI from '@suite-services/invityAPI';
import { useActions, useSelector, useDevice, useTranslation } from '@suite-hooks';
import { useTimer } from '@suite-hooks/useTimeInterval';
import { SellFiatTrade } from 'invity-api';
import { processQuotes, createQuoteLink } from '@wallet-utils/coinmarket/sellUtils';
import * as coinmarketCommonActions from '@wallet-actions/coinmarket/coinmarketCommonActions';
import * as coinmarketSellActions from '@wallet-actions/coinmarketSellActions';
import * as sendFormActions from '@wallet-actions/sendFormActions';
import * as routerActions from '@suite-actions/routerActions';
import { Props, ContextValues, SellStep } from '@wallet-types/coinmarketSellOffers';
import * as notificationActions from '@suite-actions/notificationActions';
import { DEFAULT_VALUES, DEFAULT_PAYMENT } from '@wallet-constants/sendForm';
import { FormState, UseSendFormState } from '@wallet-types/sendForm';
import { getFeeLevels } from '@wallet-utils/sendFormUtils';

export const useOffers = (props: Props) => {
    const timer = useTimer();
    const REFETCH_INTERVAL_IN_SECONDS = 30;
    const { selectedAccount, quotesRequest, alternativeQuotes, quotes, device, sellInfo } = props;

    const { account, network } = selectedAccount;
    const { isLocked } = useDevice();
    const [callInProgress, setCallInProgress] = useState<boolean>(isLocked || false);
    const [selectedQuote, setSelectedQuote] = useState<SellFiatTrade>();
    const [innerQuotes, setInnerQuotes] = useState<SellFiatTrade[]>(quotes);
    const [innerAlternativeQuotes, setInnerAlternativeQuotes] = useState<
        SellFiatTrade[] | undefined
    >(alternativeQuotes);
    const [exchangeStep, setExchangeStep] = useState<SellStep>('BANK_ACCOUNT');
    const {
        saveTrade,
        setIsFromRedirect,
        openCoinmarketSellConfirmModal,
        addNotification,
        saveTransactionId,
        verifyAddress,
        submitRequestForm,
        goto,
        composeAction,
        signAction,
    } = useActions({
        saveTrade: coinmarketSellActions.saveTrade,
        setIsFromRedirect: coinmarketSellActions.setIsFromRedirect,
        openCoinmarketSellConfirmModal: coinmarketSellActions.openCoinmarketSellConfirmModal,
        addNotification: notificationActions.addToast,
        saveTransactionId: coinmarketSellActions.saveTransactionId,
        submitRequestForm: coinmarketCommonActions.submitRequestForm,
        verifyAddress: coinmarketCommonActions.verifyAddress,
        goto: routerActions.goto,
        composeAction: sendFormActions.composeTransaction,
        signAction: sendFormActions.signTransaction,
    });

    const {
        invityAPIUrl,
        exchangeCoinInfo,
        accounts,
        composed,
        selectedFee,
        fees,
        isFromRedirect,
    } = useSelector(state => ({
        invityAPIUrl: state.suite.settings.debug.invityAPIUrl,
        exchangeCoinInfo: state.wallet.coinmarket.exchange.exchangeCoinInfo,
        accounts: state.wallet.accounts,
        composed: state.wallet.coinmarket.composedTransactionInfo.composed,
        selectedFee: state.wallet.coinmarket.composedTransactionInfo.selectedFee,
        fees: state.wallet.fees,
        isFromRedirect: state.wallet.coinmarket.sell.isFromRedirect,
    }));
    if (invityAPIUrl) {
        invityAPI.setInvityAPIServer(invityAPIUrl);
    }

    const { translationString } = useTranslation();

    useEffect(() => {
        if (!quotesRequest) {
            goto('wallet-coinmarket-sell', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
            return;
        }

        const getQuotes = async () => {
            if (!selectedQuote) {
                invityAPI.createInvityAPIKey(account.descriptor);
                const allQuotes = await invityAPI.getSellQuotes(quotesRequest);
                const [quotes, alternativeQuotes] = processQuotes(allQuotes);
                setInnerQuotes(quotes);
                setInnerAlternativeQuotes(alternativeQuotes);
                timer.reset();
            }
        };

        if (isFromRedirect && quotesRequest) {
            getQuotes();
            setIsFromRedirect(false);
        }

        if (!timer.isLoading && !timer.isStopped) {
            if (timer.resetCount >= 40) {
                timer.stop();
            }

            if (timer.timeSpend.seconds === REFETCH_INTERVAL_IN_SECONDS) {
                timer.loading();
                getQuotes();
            }
        }
    });

    const selectQuote = async (quote: SellFiatTrade) => {
        const provider =
            sellInfo?.providerInfos && quote.exchange
                ? sellInfo.providerInfos[quote.exchange]
                : null;
        if (quotesRequest) {
            const result = await openCoinmarketSellConfirmModal(provider?.companyName);
            if (result) {
                // empty quoteId means the partner requests login first, requestTrade to get login screen
                if (!quote.quoteId) {
                    const returnUrl = await createQuoteLink(quotesRequest, account);
                    const response = await invityAPI.doSellTrade({ trade: quote, returnUrl });
                    if (response) {
                        if (
                            response.trade.status === 'LOGIN_REQUEST' ||
                            (response.trade.status === 'SITE_ACTION_REQUEST' && response.tradeForm)
                        ) {
                            submitRequestForm(response.tradeForm?.form);
                        } else {
                            const errorMessage = `[doSellTrade] ${response.trade.status} ${response.trade.error}`;
                            console.log(errorMessage);
                        }
                    } else {
                        const errorMessage = 'No response from the server';
                        console.log(`[doSellTrade] ${errorMessage}`);
                        addNotification({
                            type: 'error',
                            error: errorMessage,
                        });
                    }
                } else {
                    setSelectedQuote(quote);
                    timer.stop();
                }
            }
        }
    };

    const confirmTrade = async (address: string, extraField?: string) => {
        // TODO complete
        if (!selectedQuote) return;
        setCallInProgress(true);
        const response = await invityAPI.doSellConfirm(selectedQuote);
        if (!response) {
            addNotification({
                type: 'error',
                error: 'No response from the server',
            });
        } else if (response.error || !response.status || !response.orderId) {
            addNotification({
                type: 'error',
                error: response.error || 'Invalid response from the server',
            });
        } else {
            setExchangeStep('SEND_TRANSACTION');
            setSelectedQuote(response);
        }
        setCallInProgress(false);
    };

    const sendTransaction = async () => {
        if (
            selectedQuote &&
            selectedQuote.orderId &&
            selectedQuote.destinationAddress &&
            selectedQuote.cryptoStringAmount &&
            composed &&
            composed?.totalSpent
        ) {
            // prepare the fee levels, set custom values from composed
            // WORKAROUND: sendFormEthereumActions and sendFormRippleActions use form outputs instead of composed transaction data
            const formValues: FormState = {
                ...DEFAULT_VALUES,
                outputs: [
                    {
                        ...DEFAULT_PAYMENT,
                        address: selectedQuote.destinationAddress,
                        amount: selectedQuote.cryptoStringAmount,
                        token: composed.token?.address || null,
                    },
                ],
                selectedFee,
                feePerUnit: composed.feePerByte,
                feeLimit: composed.feeLimit || '',
                estimatedFeeLimit: composed.estimatedFeeLimit,
                options: ['broadcast'],
                rippleDestinationTag: selectedQuote.destinationPaymentExtraId,
            };

            // prepare form state for composeAction
            const coinFees = fees[account.symbol];
            const levels = getFeeLevels(account.networkType, coinFees);
            const feeInfo = { ...coinFees, levels };
            const formState = { account, network, feeInfo };

            // compose transaction again to recalculate fees based on real account values
            const composedLevels = await composeAction(formValues, formState as UseSendFormState);
            if (!selectedFee || !composedLevels) {
                addNotification({
                    type: 'sign-tx-error',
                    error: 'Missing level',
                });
                return;
            }
            const composedToSign = composedLevels[selectedFee];

            if (!composedToSign || composedToSign.type !== 'final') {
                let errorMessage: string | undefined;
                if (composedToSign?.type === 'error' && composedToSign.errorMessage) {
                    errorMessage = translationString(
                        composedToSign.errorMessage.id,
                        composedToSign.errorMessage.values as { [key: string]: any },
                    );
                }
                if (!errorMessage) {
                    errorMessage = 'Cannot create transaction';
                }
                addNotification({
                    type: 'sign-tx-error',
                    error: errorMessage,
                });
                return;
            }

            const result = await signAction(formValues, composedToSign);

            if (result) {
                await saveTrade(selectedQuote, account, new Date().toISOString());
                await saveTransactionId(selectedQuote.orderId);
                goto('wallet-coinmarket-exchange-detail', {
                    symbol: account.symbol,
                    accountIndex: account.index,
                    accountType: account.accountType,
                });
            }
        } else {
            addNotification({
                type: 'error',
                error: 'Cannot send transaction, missing data',
            });
        }
    };

    return {
        sendTransaction,
        callInProgress,
        selectedQuote,
        verifyAddress,
        device,
        saveTrade,
        quotesRequest,
        quotes: innerQuotes,
        alternativeQuotes: innerAlternativeQuotes,
        selectQuote,
        account,
        REFETCH_INTERVAL_IN_SECONDS,
        timer,
    };
};

export const CoinmarketSellOffersContext = createContext<ContextValues | null>(null);
CoinmarketSellOffersContext.displayName = 'CoinmarketSellOffersContext';

export const useCoinmarketSellOffersContext = () => {
    const context = useContext(CoinmarketSellOffersContext);
    if (context === null) throw Error('CoinmarketSellOffersContext used without Context');
    return context;
};
