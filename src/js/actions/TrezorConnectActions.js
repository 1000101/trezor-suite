/* @flow */
'use strict';

import TrezorConnect, { UI, DEVICE, DEVICE_EVENT, UI_EVENT } from 'trezor-connect';
import * as ACTIONS from './index';
import * as ADDRESS from './constants/Address';
import * as TOKEN from './constants/Token';
import * as CONNECT from './constants/TrezorConnect';
import * as DISCOVERY from './constants/Discovery';
import * as NOTIFICATION from './constants/notification';

import HDKey from 'hdkey';
import EthereumjsUtil from 'ethereumjs-util';
import EthereumjsTx from 'ethereumjs-tx';

//import { getBalance } from '../services/Web3Service';
import { getBalance } from './Web3Actions';
import { getTransactionHistory } from '../services/EtherscanService';

import { push } from 'react-router-redux';

import { init as initWeb3, getNonce, getBalanceAsync, getTokenBalanceAsync } from './Web3Actions';

import type { Discovery } from '../reducers/DiscoveryReducer';
import { resolveAfter } from '../utils/promiseUtils';
import { getAccounts } from '../utils/reducerUtils';
import { findSelectedDevice, isSavedDevice } from '../reducers/TrezorConnectReducer';



export const init = (): any => {
    return async (dispatch, getState): Promise<void> => {
        // set listeners 
        TrezorConnect.on(DEVICE_EVENT, (event: DeviceMessage): void => {
            dispatch({
                type: event.type,
                device: event.data
            });
        });

        const version: Object = TrezorConnect.getVersion();
        if (version.type === 'library') {
            // handle UI events only if TrezorConnect isn't using popup
            TrezorConnect.on(UI_EVENT, (type: string, data: any): void => {
                // post event to reducers
                dispatch({
                    type,
                    data
                });
            });
        }

        try {
            await TrezorConnect.init({
                transport_reconnect: true,
            });

            setTimeout(() => {
                dispatch( initWeb3() );
            }, 2000)

        } catch (error) {
            dispatch({
                type: CONNECT.INITIALIZATION_ERROR,
                error
            })
        }
    }
}

// called after backend was initialized
// set listeners for connect/disconnect
export const postInit = (): any => {
    return (dispatch, getState): void => {
        const handleDeviceConnect = (device) => {
            dispatch( initConnectedDevice(device) );
        }
    
        // const handleDeviceDisconnect = (device) => {
        //     // remove addresses and discovery from state
        //     // dispatch( remove(device) );
        // }

        TrezorConnect.on(DEVICE.CONNECT, handleDeviceConnect);
        TrezorConnect.on(DEVICE.CONNECT_UNACQUIRED, handleDeviceConnect);

        // TrezorConnect.on(DEVICE.DISCONNECT, handleDeviceDisconnect);
        // TrezorConnect.on(DEVICE.CONNECT_UNACQUIRED, handleDeviceDisconnect);

        // possible race condition: 
        // devices were connected before Web3 initialized. force DEVICE.CONNECT event on them
        const { devices } = getState().connect;

        if (devices.length > 0) {
            const unacquired = devices.find(d => d.unacquired);
            if (unacquired) {
                handleDeviceConnect(unacquired);
            } else {
                const latest = devices.sort((a, b) => {
                    if (!a.ts || !b.ts) {
                        return -1;
                    } else {
                        return a.ts > b.ts ? 1 : -1;
                    }
                });

                console.log("LATEST", latest)
            }
        }
        for (let d of devices) {
            handleDeviceConnect(d);
        }
    }
}

export const initConnectedDevice = (device: any): any => {
    return (dispatch, getState): void => {

        const selected = findSelectedDevice(getState().connect);
        if (device.unacquired && selected && selected.path !== device.path && !selected.connected) {
            dispatch( onSelectDevice(device) );
        } else if (!selected) {
            dispatch( onSelectDevice(device) );
        }
    }
}

