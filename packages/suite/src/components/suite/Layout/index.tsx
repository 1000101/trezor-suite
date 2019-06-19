import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';

import { fetchLocale } from '@suite-actions/languageActions.useNative';
import { toggleSidebar } from '@suite-actions/suiteActions';
import { Header as CommonHeader, LanguagePicker, colors } from '@trezor/components';
import Footer from '@suite-components/Footer';
import SuiteHeader from '@suite-components/SuiteHeader';
import suiteConfig from '@suite-config/index';
import Log from '@suite/components/suite/Log';
import Router from '@suite-support/Router';
import ErrorBoundary from '@suite-support/ErrorBoundary';
import { State } from '@suite-types/index';
import { TREZOR_URL, SUPPORT_URL, WIKI_URL, BLOG_URL } from '@suite/constants/urls';
import {
    HEADER_HEIGHT,
    HEADER_HEIGHT_UNIT,
    FOOTER_HEIGHT,
    FOOTER_HEIGHT_UNIT,
} from '@suite/constants/suite/layout';
import l10nMessages from './index.messages';

const PageWrapper = styled.div<Pick<Props, 'isLanding'>>`
    display: flex;
    flex: 1;
    flex-direction: column;
    background: ${props => (props.isLanding ? colors.LANDING : 'none')};
    align-items: center;
`;

const AppWrapper = styled.div<Pick<Props, 'isLanding'>>`
    width: 100%;
    max-width: 1170px;
    min-height: calc(
        100vh -
            (
                ${`${HEADER_HEIGHT}${HEADER_HEIGHT_UNIT}`} +
                    ${`${FOOTER_HEIGHT}${FOOTER_HEIGHT_UNIT}`}
            )
    );
    margin: 0 auto;
    flex: 1;
    background: ${props => (props.isLanding ? 'none' : colors.WHITE)};
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 4px 4px 0px 0px;
    margin-top: 30px;
    height: 100%;
    overflow-y: hidden;

    @media screen and (max-width: 1170px) {
        border-radius: 0px;
        margin-top: 0px;
    }
`;

interface Props {
    router: State['router'];
    suite: State['suite'];
    devices: State['devices'];
    fetchLocale: typeof fetchLocale;
    toggleSidebar: () => void;
    isLanding?: boolean;
    showSuiteHeader?: boolean;
    children: React.ReactNode;
}

const Layout = (props: Props & InjectedIntlProps) => (
    <PageWrapper isLanding={props.isLanding}>
        <Router />
        <CommonHeader
            sidebarOpened={props.suite.showSidebar}
            toggleSidebar={props.toggleSidebar}
            togglerOpenText={<FormattedMessage {...l10nMessages.TR_MENU} />}
            togglerCloseText={<FormattedMessage {...l10nMessages.TR_MENU_CLOSE} />}
            sidebarEnabled={!props.isLanding}
            rightAddon={
                <LanguagePicker
                    language={props.suite.language}
                    languages={suiteConfig.languages}
                    onChange={option => {
                        props.fetchLocale(option.value);
                    }}
                />
            }
            links={[
                {
                    href: TREZOR_URL,
                    title: 'Trezor',
                },
                {
                    href: WIKI_URL,
                    title: props.intl.formatMessage(l10nMessages.TR_WIKI),
                },
                {
                    href: BLOG_URL,
                    title: props.intl.formatMessage(l10nMessages.TR_BLOG),
                },
                {
                    href: SUPPORT_URL,
                    title: props.intl.formatMessage(l10nMessages.TR_SUPPORT),
                },
            ]}
        />
        <ErrorBoundary>
            <AppWrapper isLanding={props.isLanding}>
                <>
                    <Log />
                    {props.showSuiteHeader && <SuiteHeader />}
                    {props.children}
                </>
            </AppWrapper>
        </ErrorBoundary>
        <Footer isLanding={props.isLanding} />
    </PageWrapper>
);

const mapStateToProps = (state: State) => ({
    router: state.router,
    suite: state.suite,
    devices: state.devices,
});

export default injectIntl(
    connect(
        mapStateToProps,
        dispatch => ({
            fetchLocale: bindActionCreators(fetchLocale, dispatch),
            toggleSidebar: bindActionCreators(toggleSidebar, dispatch),
        }),
    )(Layout),
);
