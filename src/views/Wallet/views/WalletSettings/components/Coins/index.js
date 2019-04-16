/* @flow */
import styled from 'styled-components';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FONT_SIZE } from 'config/variables';
import coins from 'constants/coins';

import { colors, Switch, CoinLogo } from 'trezor-ui-components';
import l10nMessages from '../../index.messages';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.div`
    display: flex;
    color: ${colors.TEXT_SECONDARY};
    align-items: center;
`;

const Row = styled.div`
    display: flex;
    flex-direction: column;
`;

const Content = styled.div`
    display: flex;
    margin-top: 20px;
    flex-direction: column;
`;

const CoinRow = styled.div`
    height: 50px;
    align-items: center;
    display: flex;
    border-bottom: 1px solid ${colors.DIVIDER};
    color: ${colors.TEXT_PRIMARY};
    justify-content: space-between;

    &:first-child {
        border-top: 1px solid ${colors.DIVIDER};
    }
`;

const Left = styled.div`
    display: flex;
    align-items: center;
`;

const Right = styled.div``;

const Name = styled.div`
    display: flex;
    font-size: ${FONT_SIZE.BIG};
    color: ${colors.TEXT_PRIMARY};
`;

const LogoWrapper = styled.div`
    display: flex;
    width: 45px;
    justify-content: center;
    align-items: center;
`;

const CoinsSettings = (props: Props) => (
    <Wrapper>
        <Row>
            <Label>
                <FormattedMessage {...l10nMessages.TR_VISIBLE_COINS} />
            </Label>
            <Content>
                {props.networks
                    .filter(network => !network.isHidden)
                    .map(network => (
                        <CoinRow key={network.shortcut}>
                            <Left>
                                <LogoWrapper>
                                    <CoinLogo height="23" network={network.shortcut} />
                                </LogoWrapper>
                                <Name>{network.name}</Name>
                            </Left>
                            <Right>
                                <Switch
                                    onChange={isVisible => {
                                        props.handleCoinVisibility(network.shortcut, !isVisible);
                                    }}
                                    checked={props.hiddenCoins.includes(network.shortcut)}
                                />
                            </Right>
                        </CoinRow>
                    ))}
                {coins
                    .sort((a, b) => a.order - b.order)
                    .map(network => (
                        <CoinRow key={network.id}>
                            <Left>
                                <LogoWrapper>
                                    <CoinLogo height="23" network={network.id} />
                                </LogoWrapper>
                                <Name>{network.coinName}</Name>
                            </Left>
                            <Right>
                                <Switch
                                    onChange={isVisible => {
                                        props.handleCoinVisibility(network.id, !isVisible);
                                    }}
                                    checked={props.hiddenCoins.includes(network.id)}
                                />
                            </Right>
                        </CoinRow>
                    ))}
            </Content>
        </Row>
    </Wrapper>
);

export default CoinsSettings;
