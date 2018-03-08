/* @flow */
'use strict';

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Summary from './Summary';
import * as SummaryActions from '../../../actions/SummaryActions';

function mapStateToProps(state, own) {
    return {
        location: state.router.location,
        devices: state.connect.devices,
        accounts: state.accounts,
        discovery: state.discovery,
        tokens: state.tokens,
        summary: state.summary,
        fiat: state.fiat,
        localStorage: state.localStorage
    };
}

function mapDispatchToProps(dispatch) {
    return {
        summaryActions: bindActionCreators(SummaryActions, dispatch), 
        initAccount: bindActionCreators(SummaryActions.init, dispatch), 
        updateAccount: bindActionCreators(SummaryActions.update, dispatch), 
        disposeAccount: bindActionCreators(SummaryActions.dispose, dispatch), 
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Summary)