import React from 'react';
import { RcTooltip } from 'rc-tooltip';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import colors from '../../config/colors';
import Link from '../Link';

/* Tooltip CSS */
import 'rc-tooltip/assets/bootstrap.css';

const Wrapper = styled.div``;

const Content = styled.div`
    max-width: ${props => `${props.maxWidth}px` || 'auto'};
`;

const ContentWrapper = styled.div`
    display: block;
`;

const ReadMore = styled.div`
    margin-top: 15px;
    padding: 10px 0 5px 0;
    text-align: center;
    width: 100%;
    color: ${colors.WHITE};
    border-top: 1px solid ${colors.TEXT_SECONDARY};
`;

const Tooltip = ({
    maxWidth,
    className,
    placement,
    content,
    readMoreLink,
    children,
}) => {
    const ContentWrapper = (
        <ContentWrapper>
            <Content maxWidth={maxWidth}>{content}</Content>
            {readMoreLink && (
                <Link href={readMoreLink}>
                    <ReadMore>Read more</ReadMore>
                </Link>
            )
            }
        </ContentWrapper>
    );

    return (
        <Wrapper className={className}>
            <RcTooltip
                arrowContent={<div className="rc-tooltip-arrow-inner" />}
                placement={placement}
                overlay={() => (
                    ContentWrapper
                )}
            >
                {children}
            </RcTooltip>
        </Wrapper>
    );
};

Tooltip.propTypes = {
    className: PropTypes.string,
    placement: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string,
    ]),
    maxWidth: PropTypes.number,
    content: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string,
    ]),
    readMoreLink: PropTypes.string,
};

export default Tooltip;
