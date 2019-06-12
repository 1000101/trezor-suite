import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { State } from '@suite/types/onboarding/actions';
import * as onboardingActions from '@suite/actions/onboarding/onboardingActions';
import * as connectActions from '@suite/actions/onboarding/connectActions';

import { Dispatch } from '@suite-types/index';

import Step from './index';

const mapStateToProps = (state: State) => ({
    device: state.onboarding.connect.device,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    connectActions: bindActionCreators(connectActions, dispatch),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Step);
