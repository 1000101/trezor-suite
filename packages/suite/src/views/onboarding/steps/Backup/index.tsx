import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { H4, P, Button, Checkbox, Icon, Link, Prompt } from '@trezor/components';
import { FormattedMessage } from 'react-intl';

import colors from '@suite/config/onboarding/colors';
import { SEED_MANUAL_URL } from '@suite/constants/onboarding/urls';
import { BACKUP_DEVICE } from '@suite/actions/onboarding/constants/calls';
import Text from '@suite/components/onboarding/Text';
import l10nCommonMessages from '@suite-support/Messages';

import {
    StepWrapper,
    StepBodyWrapper,
    StepHeadingWrapper,
    ControlsWrapper,
    CheckboxWrapper,
} from '@suite/components/onboarding/Wrapper';
import { goToNextStep, goToSubStep } from '@suite/actions/onboarding/onboardingActions';
import {
    wipeDevice,
    resetDevice,
    callActionAndGoToNextStep,
    resetCall,
    backupDevice,
} from '@suite/actions/onboarding/connectActions';
import { SeedCard } from './components/SeedCard';
import l10nMessages from './index.messages';
import { AppState } from '@suite-types';

const Panel = styled.div`
    background-color: ${colors.grayLight};
    color: ${colors.grayDark};
    padding: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
`;

const Icons = styled.div`
    display: flex;
    flex-direction: row;
    width: 90%;
    justify-content: space-around;
    margin-top: 10px;
    margin-bottom: 10px;
`;

const Instruction = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

interface BackupProps {
    device: AppState['onboarding']['connect']['device'];
    deviceCall: AppState['onboarding']['connect']['deviceCall'];
    deviceInteraction: AppState['onboarding']['connect']['deviceInteraction'];
    activeSubStep: AppState['onboarding']['activeSubStep'];
    connectActions: {
        wipeDevice: typeof wipeDevice;
        callActionAndGoToNextStep: typeof callActionAndGoToNextStep;
        resetDevice: typeof resetDevice;
        resetCall: typeof resetCall;
        backupDevice: typeof backupDevice;
    };
    onboardingActions: {
        goToNextStep: typeof goToNextStep;
        goToSubStep: typeof goToSubStep;
    };
}

