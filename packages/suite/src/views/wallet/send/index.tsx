import React from 'react';
import { connect } from 'react-redux';

import { Text } from 'react-native';
import { StartButton } from '@trezor/components/StartButton';
import Wrapper from '@suite/components/SuiteWrapper';
import { State } from '@suite/types';

const onPress = () => {
    // TrezorConnect.getPublicKey();
};

interface Props {
    suite: State['suite'];
    router: State['router'];
}

const Wallet = (props: Props) => {
    return (
        <Wrapper>
            <Text>Wallet/Send {props.router.pathname}</Text>
            <StartButton onPress={onPress} />
        </Wrapper>
    );
};

const mapStateToProps = (state: State) => ({
    suite: state.suite,
    router: state.router,
});

export default connect(mapStateToProps)(Wallet);
