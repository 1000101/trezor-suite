/* @flow */
import React from 'react';
import { render } from 'react-dom';
import baseStyles from '~/js/support/BaseStyles';
import store from './store';
import App from './router';
import { onBeforeUnload } from './actions/WalletActions';
import styles from '~/styles/index.less';

const root: ?HTMLElement = document.getElementById('root');
if (root) {
    baseStyles();
    render(<App />, root);
}

window.onbeforeunload = () => {
    store.dispatch(onBeforeUnload());
};

// Application life cycle starts in ./services/WalletService.js