import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ icon, size = 30, color = 'black' }) => {
    const styles = {
        svg: {
            display: 'inline-block',
            verticalAlign: 'middle',
        },
        path: {
            fill: color,
        },
    };

    return (
        <svg
            style={styles.svg}
            width={`${size}`}
            height={`${size}`}
            viewBox="0 0 16 16"
        >
            <path
                style={styles.path}
                d={icon}

            />
        </svg>
    );
};

Icon.propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.string,
};


export default Icon;