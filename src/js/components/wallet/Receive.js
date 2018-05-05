/* @flow */
'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Tooltip from 'rc-tooltip';
import { QRCode } from 'react-qr-svg';

import AbstractAccount from './account/AbstractAccount';
import { Notification } from '../common/Notification';
import { default as ReceiveActions } from '../../actions/ReceiveActions';
import { default as AbstractAccountActions } from '../../actions/AbstractAccountActions';

import type { MapStateToProps, MapDispatchToProps } from 'react-redux';
import type { State, Dispatch } from '../../flowtype';
import type { StateProps as BaseStateProps, DispatchProps as BaseDispatchProps } from './account/AbstractAccount';

import type { AccountState } from './account/AbstractAccount';

type OwnProps = { }

type StateProps = BaseStateProps & {
    receive: $ElementType<State, 'receive'>,
}

type DispatchProps = BaseDispatchProps & {
    showAddress: typeof ReceiveActions.showAddress
}

type Props = StateProps & DispatchProps;


class Receive extends AbstractAccount<Props> {
    render() {
        return super.render() || _render(this.props, this.state);
    }
}

const _render = (props: Props, state: AccountState): React$Element<string> => {

    const {
        device,
        account,
        discovery,
        deviceStatusNotification
    } = state;

    const {
        addressVerified,
        addressUnverified,
    } = props.receive;

    if (!device || !account || !discovery) return <section></section>;

    let qrCode = null;
    let address = `${account.address.substring(0, 20)}...`;
    let className = 'address hidden';
    let button = (
        <button disabled={ !discovery.completed } onClick={ event => props.showAddress(account.addressPath) }>
            <span>Show full address</span>
        </button>
    );

    if (addressVerified || addressUnverified) {
        qrCode = (
            <QRCode
                className="qr"
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="Q"
                style={{ width: 256 }}
                value={ account.address }
                />
        );
        address = account.address;
        className = addressUnverified ? 'address unverified' : 'address';

        const tooltip = addressUnverified ?
            (<div>Unverified address.<br/>{ device.connected && device.available ? 'Show on TREZOR' : 'Connect your TREZOR to verify it.' }</div>)
            :
            (<div>{ device.connected ? 'Show on TREZOR' : 'Connect your TREZOR to verify address.' }</div>);

        button = (
            <Tooltip
                arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
                overlay={ tooltip }
                placement="bottomRight">
                <button className="white" onClick={ event => props.showAddress(account.addressPath) }>
                    <span></span>
                </button>
            </Tooltip>
        );
    }
    
    return (
        <section className="receive">
            { deviceStatusNotification }
            <h2>Receive Ethereum or tokens</h2>
            
            <div className={ className }>
                <div className="value">
                    { address }
                </div>
                { button }
            </div>
            { qrCode }
        </section>
    );


}

const mapStateToProps: MapStateToProps<State, OwnProps, StateProps> = (state: State, own: OwnProps): StateProps => {
    return {
        abstractAccount: state.abstractAccount,
        devices: state.connect.devices,
        accounts: state.accounts,
        discovery: state.discovery,
        receive: state.receive
    };
}

const mapDispatchToProps: MapDispatchToProps<Dispatch, OwnProps, DispatchProps> = (dispatch: Dispatch): DispatchProps => {
    return {
        abstractAccountActions: bindActionCreators(AbstractAccountActions, dispatch),
        initAccount: bindActionCreators(ReceiveActions.init, dispatch), 
        updateAccount: bindActionCreators(ReceiveActions.update, dispatch),
        disposeAccount: bindActionCreators(ReceiveActions.dispose, dispatch),
        showAddress: bindActionCreators(ReceiveActions.showAddress, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Receive);