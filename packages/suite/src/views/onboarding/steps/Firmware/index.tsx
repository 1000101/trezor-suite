import React, { useMemo, useState } from 'react';

import { OnboardingButton, Wrapper, OnboardingLayout, Box } from '@onboarding-components';
import { Translation } from '@suite-components';
import {
    CheckSeedStep,
    FirmwareProgressStep,
    PartiallyDoneStep,
    DoneStep,
    ErrorStep,
    ReconnectInBootloaderStep,
    ReconnectInNormalStep,
    NoNewFirmware,
    OnboardingInitialStep,
    ContinueButton,
    RetryButton,
    ErrorImg,
    NeueFirmwareProgressStep,
} from '@firmware-components';
import NeueOnboardingInitialStep from '@firmware-components/NeueOnboardingInitial';
import { useSelector, useActions } from '@suite-hooks';
import * as onboardingActions from '@onboarding-actions/onboardingActions';
import * as firmwareActions from '@suite/actions/firmware/firmwareActions';
import FirmwareStepBox from './components/FirmwareStepBox';

const FirmwareStep = () => {
    const { device, firmware } = useSelector(state => ({
        device: state.suite.device,
        firmware: state.firmware,
    }));

    const { goToNextStep, goToPreviousStep, resetReducer, firmwareUpdate } = useActions({
        goToNextStep: onboardingActions.goToNextStep,
        goToPreviousStep: onboardingActions.goToPreviousStep,
        resetReducer: firmwareActions.resetReducer,
        firmwareUpdate: firmwareActions.firmwareUpdate,
    });

    // Device, while in bootloader mode, doesn’t report its fw version, only bootloader version. We'll save fw version in local state
    const [cachedCurrentFwVersion, setCachedCurrentFwVersion] = useState();

    // TODO: useless memo?
    const Component = useMemo(() => {
        // edge case 1 - error
        if (firmware.error) {
            return {
                Body: (
                    <FirmwareStepBox
                        heading={<Translation id="TR_FW_INSTALLATION_FAILED" />}
                        description={
                            <Translation
                                id="TOAST_GENERIC_ERROR"
                                values={{ error: firmware.error }}
                            />
                        }
                        innerActions={<RetryButton onClick={firmwareUpdate} />}
                    >
                        <ErrorImg />
                    </FirmwareStepBox>
                ),
            };
        }

        // // edge case 2 - user has reconnected device that is already up to date
        if (firmware.status !== 'done' && device?.firmware === 'valid') {
            return {
                Body: <NoNewFirmware.Body />,
                BottomBar: <ContinueButton onClick={() => goToNextStep()} />,
            };
        }

        console.log('firmware.status', firmware.status);
        switch (firmware.status) {
            case 'initial':
            case 'waiting-for-bootloader': // waiting for user to reconnect in bootloader
                return {
                    Body: (
                        <NeueOnboardingInitialStep
                            setCachedCurrentFwVersion={setCachedCurrentFwVersion}
                        />
                    ),
                };
            case 'check-seed':
                // TODO: remove this case? it is only relevant in separate fw update flow and not even triggered used in onboarding
                return {
                    Body: <CheckSeedStep.Body />,
                    BottomBar: <CheckSeedStep.BottomBar />,
                };
            case 'waiting-for-confirmation': // waiting for confirming installation on a device
            case 'started': // called firmwareUpdate()
            case 'installing':
            case 'wait-for-reboot':
            case 'unplug':
                return {
                    Body: (
                        <NeueFirmwareProgressStep cachedCurrentFwVersion={cachedCurrentFwVersion} />
                    ),
                };
            case 'reconnect-in-normal':
                return {
                    Body: <ReconnectInNormalStep.Body />,
                    BottomBar: <ReconnectInNormalStep.BottomBar />,
                };
            case 'partially-done':
                return {
                    Body: <PartiallyDoneStep.Body />,
                    BottomBar: <ContinueButton onClick={resetReducer} />,
                };
            case 'done':
                return {
                    Body: <DoneStep.Body />,
                    BottomBar: <ContinueButton onClick={() => goToNextStep()} />,
                };

            default:
                // 'ensure' type completeness
                throw new Error(`state "${firmware.status}" is not handled here`);
        }
    }, [
        cachedCurrentFwVersion,
        device?.firmware,
        firmware.error,
        firmware.status,
        firmwareUpdate,
        goToNextStep,
        resetReducer,
    ]);

    return (
        <OnboardingLayout>
            {Component.Body}

            {/* Back button for initial case and in case of error */}
            {/* <Wrapper.StepFooter>
                    {['initial', 'error'].includes(firmware.status) && (
                        <OnboardingButton.Back
                            onClick={() =>
                                firmware.status === 'error' ? resetReducer() : goToPreviousStep()
                            }
                        >
                            <Translation id="TR_BACK" />
                        </OnboardingButton.Back>
                    )}
                </Wrapper.StepFooter> */}
        </OnboardingLayout>
    );
};

export default FirmwareStep;
