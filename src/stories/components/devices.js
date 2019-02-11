import Invalid from 'components/Invalid';
import Passphrase from 'components/Passphrase';
import Pin from 'components/Pin';
import React from 'react';
import Transaction from 'components/Transaction';
import { storiesOf } from '@storybook/react';

const device = {
    label: 'Test',
    path: 'test',
};

storiesOf('Device', module)
    .addWithJSX('Pin', () => (
        <Pin
            device={device}
            onPinSubmit={() => {}}
        />
    ))
    .addWithJSX('Pin Invalid', () => (
        <Invalid
            device={device}
        />
    ))
    .addWithJSX('Passphrase', () => (
        <Passphrase
            device={device}
            selectedDevice={device}
            onPassphraseSubmit={() => {}}
        />
    ))
    .addWithJSX('Transaction send', () => (
        <Transaction
            tx={{
                type: 'send',
                outputs: ['outputaddress'],
                total: '100',
                timestamp: '01/01/2019',
                hash: 'hashash',
            }}
            network={{
                symbol: 'BTC',
                explorer: {
                    tx: 'test',
                },
            }}
        />
    ))
    .addWithJSX('Transaction recieve', () => (
        <Transaction
            tx={{
                type: 'recieve',
                inputs: ['outputaddress'],
                total: '100',
                timestamp: '01/01/2019',
                hash: 'hashash',
            }}
            network={{
                symbol: 'BTC',
                explorer: {
                    tx: 'test',
                },
            }}
        />
    ));
