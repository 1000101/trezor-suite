/* @flow */

import WSWebSocket from 'ws';
import EventEmitter from 'events';
import Promise from 'es6-promise';
import WS from '../../utils/ws';

declare function wscallback(result: {}): void

export default class Socket extends EventEmitter {
    _url: string;
    _ws: ?WSWebSocket = null;
    _state: number = 0;

    _messageID: number = 0;
    _pendingMessages: { [string]: wscallback } = {};
    _subscriptions: { [string]: wscallback } = {};
    _subscribeNewBlockId: string = '';
    _subscribeAddressesId: string = '';

    _send(method: string, params: {}, callback: wscallback): string {
        const id = this._messageID.toString();
        this._messageID++;
        this._pendingMessages[id] = callback;
        const req = {
            id,
            method,
            params
        }
        this._ws.send(JSON.stringify(req));
        return id;
    }

    _subscribe(method: string, params: {}, callback: wscallback): string {
        const id = this._messageID.toString();
        this._messageID++;
        this._subscriptions[id] = callback;
        const req = {
            id,
            method,
            params
        }
        this._ws.send(JSON.stringify(req));
        return id;
    }

    _unsubscribe(method: string, id: string, params: {}, callback: wscallback): string {
        delete this._subscriptions[id];
        this._pendingMessages[id] = callback;
        const req = {
            id,
            method,
            params
        }
        this._ws.send(JSON.stringify(req));
        return id;
    }

    _onmessage(m: string) {
        console.log('resp ' + m);
        const resp = JSON.parse(m);
        const f = this._pendingMessages[resp.id];
        if (f != undefined) {
            delete this._pendingMessages[resp.id];
            f(resp.data);
        } else {
            const s = this._subscriptions[resp.id];
            if (s != undefined) {
                s(resp.data);
            }
            else {
                console.log('unkown response ' + resp.id);
            }
        }
    }

    _createWebSocket(): WSWebSocket {
        const websocket = new WSWebSocket(this._url);
        // we will have a listener for each outstanding request,
        // so we have to raise the limit (the default is 10)
        if (typeof websocket.setMaxListeners === 'function') {
            websocket.setMaxListeners(Infinity)
        }
        return websocket;
    }

    _onOpenError(err: Error) {
        console.error('OpenError', err)
    }

    constructor(url: string) {
        super();
        this.setMaxListeners(Infinity);
        if (url.startsWith('http')) {
            url = url.replace('http', 'ws');
        }
        if (!url.endsWith('/websocket')) {
            url += '/websocket';
        }
        this._url = url;
    }


    connect(): Promise {
        //this._clearReconnectTimer()
        return new Promise((resolve, reject) => {
            if (!this._url) {
                reject(new Error('Cannot connect because no server was specified'));
            }
            if (this._state === WebSocket.OPEN) {
                resolve()
            } else if (this._ws && this._state === WebSocket.CONNECTING) {
                this._ws.once('open', resolve)
            } else {
                const ws = this._createWebSocket();
                ws.once('error', this._onOpenError.bind(this));
                ws.on('message', this._onmessage.bind(this));

                // this._onUnexpectedCloseBound = this._onUnexpectedClose.bind(this, true, resolve, reject)
                //this._ws.once('close', this._onUnexpectedCloseBound)
                ws.on('open', resolve);
                ws.on('close', () => {
                    this.emit('disconnected');
                });
                this._ws = ws;
                this._messageID = 0;
                this._pendingMessages = {};
                this._subscriptions = {};
                this._subscribeNewBlockId = '';
                this._subscribeAddressesId = '';
            }
        });
    }

    disconnect(): Promise {
        return new Promise(() => {
            this._ws.close();
        });
    }

    isConnected(): boolean {
        return this._ws && this._ws.readyState == WS.OPEN;
    }

    getServerInfo() {
        return new Promise((resolve) => {
            this._send('getInfo', {}, response => {
                resolve({
                    block: response.bestheight,
                    // network: response.result.network,
                    networkName: response.name,
                });
            });
        });
    }

    subscribeBlock(): Promise {
        return new Promise((resolve) => {
            if (this._subscribeNewBlockId) {
                delete this._subscriptions[this._subscribeNewBlockId];
                this._subscribeNewBlockId = '';
            }
            this._subscribeNewBlockId = this._subscribe('subscribeNewBlock', {}, result => {
                console.log('newBlock', result)
                this.emit('block', {
                    block: result.height,
                    hash: result.hash,
                });
            });
        });
    }

    unsubscribeBlock(): Promise {
        return new Promise((resolve) => {
            if (this._subscribeNewBlockId) {
                this._unsubscribe('unsubscribeNewBlock', this._subscribeNewBlockId, {}, result => {
                    this._subscribeNewBlockId = '';
                });
            }
        });
    }

    subscribeAddresses(addresses: Array<string>): Promise {
        return new Promise((resolve) => {
            const method = 'subscribeAddresses';
            const params = {
                addresses
            };
            if (this._subscribeAddressesId) {
                delete this._subscriptions[this._subscribeAddressesId];
                this._subscribeAddressesId = "";
            }
            this._subscribeAddressesId = this._subscribe(method, params, result => {
                console.log('newTxAddress', result)
                this.emit('notification', {
                    result: result,
                });
            });
        });
    }

    unsubscribeAddresses(addresses: Array<string>): Promise {
        return new Promise((resolve) => {
            if (this._subscribeAddressesId) {
                this._unsubscribe('unsubscribeAddresses', this._subscribeAddressesId, {}, result => {
                    this._subscribeAddressesId = '';
                });
            }
        });
    }
}