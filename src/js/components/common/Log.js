/* @flow */


import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { H2 } from 'components/common/Heading';

import * as LogActions from 'actions/LogActions';
import type { State, Dispatch } from 'flowtype';

const Log = (props: Props): ?React$Element<string> => {
    if (!props.log.opened) return null;
    return (
        <div className="log">
            <button className="log-close transparent" onClick={props.toggle} />
            <H2>Log</H2>
            <p>Attention: The log contains your XPUBs. Anyone with your XPUBs can see your account history.</p>
            <textarea value={JSON.stringify(props.log.entries)} readOnly />
        </div>
    );
};

export default connect(
    (state: State) => ({
        log: state.log,
    }),
    (dispatch: Dispatch) => ({
        toggle: bindActionCreators(LogActions.toggle, dispatch),
    }),
)(Log);