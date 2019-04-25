/* @flow */
import { defineMessages } from 'react-intl';
import type { Messages } from 'flowtype/npm/react-intl';

const definedMessages: Messages = defineMessages({
    TR_AMOUNT_IS_NOT_SET: {
        id: 'TR_AMOUNT_IS_NOT_SET',
        defaultMessage: 'Amount is not set',
    },
    TR_AMOUNT_IS_NOT_A_NUMBER: {
        id: 'TR_AMOUNT_IS_NOT_A_NUMBER',
        defaultMessage: 'Amount is not a number',
    },
    TR_MAXIMUM_DECIMALS_ALLOWED: {
        id: 'TR_AMOUNT_IS_NOT_A_NUMBER',
        defaultMessage: 'Maximum {decimals} decimals allowed',
    },
    TR_NOT_ENOUGH_FUNDS_TO_COVER_TRANSACTION: {
        id: 'TR_NOT_ENOUGH_FUNDS_TO_COVER_TRANSACTION',
        defaultMessage: 'Not enough {networkSymbol} to cover transaction fee',
    },
    TR_NOT_ENOUGH_FUNDS: {
        id: 'TR_NOT_ENOUGH_FUNDS',
        defaultMessage: 'Not enough funds',
    },
    TR_AMOUNT_IS_TOO_LOW: {
        id: 'TR_AMOUNT_IS_TOO_LOW',
        defaultMessage: 'Amount is too low',
    },
    TR_ADDRESS_IS_NOT_SET: {
        id: 'TR_ADDRESS_IS_NOT_SET',
        defaultMessage: 'Address is not set',
    },
    TR_ADDRESS_IS_NOT_VALID: {
        id: 'TR_ADDRESS_IS_NOT_VALID',
        defaultMessage: 'Address is not valid',
    },
    TR_ADDRESS_CHECKSUM_IS_NOT_VALID: {
        id: 'TR_ADDRESS_CHECKSUM_IS_NOT_VALID',
        defaultMessage: 'Address checksum is not valid',
    },
    TR_GAS_LIMIT_IS_NOT_SET: {
        id: 'TR_GAS_LIMIT_IS_NOT_SET',
        defaultMessage: 'Gas limit is not set',
    },
    TR_GAS_LIMIT_IS_NOT_A_NUMBER: {
        id: 'TR_GAS_LIMIT_IS_NOT_A_NUMBER',
        defaultMessage: 'Gas limit is not a number',
    },
    TR_GAS_LIMIT_IS_TOO_LOW: {
        id: 'TR_GAS_LIMIT_IS_TOO_LOW',
        defaultMessage: 'Gas limit is too low',
    },
    TR_GAS_LIMIT_IS_BELOW_RECOMMENDED: {
        id: 'TR_GAS_LIMIT_IS_BELOW_RECOMMENDED',
        defaultMessage: 'Gas limit is below recommended',
    },
});

export default definedMessages;
