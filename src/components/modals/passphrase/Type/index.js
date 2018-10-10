/* @flow */

import React from 'react';
import Icon from 'components/Icon';
import colors from 'config/colors';
import icons from 'config/icons';
import styled from 'styled-components';
import { H3 } from 'components/Heading';
import P from 'components/Paragraph';
import { CONTEXT_DEVICE } from 'actions/constants/modal';

import type { Props } from 'components/modals/index';

const Wrapper = styled.div`
    width: 360px;
    padding: 24px 48px;
`;

const Header = styled.div``;

const Confirmation = (props: Props) => {
    if (props.modal.context !== CONTEXT_DEVICE) return null;
    const { device } = props.modal;

    return (
        <Wrapper>
            <Header>
                <Icon icon={icons.T1} size={60} color={colors.TEXT_SECONDARY} />
                <H3>Complete the action on { device.label } device</H3>
                <P isSmaller>If you enter a wrong passphrase, you will not unlock the desired hidden wallet.</P>
            </Header>
        </Wrapper>
    );
};

export default Confirmation;