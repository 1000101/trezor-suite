import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

import { AsyncSelect, Select } from 'components/Select';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import Input from 'components/inputs/Input';
import PinInput from 'components/inputs/Pin';
import TextArea from 'components/Textarea';

import colors from 'config/colors';

const Wrapper = styled.div`
    min-width: 250px;
`;
Wrapper.displayName = 'Wrapper';

storiesOf('Form', module)
    .addDecorator(
        withInfo({
            header: false,
            inline: true,
            maxPropsIntoLine: 1,
            styles: {
                infoStory: {
                    background: colors.LANDING,
                    borderBottom: `1px solid ${colors.DIVIDER}`,
                    padding: '30px',
                    margin: '-8px',
                },
                infoBody: {
                    border: 'none',
                    padding: '15px',
                },
            },
            excludedPropTypes: ['children'],
        })
    )
    .addDecorator(withKnobs)
    .add(
        'Input',
        () => {
            const type = select('Type', {
                Text: 'text',
                Password: 'password',
            });
            const isDisabled = boolean('Disabled', false);
            const value = text('Input value', '');
            const placeholder = text('Placeholder', 'placeholder...');
            const state = select(
                'State',
                {
                    Default: null,
                    Error: 'error',
                    Success: 'success',
                    Warning: 'warning',
                },
                null
            );
            const bottomText = text('Bottom text', 'bottom text');
            const topLabel = text('Top label', 'Input label');

            return (
                <Input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    bottomText={bottomText}
                    topLabel={topLabel}
                    onChange={() => {}}
                    {...(state ? { state } : {})}
                    {...(isDisabled ? { isDisabled } : {})}
                />
            );
        },
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { Input } from 'trezor-ui-components';
            ~~~
            `,
            },
        }
    )
    .add('Input Pin', () => <PinInput value={text('Input value', '')} onDeleteClick={() => {}} />, {
        info: {
            text: `
            ## Import
            ~~~js
            import { PinInput } from 'trezor-ui-components';
            ~~~
            `,
        },
    })
    .add(
        'TextArea',
        () => {
            const state = select(
                'State',
                {
                    Default: null,
                    Error: 'error',
                    Success: 'success',
                    Warning: 'warning',
                },
                null
            );
            const isDisabled = boolean('Disabled', false);

            return (
                <TextArea
                    value={text('Value', '')}
                    placeholder={text('Placeholder', 'placeholder...')}
                    bottomText={text('Bottom text', 'bottom text')}
                    topLabel={text('Top label', 'Textarea label')}
                    {...(isDisabled ? { isDisabled } : {})}
                    {...(state ? { state } : {})} // hack to hide state prop if its value is null
                />
            );
        },
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { TextArea } from 'trezor-ui-components';
            ~~~
            `,
            },
        }
    )
    .add(
        'Checkbox',
        () => {
            const isChecked = boolean('Checked', false);
            return (
                <Checkbox onClick={() => {}} {...(isChecked ? { isChecked } : {})}>
                    {text('Checkbox text', 'Checkbox')}
                </Checkbox>
            );
        },
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { Checkbox } from 'trezor-ui-components';
            ~~~
            `,
            },
        }
    )
    .add(
        'Switch',
        () => {
            const uncheckedIcon = select(
                'uncheckedIcon',
                {
                    Default: null,
                    false: false,
                },
                null
            );
            const checkedIcon = select(
                'checkedIcon',
                {
                    Default: null,
                    false: false,
                },
                null
            );
            const disabled = boolean('Disabled', false);
            const isSmall = boolean('isSmall', false);
            const checked = boolean('Checked', false);
            return (
                <Switch
                    key={`force-unmount-${isSmall}`}
                    onChange={() => {
                        return true;
                    }}
                    checked={checked}
                    {...(disabled ? { disabled } : {})}
                    {...(isSmall ? { isSmall } : {})}
                    {...(checkedIcon !== null ? { checkedIcon } : {})}
                    {...(uncheckedIcon !== null ? { uncheckedIcon } : {})}
                />
            );
        },
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { Switch } from 'trezor-ui-components';
            ~~~
            *<Switch> is just a wrapper around [react-switch](https://www.npmjs.com/package/react-switch) component. See the [official documentation](https://github.com/markusenglund/react-switch) for more information about its props and usage.*
            `,
            },
        }
    )
    .add(
        'Select',
        () => {
            const isSearchable = boolean('Searchable', false);
            const isClearable = boolean('Clearable', false);
            return (
                <Select
                    {...(isSearchable ? { isSearchable } : {})}
                    {...(isClearable ? { isClearable } : {})}
                    value={select('Value', {
                        None: null,
                        Hello: { value: 'hello', label: 'Hello' },
                        World: { value: 'world', label: 'World' },
                    })}
                    options={[
                        { value: 'hello', label: 'Hello' },
                        { value: 'world', label: 'World' },
                    ]}
                />
            );
        },
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { Select } from 'trezor-ui-components';
            ~~~
            *<Select> is just a styling wrapper around [react-select](https://react-select.com) component. See the [official documentation](https://react-select.com) for more information about its props and usage.*
            `,
            },
        }
    )
    .add(
        'Select (Async)',
        () => (
            <AsyncSelect
                defaultOptions={[
                    { value: 'hello', label: 'Hello' },
                    { value: 'world', label: 'World' },
                ]}
                cacheOptions={false}
                onInputChange={() => {}}
                loadOptions={(inputValue, callback) => {
                    const data = [
                        { value: 'hello', label: 'Hello' },
                        { value: 'world', label: 'World' },
                    ].filter(
                        item => item.label.toLowerCase().search(inputValue.toLowerCase()) !== -1
                    );
                    callback(data);
                }}
            />
        ),
        {
            info: {
                text: `
            ## Import
            ~~~js
            import { AsyncSelect } from 'trezor-ui-components';
            ~~~
            *<AsyncSelect> is just a styling wrapper around async version of [react-select](https://react-select.com) component. See the [official documentation](https://react-select.com/async) for more information about its props and usage.*
            `,
            },
        }
    );
