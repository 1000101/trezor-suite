/* @flow */
'use strict';

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';


type Props = {
    pathname: string;
}
type State = {
    style: {
        width: number,
        left: number
    };
}

class Indicator extends Component<Props, State> {

    reposition: () => void;
    state: State;

    constructor(props: any) {
        super(props);

        this.state = {
            style: {
                width: 0,
                left: 0
            },
        }

        this.reposition = this.reposition.bind(this);
    }

    handleResize() {
        this.reposition();
    }

    componentDidMount() {
        this.reposition();
        window.addEventListener('resize', this.reposition, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.reposition, false);
    }

    componentDidUpdate(newProps: any) {
        this.reposition();
    }

    reposition() {
        const tabs = document.querySelector('.account-tabs');
        if (!tabs) return;
        const active = tabs.querySelector('.active');
        if (!active) return;
        const bounds = active.getBoundingClientRect();

        const left = bounds.left - tabs.getBoundingClientRect().left;

        if (this.state.style.left !== left) {
            this.setState({
                style: {
                    width: bounds.width,
                    left: left,
                }
            })
        }
    }

    render() {
        return (
            <div className="indicator" style={ this.state.style }>{ this.props.pathname }</div>
        );
    }
}

const AccountTabs = (props: any): any => {

    const urlParams = props.match.params;
    //const urlParams = props.match ? props.match.params : { address: '0' };
    const basePath = `/device/${urlParams.device}/network/${urlParams.network}/address/${urlParams.address}`;

    return (
        <div className="account-tabs">
            {/* <NavLink to={ `${basePath}` }>
                History
            </NavLink> */}
            <NavLink exact to={ `${basePath}` }>
                Summary
            </NavLink>
            <NavLink to={ `${basePath}/send` }>
                Send
            </NavLink>
            <NavLink to={ `${basePath}/receive` }>
                Receive
            </NavLink>
            {/* <NavLink to={ `${basePath}/signverify` }>
                Sign &amp; Verify
            </NavLink> */}
            <Indicator pathname={props.match.pathname } />
        </div>
    );
}

export default AccountTabs;