// selection from Aside dropdown
// or after acquiring device
export function onSelectDevice(device: any): any {
    return (dispatch, getState): void => {
        // || device.isUsedElsewhere
        if (device.unacquired) {
            dispatch( push(`/device/${ device.path }/acquire`) );
        } else if (device.features.bootloader_mode) {
            dispatch( push(`/device/${ device.path }/bootloader`) );
        } else if (device.instance) {
            dispatch( push(`/device/${ device.features.device_id }:${ device.instance }`) );
        } else {
            //dispatch( push(`/device/${ device.features.device_id }/coin/etc/address/0`) );
            dispatch( push(`/device/${ device.features.device_id }`) );
        }
    }
}

// TODO: as TrezorConnect method
const __getDeviceState = async (path, instance): Promise<any> => {
    return await TrezorConnect.getPublicKey({ 
        device: {
            path,
            instance
        },
        // selectedDevice: path, 
        instance: instance, 
        path: "m/1'/0'/0'", 
        confirmation: false 
    });
}

export const switchToFirstAvailableDevice = (): any => {
    return async (dispatch, getState): Promise<void> => {

        const { devices } = getState().connect;
        if (devices.length > 0) {
            // TODO: Priority:
            // 1. Unacquired
            // 2. First connected
            // 3. Saved with latest timestamp
            // 4. First from the list
            const unacquired = devices.find(d => d.unacquired);
            if (unacquired) {
                dispatch( initConnectedDevice(unacquired) );
            } else {
                const latest = devices.sort((a, b) => {
                    if (!a.ts || !b.ts) {
                        return -1;
                    } else {
                        return a.ts > b.ts ? 1 : -1;
                    }
                });
                dispatch( initConnectedDevice(devices[0]) );
            }

        } else {
            dispatch( push('/') );
            dispatch({
                type: CONNECT.SELECT_DEVICE,
                payload: null
            })
        }
    }
}

export const getSelectedDeviceState = (): any => {
    return async (dispatch, getState): Promise<void> => {
        const selected = findSelectedDevice(getState().connect);
        console.warn("init selected", selected)
        if (selected 
            && selected.connected
            && !selected.unacquired 
            && !selected.acquiring 
            && !selected.checksum) {

            const response = await __getDeviceState(selected.path, selected.instance);

            if (response && response.success) {
                dispatch({
                    type: CONNECT.AUTH_DEVICE,
                    device: selected,
                    checksum: response.data.xpub
                });
            } else {
                dispatch({
                    type: NOTIFICATION.ADD,
                    payload: {
                        type: 'error',
                        title: 'Authentification error',
                        message: response.data.error,
                        cancelable: true,
                        actions: [
                            {
                                label: 'Try again',
                                callback: () => {
                                    dispatch( getSelectedDeviceState() );
                                }
                            }
                        ]
                    }
                })
            }
        }
    }
}

export const deviceDisconnect = (device: any): any => {
    return async (dispatch, getState): Promise<void> => {

        if (!device || !device.features) return null;

        const selected = findSelectedDevice(getState().connect);
        if (selected && selected.features.device_id === device.features.device_id) {
            stopDiscoveryProcess(selected);
        }

        const affected = getState().connect.devices.filter(d => d.features && d.checksum && !d.remember && d.features.device_id === device.features.device_id);
        if (affected.length > 0) {
            dispatch({
                type: CONNECT.REMEMBER_REQUEST,
                device,
                allInstances: affected
            });
        }


        // if (selected && selected.checksum) {
        //     if (device.features && device.features.device_id === selected.features.device_id) {
        //         stopDiscoveryProcess(selected);
        //     } 
        // }

        

        // // stop running discovery process on this device
        // if (selected && selected.path === device.path){
        //     if (selected.checksum) {
        //         stopDiscoveryProcess(selected);
        //     }
        // }

        // // check if disconnected device was remembered before. 
        // // request modal if not 
        // const affected = getState().connect.devices.filter(d => d.path === device.path && d.checksum && !device.remember);
        

        // check if reload is needed
        if (!selected) {
            dispatch( switchToFirstAvailableDevice() );
        }
    }
}

