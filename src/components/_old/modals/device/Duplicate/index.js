import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import icons from 'config/icons';
import colors from 'config/colors';
import { FONT_SIZE } from 'config/variables';

import { H3 } from 'components/Heading';
import P from 'components/Paragraph';
import ButtonText from 'components/buttons/ButtonText';
import Input from 'components/inputs/Input';
import Icon from 'components/Icon';
import Link from 'components/Link';

import { getDuplicateInstanceNumber } from 'reducers/utils';

const StyledLink = styled(Link)`
    position: absolute;
    right: 15px;
    top: 15px;
`;

const Wrapper = styled.div`
    width: 360px;
    padding: 24px 48px;
`;

const Column = styled.div`
    display: flex;
    padding: 10px 0;
    flex-direction: column;
`;

const StyledP = styled(P)`
    padding: 10px 0px;
`;

const StyledButton = styled(ButtonText)`
    margin: 0 0 10px 0;
`;

const Label = styled.div`
    display: flex;
    text-align: left;
    font-size: ${FONT_SIZE.SMALL};
    flex-direction: column;
    padding-bottom: 5px;
`;

const ErrorMessage = styled.div`
    color: ${colors.ERROR_PRIMARY};
    font-size: ${FONT_SIZE.SMALL};
    padding-top: 5px;
    text-align: center;
    width: 100%;
`;

class DuplicateDevice extends PureComponent {
    constructor(props) {
        super(props);
        console.log(props.devices);
        const instance = getDuplicateInstanceNumber(props.devices, props.device);

        this.state = {
            defaultName: `${props.device.label} (${instance.toString()})`,
            instance,
            instanceName: null,
            isUsed: false,
        };
    }

    componentDidMount() {
        // one time autofocus
        if (this.input) this.input.focus();
        this.keyboardHandler = this.keyboardHandler.bind(this);
        window.addEventListener('keydown', this.keyboardHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.keyboardHandler, false);
    }

    onNameChange = (value) => {
        let isUsed: boolean = false;
        if (value.length > 0) {
            isUsed = (this.props.devices.find(d => d.instanceName === value) !== undefined);
        }

        this.setState({
            instanceName: value.length > 0 ? value : null,
            isUsed,
        });
    }

    keyboardHandler(event) {
        if (event.keyCode === 13 && !this.state.isUsed) {
            event.preventDefault();
            this.submit();
        }
    }

    submit() {
        const extended = { instanceName: this.state.instanceName, instance: this.state.instance };
        this.props.onDuplicateDevice({ ...this.props.device, ...extended });
    }

    render() {
        const { device, onCancel } = this.props;
        const {
            defaultName,
            instanceName,
            isUsed,
        } = this.state;

        return (
            <Wrapper>
                <StyledLink onClick={onCancel}>
                    <Icon size={20} color={colors.TEXT_SECONDARY} icon={icons.CLOSE} />
                </StyledLink>
                <H3>Clone { device.label }?</H3>
                <StyledP isSmaller>This will create new instance of device which can be used with different passphrase</StyledP>
                <Column>
                    <Label>Instance name</Label>
                    <Input
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder={defaultName}
                        innerRef={(element) => { this.input = element; }}
                        onChange={event => this.onNameChange(event.currentTarget.value)}
                        value={instanceName}
                    />
                    { isUsed && <ErrorMessage>Instance name is already in use</ErrorMessage> }
                </Column>
                <Column>
                    <StyledButton
                        disabled={isUsed}
                        onClick={() => this.submit()}
                    >Create new instance
                    </StyledButton>
                    <StyledButton
                        isWhite
                        onClick={onCancel}
                    >Cancel
                    </StyledButton>
                </Column>
            </Wrapper>
        );
    }
}

DuplicateDevice.propTypes = {
    device: PropTypes.object.isRequired,
    devices: PropTypes.array.isRequired,
    onDuplicateDevice: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default DuplicateDevice;