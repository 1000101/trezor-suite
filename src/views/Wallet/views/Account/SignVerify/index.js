/* @flow */
import React, { Component } from 'react';
import styled from 'styled-components';
import Input from 'components/inputs/Input';
import Textarea from 'components/Textarea';
import Title from 'views/Wallet/components/Title';
import Button from 'components/Button';
import Content from 'views/Wallet/components/Content';
import colors from 'config/colors';
import { SCREEN_SIZE } from 'config/variables';


import type { Props } from './Container';

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    flex-direction: row;
    background: ${colors.WHITE};

    @media screen and (max-width: ${SCREEN_SIZE.MD}) {
        flex-wrap: wrap;
    }
`;

const Row = styled.div`
    padding-bottom: 28px;
`;

const RowButtons = styled(Row)`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const StyledButton = styled(Button)`
    width: 110px;
    margin-left: 10px;

    &:first-child {
        margin-left: 0;
    }
`;

const Column = styled.div`
    display: flex;
    flex: 1 1 50%;
    flex-direction: column;

    @media screen and (max-width: ${SCREEN_SIZE.MD}) {
        flex: 1 1 100%;
    }
`;

const Sign = styled(Column)``;

const Verify = styled(Column)`
    padding-left: 20px;

    @media screen and (max-width: ${SCREEN_SIZE.MD}) {
        padding-left: 0px;
    }
`;

class SignVerify extends Component <Props> {
    getError(inputName: string) {
        if (!this.props.signVerify) return null;
        return this.props.signVerify.errors.find(e => e.inputName === inputName);
    }

    handleInputChange = (event: SyntheticInputEvent<Text>) => {
        this.props.signVerifyActions.inputChange(event.target.name, event.target.value);
    }

    render() {
        const device = this.props.wallet.selectedDevice;
        const {
            account, discovery, shouldRender,
        } = this.props.selectedAccount;

        if (!device || !account || !discovery || !shouldRender) {
            const { loader, exceptionPage } = this.props.selectedAccount;
            return <Content loader={loader} exceptionPage={exceptionPage} isLoading />;
        }

        const {
            signVerifyActions,
            signVerify: {
                signMessage,
                signSignature,
                verifyAddress,
                verifyMessage,
                verifySignature,
                errors,
            },
        } = this.props;
        const verifyAddressError = this.getError('verifyAddress');
        return (
            <Content>
                <Wrapper>
                    <Sign>
                        <Title>Sign Message</Title>
                        <Row>
                            <Input
                                topLabel="Address"
                                name="signAddress"
                                value={account.descriptor}
                                type="text"
                                autoSelect
                                readOnly
                            />
                        </Row>
                        <Row>
                            <Textarea
                                topLabel="Message"
                                name="signMessage"
                                value={signMessage}
                                onChange={this.handleInputChange}
                                rows={4}
                                maxRows={4}
                                maxLength={255}
                            />
                        </Row>
                        <Row>
                            <Textarea
                                topLabel="Signature"
                                name="signSignature"
                                value={signSignature}
                                rows={4}
                                autoSelect
                                maxRows={4}
                                maxLength={255}
                                readOnly
                            />
                        </Row>
                        <RowButtons>
                            <StyledButton
                                onClick={this.props.signVerifyActions.clearSign}
                                isWhite
                            >Clear
                            </StyledButton>
                            <StyledButton
                                onClick={() => signVerifyActions.sign(account.accountPath, signMessage)}
                            >Sign
                            </StyledButton>
                        </RowButtons>
                    </Sign>
                    <Verify>
                        <Title>Verify message</Title>
                        <Row>
                            <Input
                                topLabel="Address"
                                autoSelect
                                name="verifyAddress"
                                value={verifyAddress}
                                onChange={this.handleInputChange}
                                type="text"
                                state={verifyAddressError ? 'error' : null}
                                bottomText={verifyAddressError ? verifyAddressError.message : null}
                            />
                        </Row>
                        <Row>
                            <Textarea
                                topLabel="Message"
                                name="verifyMessage"
                                value={verifyMessage}
                                onChange={this.handleInputChange}
                                rows={4}
                                maxRows={4}
                                maxLength={255}
                            />
                        </Row>
                        <Row>
                            <Textarea
                                topLabel="Signature"
                                autoSelect
                                name="verifySignature"
                                value={verifySignature}
                                onChange={this.handleInputChange}
                                rows={4}
                                maxRows={4}
                                maxLength={255}
                            />
                        </Row>
                        <RowButtons>
                            <StyledButton
                                onClick={signVerifyActions.clearVerify}
                                isWhite
                            >Clear
                            </StyledButton>
                            <StyledButton
                                onClick={
                                    () => {
                                        if (errors.length <= 0) {
                                            signVerifyActions.verify(
                                                verifyAddress,
                                                verifyMessage,
                                                verifySignature,
                                            );
                                        }
                                    }
                                }
                            >Verify
                            </StyledButton>
                        </RowButtons>
                    </Verify>
                </Wrapper>
            </Content>
        );
    }
}

export default SignVerify;