export const coinChanged = (coin: ?string): any => {
    return (dispatch, getState): void => {
        const selected = findSelectedDevice(getState().connect);
        dispatch( stopDiscoveryProcess(selected) );

        if (coin) {
            dispatch( startDiscoveryProcess(selected, coin) );
        }
    }
}


export function acquire(): any {
    return async (dispatch, getState) => {

        const selected = findSelectedDevice(getState().connect);

        const saved = getState().connect.devices.map(d => {
            if (d.checksum) {
                return {
                    instance: d.instance,
                    checksum: d.checksum
                }
            } else {
                return null;
            }
        });

        //const response = await __acquire(selected.path, selected.instance);

        dispatch({
            type: CONNECT.START_ACQUIRING,
            device: selected
        });

        const response = await TrezorConnect.getFeatures({ 
            device: {
                path: selected.path,
            }
        });

        const selected2 = findSelectedDevice(getState().connect);
        dispatch({
            type: CONNECT.STOP_ACQUIRING,
            device: selected2
        });

        if (response && response.success) {
            dispatch({
                type: DEVICE.ACQUIRED,
                // checksum: response
            })
        } else {
            // TODO: handle invalid pin?
            console.log("-errror ack", response)

            dispatch({
                type: NOTIFICATION.ADD,
                payload: {
                    type: 'error',
                    title: 'Acquire device error',
                    message: response.data.error,
                    cancelable: true,
                    actions: [
                        {
                            label: 'Try again',
                            callback: () => {
                                dispatch(acquire())
                            }
                        }
                    ]
                }
            })
        }
    }
}

export const forgetDevice = (device: any) => {
    return (dispatch: any, getState: any): any => {
        
        // find accounts associated with this device
        const accounts: Array<any> = getState().accounts.find(a => a.checksum === device.checksum);


        // find discovery processes associated with this device
        const discovery: Array<any> = getState().discovery.find(d => d.checksum === device.checksum);

    }
}

// called from Aside - device menu (forget single instance)
export const forget = (device: any) => {
    return {
        type: CONNECT.FORGET_REQUEST,
        device
    };
}

export const duplicateDevice = (device: any) => {
    return async (dispatch: any, getState: any): Promise<void> => {
        dispatch({
            type: CONNECT.TRY_TO_DUPLICATE,
            device
        })
    }
}

export const onDuplicateDevice = () => {
    return async (dispatch: any, getState: any): Promise<void> => {
        const selected = findSelectedDevice(getState().connect);
        dispatch(onSelectDevice(selected));
    }
}

export const beginDiscoveryProcess = (device: any, coin: string): any => {
    return async (dispatch, getState) => {

        const { config } = getState().localStorage;
        const coinToDiscover = config.coins.find(c => c.symbol === coin);

        // TODO: validate device checksum
        // const checksum = await __acquire(device.path, device.instance);
        // if (checksum && checksum.success) {
        //     if (checksum.data.xpub !== device.checksum) {
        //         console.error("Incorrect checksum!");
        //         return;
        //     }
        // }

        // acquire and hold session
        // get xpub from TREZOR
        const response = await TrezorConnect.getPublicKey({ 
            device: {
                path: device.path,
                instance: device.instance,
                state: device.checksum
            }, 
            path: coinToDiscover.bip44, 
            confirmation: false,
            keepSession: true
        });

        if (!response.success) {
            // TODO: check message
            console.warn("DISCO ERROR", response)
            dispatch({
                type: NOTIFICATION.ADD,
                payload: {
                    type: 'error',
                    title: 'Discovery error',
                    message: response.data.error,
                    cancelable: true,
                    actions: [
                        {
                            label: 'Try again',
                            callback: () => {
                                dispatch(startDiscoveryProcess(device, coin))
                            }
                        }
                    ]
                }
            })
            return;
        }

        // TODO: check for interruption
        
        // TODO: handle response error
        const basePath: Array<number> = response.data.path;
        const hdKey = new HDKey();
        hdKey.publicKey = new Buffer(response.data.publicKey, 'hex');
        hdKey.chainCode = new Buffer(response.data.chainCode, 'hex');

        // send data to reducer
        dispatch({
            type: DISCOVERY.START,
            coin: coinToDiscover.shortcut,
            device,
            xpub: response.data.publicKey,
            basePath,
            hdKey,
        });

        dispatch( startDiscoveryProcess(device, coin) );
    }
}

