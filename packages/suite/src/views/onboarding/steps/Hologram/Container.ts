import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '@suite/types/suite';
import * as onboardingActions from '@onboarding-actions/onboardingActions';

import { Dispatch } from '@suite-types/index';

import Step from './index';

const mapStateToProps = (state: State) => ({
    device: state.suite.device,
    model: state.onboarding.selectedModel,
    activeSubStep: state.onboarding.activeSubStep,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onboardingActions: bindActionCreators(onboardingActions, dispatch),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Step);
