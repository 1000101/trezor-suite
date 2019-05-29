import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Text } from 'react-native';
import { Button } from '@trezor/components';
import { State } from '@suite/types';
import TrezorConnect from 'trezor-connect';

const onClick = () => {
    TrezorConnect.getAddress({
        path: "m/44'/0'/0'/0/0",
        coin: 'btc',
    }).then();
};

interface Props {
    suite: State['suite'];
    router: State['router'];
}

const Index = (props: Props) => {
    useEffect(() => {}, [props]);
    return (
        <>
            <Text>Home {props.router.pathname}</Text>
            <Button variant="success" onClick={onClick}>START</Button>
        </>
    );
};

const mapStateToProps = (state: State) => ({
    suite: state.suite,
    router: state.router,
});

export default connect(mapStateToProps)(Index);