export const discoverAddress = (device: any, discoveryProcess: Discovery): any => {
    return async (dispatch, getState) => {

        const derivedKey = discoveryProcess.hdKey.derive(`m/${discoveryProcess.accountIndex}`);
        const path = discoveryProcess.basePath.concat(discoveryProcess.accountIndex);
        const publicAddress: string = EthereumjsUtil.publicToAddress(derivedKey.publicKey, true).toString('hex');
        const ethAddress: string = EthereumjsUtil.toChecksumAddress(publicAddress);
        const coin = discoveryProcess.coin;

        dispatch({
            type: ADDRESS.CREATE,
            device,
            coin,
            index: discoveryProcess.accountIndex,
            path,
            address: ethAddress 
        });

        // TODO: check if address was created before

        // verify address with TREZOR
        const verifyAddress = await TrezorConnect.ethereumGetAddress({ 
            device: {
                path: device.path,
                instance: device.instance,
                state: device.checksum
            },
            address_n: path,
            showOnTrezor: false
        });
        if (discoveryProcess.interrupted) return;

        if (verifyAddress && verifyAddress.success) {
            //const trezorAddress: string = '0x' + verifyAddress.data.message.address;
            const trezorAddress: string = EthereumjsUtil.toChecksumAddress(verifyAddress.data.message.address);
            if (trezorAddress !== ethAddress) {
                // throw inconsistent state error
                console.warn("Inconsistent state", trezorAddress, ethAddress);

                dispatch({
                    type: NOTIFICATION.ADD,
                    payload: {
                        type: 'error',
                        title: 'Address validation error',
                        message: `Addresses are different. ${ trezorAddress } : ${ ethAddress }`,
                        cancelable: true,
                        actions: [
                            {
                                label: 'Try again',
                                callback: () => {
                                    dispatch(startDiscoveryProcess(device, discoveryProcess.coin))
                                }
                            }
                        ]
                    }
                });
                return;
            }
        } else {
            // handle TREZOR communication error
            dispatch({
                type: NOTIFICATION.ADD,
                payload: {
                    type: 'error',
                    title: 'Address validation error',
                    message: verifyAddress.data.error,
                    cancelable: true,
                    actions: [
                        {
                            label: 'Try again',
                            callback: () => {
                                dispatch(startDiscoveryProcess(device, discoveryProcess.coin))
                            }
                        }
                    ]
                }
            });
            return;
        }

        const web3instance = getState().web3.find(w3 => w3.coin === coin);
        
        const balance = await getBalanceAsync(web3instance.web3, ethAddress);
        if (discoveryProcess.interrupted) return;
        dispatch({
            type: ADDRESS.SET_BALANCE,
            address: ethAddress,
            balance: web3instance.web3.fromWei(balance.toString(), 'ether')
        });

        const userTokens = [];
        // const userTokens = [
        //     { symbol: 'T01', address: '0x58cda554935e4a1f2acbe15f8757400af275e084' },
        //     { symbol: 'Lahod', address: '0x3360d0ee34a49d9ac34dce88b000a2903f2806ee' },
        // ];

        for (let i = 0; i < userTokens.length; i++) {
            const tokenBalance = await getTokenBalanceAsync(web3instance.erc20, userTokens[i].address, ethAddress);
            if (discoveryProcess.interrupted) return;
            dispatch({
                type: TOKEN.SET_BALANCE,
                tokenName: userTokens[i].symbol,
                ethAddress: ethAddress,
                tokenAddress: userTokens[i].address,
                balance: tokenBalance.toString()
            })
        }

        const nonce = await getNonce(web3instance.web3, ethAddress);
        if (discoveryProcess.interrupted) return;
        dispatch({
            type: ADDRESS.SET_NONCE,
            address: ethAddress,
            nonce: nonce
        });

        const addressIsEmpty = nonce < 1 && !balance.greaterThan(0);

        if (!addressIsEmpty) {
            //dispatch( startDiscoveryProcess(device, discoveryProcess.coin) );
            dispatch( discoverAddress(device, discoveryProcess) );
        } else {
            // release acquired sesssion
            await TrezorConnect.getPublicKey({ 
                device: {
                    path: device.path,
                    instance: device.instance,
                    state: device.checksum
                }, 
                path: "m/44'/60'/0'/0",
                confirmation: false,
                keepSession: false
            });
            if (discoveryProcess.interrupted) return;

            dispatch({
                type: DISCOVERY.COMPLETE,
                device,
                coin
            });
        }
    }
}

