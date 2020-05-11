import React, { useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Button } from '@trezor/components';
import { Translation, CheckItem, Image } from '@suite-components';
import * as deviceSettingsActions from '@settings-actions/deviceSettingsActions';
import { Dispatch } from '@suite-types';
import { useDeviceActionLocks } from '@suite-hooks';

const Row = styled.div`
    display: flex;
    flex-direction: row;
`;

const Col = styled.div`
    display: flex;
    flex-direction: column;
`;

const CheckItems = styled(Row)`
    justify-content: center;
    margin-top: 16px;
    margin-bottom: 16px;
`;

const Buttons = styled(Row)`
    justify-content: center;
    width: 100%;
`;

const mapDispatchToProps = (dispatch: Dispatch) => ({
    wipeDevice: bindActionCreators(deviceSettingsActions.wipeDevice, dispatch),
});

type Props = ReturnType<typeof mapDispatchToProps> & {
    onCancel: () => void;
};

const WipeDevice = ({ wipeDevice, onCancel }: Props) => {
    const [checkbox1, setCheckbox1] = useState(false);
    const [checkbox2, setCheckbox2] = useState(false);

    const [actionEnabled] = useDeviceActionLocks();

    return (
        <Modal
            size="small"
            cancelable
            onCancel={onCancel}
            heading={<Translation id="TR_WIPE_DEVICE_HEADING" />}
            description={<Translation id="TR_WIPE_DEVICE_TEXT" />}
            bottomBar={
                <Buttons>
                    <Col>
                        <Button
                            variant="danger"
                            onClick={() => wipeDevice()}
                            isDisabled={!actionEnabled || !checkbox1 || !checkbox2}
                            data-test="@wipe/wipe-button"
                        >
                            <Translation id="TR_DEVICE_SETTINGS_BUTTON_WIPE_DEVICE" />
                        </Button>
                    </Col>
                </Buttons>
            }
        >
            <Image image="UNI_ERROR" />
            <CheckItems>
                <Col>
                    <CheckItem
                        title={<Translation id="TR_WIPE_DEVICE_CHECKBOX_1_TITLE" />}
                        description={<Translation id="TR_WIPE_DEVICE_CHECKBOX_1_DESCRIPTION" />}
                        isChecked={checkbox1}
                        onClick={() => setCheckbox1(!checkbox1)}
                        data-test="@wipe/checkbox-1"
                    />
                    <CheckItem
                        title={<Translation id="TR_WIPE_DEVICE_CHECKBOX_2_TITLE" />}
                        description={<Translation id="TR_WIPE_DEVICE_CHECKBOX_2_DESCRIPTION" />}
                        isChecked={checkbox2}
                        onClick={() => setCheckbox2(!checkbox2)}
                        data-test="@wipe/checkbox-2"
                    />
                </Col>
            </CheckItems>
        </Modal>
    );
};

export default connect(null, mapDispatchToProps)(WipeDevice);
