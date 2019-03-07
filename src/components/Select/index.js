import PropTypes from 'prop-types';
import React from 'react';
import ReactAsyncSelect from 'react-select/lib/Async';
import ReactSelect from 'react-select';
import colors from 'config/colors';

const styles = isSearchable => ({
    singleValue: base => ({
        ...base,
        maxWidth: 'calc(100% - 10px)', // 8px padding + 2px maring-left
        width: '100%',
        color: colors.TEXT_SECONDARY,
    }),
    control: (base, { isDisabled }) => ({
        ...base,
        minHeight: 'initial',
        height: '40px',
        borderRadius: '2px',
        borderColor: colors.DIVIDER,
        boxShadow: 'none',
        background: isDisabled ? colors.SELECT_HOVER : colors.WHITE,
        '&:hover': {
            cursor: isSearchable ? 'text' : 'pointer',
            borderColor: colors.DIVIDER,
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base, { isDisabled }) => ({
        ...base,
        display: isSearchable || isDisabled ? 'none' : 'block',
        color: colors.TEXT_SECONDARY,
        path: '',
        '&:hover': {
            color: colors.TEXT_SECONDARY,
        },
    }),
    menu: base => ({
        ...base,
        margin: 0,
        boxShadow: 'none',
    }),
    menuList: base => ({
        ...base,
        padding: 0,
        boxShadow: 'none',
        background: colors.WHITE,
        borderLeft: `1px solid ${colors.DIVIDER}`,
        borderRight: `1px solid ${colors.DIVIDER}`,
        borderBottom: `1px solid ${colors.DIVIDER}`,
    }),
    option: (base, { isFocused }) => ({
        ...base,
        color: colors.TEXT_SECONDARY,
        background: isFocused ? colors.SELECT_HOVER : colors.WHITE,
        borderRadius: 0,
        '&:hover': {
            cursor: 'pointer',
            background: colors.SELECT_HOVER,
        },
    }),
});

const propTypes = {
    isAsync: PropTypes.bool,
    isSearchable: PropTypes.bool,
};
const Select = props => <ReactSelect styles={styles(props.isSearchable)} {...props} />;
const AsyncSelect = props => <ReactAsyncSelect styles={styles(props.isSearchable)} {...props} />;
Select.propTypes = propTypes;
AsyncSelect.propTypes = propTypes;

export { Select, AsyncSelect };