const BackupStep: React.FC<BackupProps> = props => {
    const [userUnderstands, setUserUnderstands] = useState(false);

    useEffect(() => {
        props.connectActions.resetCall();
    }, [props.connectActions]);

    const { device, deviceCall, deviceInteraction, activeSubStep } = props;

    const getStatus = () => {
        if (
            (deviceCall!.name === BACKUP_DEVICE && deviceCall.error) ||
            device!.features!.no_backup === true ||
            device!.features!.initialized === false
        ) {
            return 'failed';
        }
        if (device && device.features.needs_backup === false) {
            return 'success';
        }
        if (device && device.features.needs_backup === true && deviceInteraction.counter > 0) {
            return 'started';
        }
        if (activeSubStep === 'recovery-card-front' || activeSubStep === 'recovery-card-back') {
            return activeSubStep;
        }
        if (device && device.features.needs_backup && !deviceCall.isProgress) {
            return 'initial';
        }
        return null;
    };

    return (
        <StepWrapper>
            <StepHeadingWrapper>
                {getStatus() === 'initial' && 'Backup your device'}
                {getStatus() === 'success' && 'Backup finished'}
                {getStatus() === 'failed' && 'Backup failed'}
                {getStatus() === 'started' &&
                    deviceInteraction.counter <= 24 &&
                    'Write down seed words from your device'}
                {getStatus() === 'started' && deviceInteraction.counter > 24 && 'Check seed words'}
                {getStatus() === 'recovery-card-front' && 'Get your recovery card'}
                {getStatus() === 'recovery-card-back' && 'Get your recovery card'}
            </StepHeadingWrapper>
            <StepBodyWrapper>
                {getStatus() === 'initial' && (
                    <React.Fragment>
                        <P>
                            <FormattedMessage
                                {...l10nMessages.TR_BACKUP_SUBHEADING_1}
                                values={{
                                    TR_SEED_MANUAL_LINK: (
                                        <Link href={SEED_MANUAL_URL}>
                                            <FormattedMessage
                                                {...l10nMessages.TR_SEED_MANUAL_LINK}
                                            />
                                        </Link>
                                    ),
                                }}
                            />
                        </P>
                        <P>
                            <FormattedMessage {...l10nMessages.TR_BACKUP_SUBHEADING_2} />
                        </P>

                        {/* todo: refactor icons to components */}
                        <Icons>
                            <Instruction>
                                <Icon size={80} icon="CLOUD_CROSSED" />
                                <FormattedMessage {...l10nMessages.TR_DO_NOT_UPLOAD_INSTRUCTION} />
                            </Instruction>

                            <Instruction>
                                <Icon size={80} icon="DOWNLOAD_CROSSED" />
                                <FormattedMessage
                                    {...l10nMessages.TR_DO_NOT_SAFE_IN_COMPUTER_INSTRUCTION}
                                />
                            </Instruction>

                            <Instruction>
                                <Icon size={80} icon="PHOTO_CROSSED" />
                                <FormattedMessage
                                    {...l10nMessages.TR_DO_NOT_TAKE_PHOTO_INSTRUCTION}
                                />
                            </Instruction>
                        </Icons>

                        <Panel>
                            <P>
                                <FormattedMessage
                                    {...l10nMessages.TR_SATOSHILABS_CANNOT_BE_HELD_RESPONSIBLE}
                                />
                            </P>
                        </Panel>
                        <CheckboxWrapper>
                            <Checkbox
                                isChecked={userUnderstands}
                                onClick={() => setUserUnderstands(!userUnderstands)}
                            >
                                <P>
                                    <FormattedMessage
                                        {...l10nMessages.TR_I_HAVE_READ_INSTRUCTIONS}
                                    />
                                </P>
                            </Checkbox>
                        </CheckboxWrapper>

                        <ControlsWrapper>
                            {device.features.major_version === 1 && (
                                <Button
                                    onClick={() => {
                                        props.onboardingActions.goToSubStep('recovery-card-front');
                                    }}
                                    isDisabled={!device || !userUnderstands}
                                >
                                    Continue
                                </Button>
                            )}

                            {device.features.major_version === 2 && (
                                    <Button onClick={() => props.connectActions.backupDevice()} isDisabled={!device || !userUnderstands}>
                                    <FormattedMessage {...l10nMessages.TR_START_BACKUP} />
                                </Button>
                            )}
                        </ControlsWrapper>
                    </React.Fragment>
                )}

                {getStatus() === 'recovery-card-front' && (
                    <React.Fragment>
                        <Text>
                            This is your recovery card. You should find two of them in the package.
                            In few moments, this piece of paper will become more important than your
                            device.
                        </Text>
                        <SeedCard flipOnMouseOver />
                        <ControlsWrapper>
                            <Button
                                // onClick={() =>  setState({ showWords: true })}
                                onClick={() => {
                                    props.onboardingActions.goToSubStep('recovery-card-back');
                                }}
                            >
                                Flip it
                            </Button>
                        </ControlsWrapper>
                    </React.Fragment>
                )}

                {getStatus() === 'recovery-card-back' && (
                    <React.Fragment>
                        <Text>
                            Device will show you a secret sequence of words. You should write them
                            down here.
                        </Text>
                        <SeedCard
                            showBack
                            wordsNumber={device!.features!.major_version === 2 ? 12 : 24}
                        />
                        <ControlsWrapper>
                            <Button
                                onClick={() => {
                                    props.connectActions.backupDevice();
                                }}
                            >
                                <FormattedMessage {...l10nMessages.TR_START_BACKUP} />
                            </Button>
                        </ControlsWrapper>
                    </React.Fragment>
                )}

                {getStatus() === 'started' && (
                    <React.Fragment>
                        <SeedCard
                            showBack
                            wordsNumber={24}
                            words={Array.from(
                                Array(
                                    deviceInteraction.counter < 24
                                        ? deviceInteraction.counter - 1
                                        : 24,
                                ),
                            ).map(() => '*****')}
                            checkingWordNumber={
                                deviceInteraction.counter - 24 > 0
                                    ? deviceInteraction.counter - 24
                                    : null
                            }
                            writingWordNumber={
                                deviceInteraction.counter <= 24 ? deviceInteraction.counter : null
                            }
                        />
                        <div style={{ marginTop: '100px' }}>
                            <Prompt model={device!.features.major_version} size={32}>
                                {deviceInteraction.counter > 24 && (
                                    <Text>
                                        Check the {deviceInteraction.counter - 24}. word on your
                                        device
                                    </Text>
                                )}
                                {deviceInteraction.counter <= 24 && (
                                    <Text>
                                        Write down the {deviceInteraction.counter}. word from your
                                        device
                                    </Text>
                                )}
                            </Prompt>
                        </div>
                    </React.Fragment>
                )}

                {getStatus() === 'failed' && (
                    <React.Fragment>
                        <H4>
                            <FormattedMessage
                                {...l10nMessages.TR_DEVICE_DISCONNECTED_DURING_ACTION}
                            />
                        </H4>
                        <P>
                            <FormattedMessage
                                {...l10nMessages.TR_DEVICE_DISCONNECTED_DURING_ACTION_DESCRIPTION}
                            />
                        </P>
                        <ControlsWrapper>
                            {device!.features!.initialized === true && (
                                <Button
                                    onClick={() => {
                                        props.connectActions.wipeDevice();
                                    }}
                                    isDisabled={!device || !device.connected}
                                >
                                    <FormattedMessage {...l10nCommonMessages.TR_WIPE_DEVICE} />
                                </Button>
                            )}

                            {device!.features!.initialized === false && (
                                <Button
                                    onClick={() => {
                                        props.connectActions.resetDevice();
                                    }}
                                    isDisabled={!device || !device.connected}
                                >
                                    <FormattedMessage {...l10nCommonMessages.TR_RESET_DEVICE} />
                                </Button>
                            )}
                        </ControlsWrapper>
                        {(!device || !device.connected) && (
                            <Text>
                                <FormattedMessage {...l10nCommonMessages.TR_CONNECT_YOUR_DEVICE} />
                            </Text>
                        )}
                    </React.Fragment>
                )}

                {getStatus() === 'success' && (
                    <React.Fragment>
                        <Text>
                            <FormattedMessage {...l10nMessages.TR_BACKUP_FINISHED_TEXT} />
                        </Text>

                        <ControlsWrapper>
                            <Button onClick={() => props.onboardingActions.goToNextStep()}>
                                <FormattedMessage {...l10nMessages.TR_BACKUP_FINISHED_BUTTON} />
                            </Button>
                        </ControlsWrapper>
                    </React.Fragment>
                )}
            </StepBodyWrapper>
        </StepWrapper>
    );
};

export default BackupStep;
