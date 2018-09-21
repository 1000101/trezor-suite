/* @flow */
import * as TrezorConnectActions from 'actions/TrezorConnectActions';
import * as RouterActions from 'actions/RouterActions';
import { toggleDeviceDropdown } from 'actions/WalletActions';
import type { State } from 'flowtype';

export type StateProps = {
    connect: $ElementType<State, 'connect'>,
    accounts: $ElementType<State, 'accounts'>,
    router: $ElementType<State, 'router'>,
    deviceDropdownOpened: boolean,
    fiat: $ElementType<State, 'fiat'>,
    localStorage: $ElementType<State, 'localStorage'>,
    discovery: $ElementType<State, 'discovery'>,
    wallet: $ElementType<State, 'wallet'>,
    devices: $ElementType<State, 'devices'>,
    pending: $ElementType<State, 'pending'>,
}

export type DispatchProps = {
    toggleDeviceDropdown: typeof toggleDeviceDropdown,
    addAccount: typeof TrezorConnectActions.addAccount,
    acquireDevice: typeof TrezorConnectActions.acquire,
    forgetDevice: typeof TrezorConnectActions.forget,
    duplicateDevice: typeof TrezorConnectActions.duplicateDevice,
    gotoDeviceSettings: typeof RouterActions.gotoDeviceSettings,
    onSelectDevice: typeof RouterActions.selectDevice,
}

export type Props = StateProps & DispatchProps;