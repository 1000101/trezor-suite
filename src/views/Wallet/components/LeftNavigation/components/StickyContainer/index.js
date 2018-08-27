/* @flow */


// https://github.com/KyleAMathews/react-headroom/blob/master/src/shouldUpdate.js

import * as React from 'react';
import raf from 'raf';
import { getViewportHeight, getScrollY } from 'utils/windowUtils';
import styled from 'styled-components';
import colors from 'config/colors';

type Props = {
    location: string,
    deviceSelection: boolean,
    children?: React.Node,
}

const AsideWrapper = styled.aside`
    position: relative;
    width: 320px;
    min-width: 320px;
    overflow-x: hidden;
    background: ${colors.MAIN};
`;

const StickyContainerWrapper = styled.div`
    position: relative;
    top: 0;
    width: 320px;
    overflow: hidden;
`;

export default class StickyContainer extends React.PureComponent<Props> {
    // Class variables.
    currentScrollY: number = 0;

    lastKnownScrollY: number = 0;

    topOffset: number = 0;

    firstRender: boolean = false;

    framePending: boolean = false;

    stickToBottom: boolean = false;

    top: number = 0;

    aside: ?HTMLElement;

    wrapper: ?HTMLElement;

    subscribers = [];

    // handleResize = (event: Event) => {

    // }

    shouldUpdate = () => {
        const { wrapper, aside }: {wrapper: ?HTMLElement, aside: ?HTMLElement} = this;
        if (!wrapper || !aside) return;
        const bottom: ?HTMLElement = wrapper.querySelector('.sticky-bottom');
        if (!bottom) return;

        const viewportHeight: number = getViewportHeight();
        const bottomBounds = bottom.getBoundingClientRect();
        const asideBounds = aside.getBoundingClientRect();
        const wrapperBounds = wrapper.getBoundingClientRect();
        const scrollDirection = this.currentScrollY >= this.lastKnownScrollY ? 'down' : 'up';
        const distanceScrolled = Math.abs(this.currentScrollY - this.lastKnownScrollY);

        if (asideBounds.top < 0) {
            wrapper.classList.add('fixed');
            let maxTop: number = 1;
            if (wrapperBounds.height > viewportHeight) {
                const bottomOutOfBounds: boolean = (bottomBounds.bottom <= viewportHeight && scrollDirection === 'down');
                const topOutOfBounds: boolean = (wrapperBounds.top > 0 && scrollDirection === 'up');
                if (!bottomOutOfBounds && !topOutOfBounds) {
                    this.topOffset += scrollDirection === 'down' ? -distanceScrolled : distanceScrolled;
                }
                maxTop = viewportHeight - wrapperBounds.height;
            }

            if (this.topOffset > 0) this.topOffset = 0;
            if (maxTop < 0 && this.topOffset < maxTop) this.topOffset = maxTop;
            wrapper.style.top = `${this.topOffset}px`;
        } else {
            wrapper.classList.remove('fixed');
            wrapper.style.top = '0px';
            this.topOffset = 0;
        }

        if (wrapperBounds.height > viewportHeight) {
            wrapper.classList.remove('fixed-bottom');
        } else if (wrapper.classList.contains('fixed-bottom')) {
            if (bottomBounds.top < wrapperBounds.bottom - bottomBounds.height) {
                wrapper.classList.remove('fixed-bottom');
            }
        } else if (bottomBounds.bottom < viewportHeight) {
            wrapper.classList.add('fixed-bottom');
        }

        aside.style.minHeight = `${wrapperBounds.height}px`;
    }

    update = () => {
        this.currentScrollY = getScrollY();
        this.shouldUpdate();
        this.framePending = false;
        this.lastKnownScrollY = this.currentScrollY;
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);
        raf(this.update);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.location !== prevProps.location && this.aside) {
            const asideBounds = this.aside.getBoundingClientRect();
            if (asideBounds.top < 0) {
                window.scrollTo(0, getScrollY() + asideBounds.top);
                this.topOffset = 0;
            }
            raf(this.update);
        } else if (this.props.deviceSelection !== prevProps.deviceSelection) {
            raf(this.update);
        } else if (!this.firstRender) {
            raf(this.update);
            this.firstRender = true;
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }

    handleScroll = (/* event: ?Event */) => {
        if (!this.framePending) {
            this.framePending = true;
            raf(this.update);
        }
    }

    render() {
        return (
            <AsideWrapper
                innerRef={(node) => { this.aside = node; }}
                onScroll={this.handleScroll}
                onTouchStart={this.handleScroll}
                onTouchMove={this.handleScroll}
                onTouchEnd={this.handleScroll}
            >
                <StickyContainerWrapper
                    innerRef={(node) => { this.wrapper = node; }}
                >
                    {this.props.children}
                </StickyContainerWrapper>
            </AsideWrapper>
        );
    }
}