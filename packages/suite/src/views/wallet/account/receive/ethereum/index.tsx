import React from 'react';
import styled from 'styled-components';
import Title from '@wallet-components/Title';

import QrCode from '@wallet-components/QrCode';
import VerifyAddressInput from '@wallet-components/inputs/VerifyAddress';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { ReceiveProps } from '../index';

const Wrapper = styled.div``;

const EthereumReceive = ({ className, ...props }: ReceiveProps) => {
    return (
        <Wrapper>
            <Title>
                <FormattedMessage {...messages.TR_RECEIVE_ETHEREUM_OR_TOKENS} />
            </Title>
            <VerifyAddressInput
                device={props.device}
                accountPath={props.account.path}
                accountAddress={props.account.descriptor}
                isAddressHidden={props.isAddressHidden}
                isAddressVerified={props.isAddressVerified}
                isAddressUnverified={props.isAddressUnverified}
                isAddressVerifying={props.isAddressVerifying}
                showAddress={props.showAddress}
            />
            {(props.isAddressVerified || props.isAddressUnverified) &&
                !props.isAddressVerifying && (
                    <QrCode value={props.account.descriptor} accountPath={props.account.path} />
                )}
        </Wrapper>
    );
};

export default EthereumReceive;
