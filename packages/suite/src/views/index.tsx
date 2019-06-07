import React, { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Text } from 'react-native';
import { isWebUSB } from '@suite/utils/device';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import { colors, Button, Loader } from '@trezor/components';
import { getRoute } from '@suite/utils/router';

import InstallBridge from '@suite-views/bridge';

import ConnectDevice from '@suite-components/landing/ConnectDevice';

import { State } from '@suite/types';
import { goto } from '@suite-actions/routerActions';
import VersionPage from '@suite-views/version';
import l10nCommonMessages from '@suite/views/index.messages';
import AcquireDevice from '@suite-components/AcquireDevice';
import DeviceMenu from '@suite-components/DeviceMenu';
import Layout from '@suite-components/Layout';


interface Props {
    router: State['router'];
    suite: State['suite'];
    devices: State['devices'];
    goto: typeof goto;
    children: React.ReactNode;
}

const SuiteHeader = styled.div`
    display: flex;
    padding: 0px 15px;
    border-bottom: 1px solid ${colors.BODY};
    border-radius: 4px 4px 0px 0px;
    align-items: center;
    box-sizing: border-box;
    justify-content: space-between;
    width: 100%;
    background: ${colors.WHITE};
    max-width: 1170px;
    flex-direction: row;
`;

const Left = styled.div``;
const Right = styled.div``;
const Link = styled.div`
    cursor: pointer;
`;

const Index: FunctionComponent<Props> = props => {
    const { suite, router } = props;

    if (router.pathname === '/version') {
        return (
            <Layout isLanding>
                <VersionPage />
            </Layout>
        );
    }

    // connect was initialized, but didn't emit "TRANSPORT" event yet (it could take a while)
    if (!suite.transport) {
        // TODO: check in props.router if current url needs device or transport at all (settings, install bridge, import etc.)
        return (
            <Layout isLanding>
                <Loader text="Loading" size={100} strokeWidth={1} />
            </Layout>
        );
    }

    // onboarding handles TrezorConnect events by itself
    // and display proper view (install bridge, connect/disconnect device etc.)
    if (router.app === 'onboarding') {
        return <Layout>{props.children}</Layout>;
    }

    // no available transport
    if (!suite.transport.type) {
        return (
            <Layout>
                <InstallBridge />
            </Layout>
        );
    }

    // no available device
    if (!suite.device) {
        return (
            <Layout isLanding>
                <ConnectDevice showWebUsb={isWebUSB(suite.transport)} />
            </Layout>
        );
    }

    // connected device is in unexpected mode
    if (suite.device.type !== 'acquired') {
        // TODO: render "acquire device" or "unreadable device" page
        return (
            <Layout>
                <AcquireDevice />
            </Layout>
        );
    }

    if (suite.device.mode !== 'normal') {
        // TODO: render "unexpected mode" page (bootloader, seedless, not initialized)
        // not-initialized should redirect to onboarding
        return (
            <Layout>
                <Text>Device is in unexpected mode: {suite.device.mode}</Text>
                <Text>Transport: {suite.transport.type}</Text>
            </Layout>
        );
    }

    // TODO: render requested view
    return (
        <Layout>
            <SuiteHeader>
                <Left>
                    <DeviceMenu data-test="@suite/device_selection" />
                </Left>
                <Right>
                    <Button onClick={() => goto(getRoute('suite-device-settings'))}>
                        <FormattedMessage {...l10nCommonMessages.TR_DEVICE_SETTINGS} />
                    </Button>
                </Right>
            </SuiteHeader>
            {props.children}
        </Layout>
    );
};

const mapStateToProps = (state: State) => ({
    router: state.router,
    suite: state.suite,
    devices: state.devices,
});

export default connect(
    mapStateToProps,
    dispatch => ({
        goto: bindActionCreators(goto, dispatch),
    }),
)(Index);
