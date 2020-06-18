import TrezorConnect from 'trezor-connect';
import * as notificationActions from '@suite-actions/notificationActions';
import { GetState, Dispatch } from '@suite-types';

export const sign = (message: string, path: string, hex = false) => async (
    dispatch: Dispatch,
    getState: GetState,
) => {
    const { device } = getState().suite;
    const { account } = getState().wallet.selectedAccount;
    if (!device || !account) return;

    let fn;

    switch (account.networkType) {
        case 'bitcoin': {
            fn = TrezorConnect.signMessage;
            break;
        }
        case 'ethereum': {
            fn = TrezorConnect.ethereumSignMessage;
            break;
        }
        default: {
            fn = () => ({
                success: false,
                payload: {
                    error: `Unsupported network: ${account.networkType}`,
                    code: undefined,
                    signature: '',
                },
            });
            break;
        }
    }

    const params = {
        path,
        coin: account.symbol,
        message,
        hex,
    };
    const response = await fn(params);

    if (response.success) {
        notificationActions.addToast({
            type: 'sign-message-success',
        });
        return response.payload.signature;
    }

    dispatch(
        notificationActions.addToast({
            type: 'sign-message-error',
            error: response.payload.error,
        }),
    );
};

export const verify = (address: string, message: string, signature: string, hex = false) => async (
    dispatch: Dispatch,
    getState: GetState,
) => {
    const { device } = getState().suite;
    const { account } = getState().wallet.selectedAccount;
    if (!device || !account) return;

    let fn;
    const params = {
        address,
        message,
        signature,
        coin: account.symbol,
        hex,
        device,
        useEmptyPassphrase: device.useEmptyPassphrase,
    };

    switch (account.networkType) {
        case 'bitcoin':
            fn = TrezorConnect.verifyMessage;
            break;
        case 'ethereum':
            fn = TrezorConnect.ethereumVerifyMessage;
            break;
        default:
            fn = () => ({
                success: false,
                payload: {
                    error: `Unsupported network: ${account.networkType}`,
                    code: undefined,
                    signature: '',
                },
            });
            break;
    }

    const response = await fn(params);
    if (response.success) {
        dispatch(
            notificationActions.addToast({
                type: 'verify-message-success',
            }),
        );
    } else {
        dispatch(
            notificationActions.addToast({
                type: 'verify-message-error',
                error: response.payload.error,
            }),
        );
    }
};
