/* @flow */
'use strict';

import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { default as SendFormActions } from '../../../actions/SendFormActions';
import { default as AbstractAccountActions } from '../../../actions/AbstractAccountActions';
import SendForm from './SendForm';

import type { MapStateToProps, MapDispatchToProps } from 'react-redux';
import type { State, Dispatch } from '../../../flowtype';
import type { StateProps as BaseStateProps, DispatchProps as BaseDispatchProps } from '../account/AbstractAccount';

type OwnProps = { }

type StateProps = BaseStateProps & {
    tokens: $ElementType<State, 'tokens'>,
    pending: $ElementType<State, 'pending'>,
    sendForm: $ElementType<State, 'sendForm'>,
    fiat: $ElementType<State, 'fiat'>,
    localStorage: $ElementType<State, 'localStorage'>,
    children?: React.Node;
}

type DispatchProps = BaseDispatchProps & {
    initAccount: typeof SendFormActions.init,
    updateAccount: typeof SendFormActions.update,
    disposeAccount: typeof SendFormActions.dispose,
    sendFormActions: typeof SendFormActions
}

export type Props = StateProps & DispatchProps;

const mapStateToProps: MapStateToProps<State, OwnProps, StateProps> = (state: State, own: OwnProps): StateProps => {
    return {
        abstractAccount: state.abstractAccount,
        devices: state.connect.devices,
        accounts: state.accounts,
        discovery: state.discovery,
        tokens: state.tokens,
        pending: state.pending,
        sendForm: state.sendForm,
        fiat: state.fiat,
        localStorage: state.localStorage
    };
}

const mapDispatchToProps: MapDispatchToProps<Dispatch, OwnProps, DispatchProps> = (dispatch: Dispatch): DispatchProps => {
    return {
        abstractAccountActions: bindActionCreators(AbstractAccountActions, dispatch), 
        sendFormActions: bindActionCreators(SendFormActions, dispatch),
        initAccount: bindActionCreators(SendFormActions.init, dispatch), 
        updateAccount: bindActionCreators(SendFormActions.update, dispatch), 
        disposeAccount: bindActionCreators(SendFormActions.dispose, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendForm)