/* @flow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import colors from 'config/colors';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { AccountMenu, CoinMenu, DeviceSelect, DeviceDropdown } from './NavigationMenu';
import StickyContainer from './StickyContainer';

const TransitionGroupWrapper = styled(TransitionGroup)`
    width: 640px;
`;

const TransitionContentWrapper = styled.div`
    width: 320px;
    display: inline-block;
    vertical-align: top;
`;

const StickyBottom = styled.div`
    position: fixed;
    bottom: 0;
    background: ${colors.MAIN};
    border-right: 1px solid ${colors.DIVIDER};
`;

const MenuWrapper = styled.div``;

const Help = styled.div``;

class LeftNavigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animationType: null,
            shouldRenderDeviceSelection: false,
        };
    }

    componentDidMount() {
        this.setState({
            animationType: null,
            shouldRenderDeviceSelection: false,
        })
    }

    componentWillReceiveProps() {
        const { deviceDropdownOpened } = this.props;
        const { selectedDevice } = this.props.wallet;
        const { network } = this.props.location.state;
        const hasFeatures = selectedDevice && selectedDevice.features;
        const deviceReady = hasFeatures && !selectedDevice.features.bootloader_mode && selectedDevice.features.initialized;

        if (deviceDropdownOpened) {
            this.setState({ shouldRenderDeviceSelection: true });
        } else if (network) {
            this.setState({
                shouldRenderDeviceSelection: false,
                animationType: 'slide-left',
            });
        } else if (deviceReady) {
            this.setState({
                shouldRenderDeviceSelection: false,
                animationType: 'slide-right',
            });
        }
    }

    // TODO: refactor to transition component for reuse of transitions
    getMenuTransition(children) {
        return (
            <TransitionGroupWrapper component="div" className="transition-container">
                <CSSTransition
                    key={this.state.animationType}
                    onExit={() => { window.dispatchEvent(new Event('resize')); }}
                    onExited={() => window.dispatchEvent(new Event('resize'))}
                    in
                    out
                    classNames={this.state.animationType}
                    appear={false}
                    timeout={300}
                >
                    <TransitionContentWrapper>
                        {children}
                    </TransitionContentWrapper>
                </CSSTransition>
            </TransitionGroupWrapper>);
    }

    shouldRenderAccounts() {
        const { selectedDevice } = this.props.wallet;
        return selectedDevice 
            && this.props.location 
            && this.props.location.state 
            && this.props.location.state.network 
            && !this.state.shouldRenderDeviceSelection 
            && this.state.animationType === 'slide-left';
    }

    shouldRenderCoins() {
        return !this.state.shouldRenderDeviceSelection && this.state.animationType === 'slide-right';
    }

    render() {
        return (
            <StickyContainer
                location={this.props.location.pathname}
                deviceSelection={this.props.deviceDropdownOpened}
            >
                <DeviceSelect {...this.props} />
                <MenuWrapper>
                    {this.state.shouldRenderDeviceSelection && this.getMenuTransition(<DeviceDropdown {...this.props} />) }
                    {this.shouldRenderAccounts() && this.getMenuTransition(<AccountMenu {...this.props} />)}
                    {this.shouldRenderCoins() && <CoinMenu {...this.props} />}
                </MenuWrapper>
                <StickyBottom>
                    <Help className="help">
                        <a href="https://trezor.io/support/" target="_blank" rel="noreferrer noopener">Need help?</a>
                    </Help>
                </StickyBottom>
            </StickyContainer>
        );
    }
}

LeftNavigation.propTypes = {
    selectedDevice: PropTypes.object,
    wallet: PropTypes.object,
    deviceDropdownOpened: PropTypes.bool,
};


export default LeftNavigation;
