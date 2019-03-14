/* @flow */

import * as React from 'react';
import colors from 'config/colors';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { Route, withRouter } from 'react-router-dom';
import { getPattern } from 'support/routes';

import type { MapStateToProps, MapDispatchToProps } from 'react-redux';
import type { State } from 'flowtype';

import type { WalletAction } from 'actions/WalletActions';
import { toggleSidebar } from 'actions/WalletActions';
import { bindActionCreators } from 'redux';

import Header from 'components/Header';
import Footer from 'components/Footer';
import ModalContainer from 'components/modals/Container';
import AppNotifications from 'components/notifications/App';
import ContextNotifications from 'components/notifications/Context';

import { SCREEN_SIZE } from 'config/variables';

import Log from 'components/Log';

import LeftNavigation from './components/LeftNavigation/Container';
import TopNavigationAccount from './components/TopNavigationAccount';
import TopNavigationDeviceSettings from './components/TopNavigationDeviceSettings';
import TopNavigationWalletSettings from './components/TopNavigationWalletSettings';

type StateProps = {
    wallet: $ElementType<State, 'wallet'>,
    children?: React.Node,
};

type DispatchProps = {
    toggleSidebar: WalletAction,
};

type OwnProps = {};

export type Props = StateProps & DispatchProps;

const AppWrapper = styled.div`
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${colors.BACKGROUND};

    &.resized {
        min-height: 680px;
    }
`;

const WalletWrapper = styled.div`
    width: 100%;
    max-width: 1170px;
    margin: 0 auto;
    flex: 1;
    background: ${colors.WHITE};
    display: flex;
    flex-direction: row;
    border-radius: 4px 4px 0px 0px;
    margin-top: 32px;

    @media screen and (max-width: 1170px) {
        border-radius: 0px;
        margin-top: 0px;
    }
`;

const MainContent = styled.article`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        ${props =>
            props.preventBgScroll &&
            css`
                position: fixed;
                width: 100%;
                min-height: calc(100vh - 52px);
            `}
    }

    @media screen and (max-width: 1170px) {
        border-top-right-radius: 0px;
        border-top-left-radius: 0px;
    }
`;

const Navigation = styled.nav`
    height: 70px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    background: ${colors.WHITE};
    position: relative;
`;

const Body = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
`;

const Wallet = (props: Props) => (
    <AppWrapper>
        <Header
            sidebarEnabled={!!props.wallet.selectedDevice}
            sidebarOpened={props.wallet.showSidebar}
            toggleSidebar={props.toggleSidebar}
        />
        <AppNotifications />
        <WalletWrapper>
            {props.wallet.selectedDevice && <LeftNavigation />}
            <MainContent preventBgScroll={props.wallet.showSidebar}>
                <Navigation>
                    <Route
                        path={getPattern('wallet-account-summary')}
                        component={TopNavigationAccount}
                    />
                    <Route
                        path={getPattern('wallet-device-settings')}
                        component={TopNavigationDeviceSettings}
                    />
                    <Route
                        path={getPattern('wallet-settings')}
                        component={TopNavigationWalletSettings}
                    />
                </Navigation>
                <ContextNotifications />
                <Log />
                <Body>{props.children}</Body>
                <Footer />
            </MainContent>
        </WalletWrapper>
        <ModalContainer />
    </AppWrapper>
);

const mapStateToProps: MapStateToProps<State, OwnProps, StateProps> = (
    state: State
): StateProps => ({
    wallet: state.wallet,
});

const mapDispatchToProps: MapDispatchToProps<Dispatch, OwnProps, DispatchProps> = (
    dispatch: Dispatch
): DispatchProps => ({
    toggleSidebar: bindActionCreators(toggleSidebar, dispatch),
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Wallet)
);