export function startDiscoveryProcess(device: any, coin: string, ignoreCompleted?: boolean): any {
    return (dispatch, getState) => {

        const selected = findSelectedDevice(getState().connect);
        if (!selected) {
            // TODO: throw error
            console.error("Start discovery: no selected device", device)
            return;
        } else if (selected.path !== device.path) {
            console.error("Start discovery: requested device is not selected", device, selected)
            return;
        } else if (!selected.checksum) {
            console.warn("Start discovery: Selected device wasn't authenticated yet...")
            return;
        }

        const discovery = getState().discovery;
        let discoveryProcess: ?Discovery = discovery.find(d => d.checksum === device.checksum && d.coin === coin);

        if (!selected.connected && (!discoveryProcess || !discoveryProcess.completed)) {
            dispatch({
                type: DISCOVERY.WAITING,
                device,
                coin
            });
            return;
        }

        if (!discoveryProcess) {
            dispatch( beginDiscoveryProcess(device, coin) );
            return;
        } else {
            if (discoveryProcess.completed && !ignoreCompleted) {
                dispatch({
                    type: DISCOVERY.COMPLETE,
                    device,
                    coin
                });
            } else if (discoveryProcess.interrupted || discoveryProcess.waitingForDevice) {
                // discovery cycle was interrupted
                // start from beginning 
                dispatch( beginDiscoveryProcess(device, coin) );
            } else {
                dispatch( discoverAddress(device, discoveryProcess) );
            }
        }
    }
}

export const restoreDiscovery = (): any => {
    return (dispatch, getState): void => {
        const selected = findSelectedDevice(getState().connect);

        if (selected && selected.connected && !selected.unacquired) {
            const discoveryProcess: ?Discovery = getState().discovery.find(d => d.checksum === selected.checksum && d.waitingForDevice);
            if (discoveryProcess) {
                dispatch( startDiscoveryProcess(selected, discoveryProcess.coin) );
            }
        }
    }
}

// there is no discovery process but it should be
// this is possible race condition when coin was changed in url but device wasn't authenticated yet
// try to discovery after CONNECT.AUTH_DEVICE action
export const checkDiscoveryStatus = (): any => {
    return (dispatch, getState): void => {
        const selected = findSelectedDevice(getState().connect);
        if (!selected) return;

        const urlParams = getState().router.location.params;
        if (urlParams.coin) {
            const discoveryProcess: ?Discovery = getState().discovery.find(d => d.checksum === selected.checksum && d.coin === urlParams.coin);
            if (!discoveryProcess) {
                dispatch( startDiscoveryProcess(selected, urlParams.coin) );
            }
        }
    }
}



export function stopDiscoveryProcess(device: any): any {

    // TODO: release devices session
    // corner case swtich /eth to /etc (discovery start stop - should not be async)
    return {
        type: DISCOVERY.STOP,
        device
    }
}

export function addAddress(): any {
    return (dispatch, getState) => {
        const selected = findSelectedDevice(getState().connect);
        dispatch( startDiscoveryProcess(selected, getState().router.location.params.coin, true) ); // TODO: coin nicer
    }
}
