import { FONT_SIZE, LINE_HEIGHT } from 'config/variables';
import styled from 'styled-components';

import PropTypes from 'prop-types';
import React from 'react';
import colors from 'config/colors';

const P_SIZES = {
    small: FONT_SIZE.SMALL,
    medium: FONT_SIZE.BASE,
    large: FONT_SIZE.BIG,
    xlarge: FONT_SIZE.BIGGER,
};

const Paragraph = styled.p`
    font-size: ${props => props.size};
    line-height: ${LINE_HEIGHT.BASE};
    color: ${colors.TEXT_SECONDARY};
    text-align: ${props => props.textAlign};
    padding: 0;
    margin: 0;
`;

const P = ({ children, className, size = 'medium', textAlign = 'initial', ...rest }) => (
    <Paragraph className={className} size={P_SIZES[size]} textAlign={textAlign} {...rest}>
        {children}
    </Paragraph>
);

P.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    textAlign: PropTypes.oneOf(['left', 'center', 'right', 'justify', 'initial']),
};

export default P;
