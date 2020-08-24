import React from 'react';
import { Button, Dropdown } from '@trezor/components';
import styled from 'styled-components';
import { useActions, useDiscovery, useSelector } from '@suite-hooks';
import * as metadataActions from '@suite-actions/metadataActions';
import { MetadataAddPayload, DeviceMetadata } from '@suite-types/metadata';

import MetadataEdit from './Edit';

const LabelDefaultValue = styled.div`
    min-width: 0;
    max-width: 0;
    transition: all 1s;
    text-overflow: ellipsis;

    &::before {
        content: ':';
    }
`;

const AddLabelButton = styled(Button)`
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.4s;
`;

const LabelValue = styled.div``;

const Label = styled.div`
    cursor: pointer;
    display: flex;
    overflow: hidden;
`;

const LabelContainer = styled.div`
    display: flex;
    white-space: nowrap;
    &:hover {
        ${AddLabelButton} {
            visibility: visible;
            opacity: 1;
        }
        ${LabelDefaultValue} {
            max-width: 440px;
        }
    }
`;

interface DropdownMenuItem {
    key: string;
    label: React.ReactNode;
    callback?: () => boolean | void;
    'data-test'?: string;
}

interface Props {
    defaultVisibleValue?: React.ReactNode;
    dropdownOptions?: DropdownMenuItem[];
    payload: MetadataAddPayload;
}

/**
 * User defined labeling component.
 * - This component shows defaultVisibleValue and "Add label" button if no metadata is present.
 * - Otherwise it shows metadata value and provides way to edit it.
 */
const MetadataLabeling = (props: Props) => {
    const metadata = useSelector(state => state.metadata);
    const { isDiscoveryRunning, device } = useDiscovery();

    let deviceMetadata: DeviceMetadata | undefined;
    if (device) {
        deviceMetadata = device.metadata;
    }

    const { addMetadata, init, setEditing } = useActions({
        addMetadata: metadataActions.addMetadata,
        init: metadataActions.init,
        setEditing: metadataActions.setEditing,
    });

    const activateEdit = () => {
        // when clicking on inline input edit, ensure that everything needed is already ready
        if (
            // isn't initiation in progress?
            !metadata.initiating &&
            // is there something that needs to be initiated?
            (!metadata.enabled || deviceMetadata?.status !== 'enabled' || !metadata.provider)
        ) {
            // provide force=true argument (user wants to enable metadata)
            init(true);
        }
        setEditing(props.payload.defaultValue);
    };

    const onSubmit = (value: string | undefined | null) => {
        addMetadata({
            ...props.payload,
            value: value || undefined,
        });
    };

    let dropdownItems: DropdownMenuItem[] = [
        {
            callback: () => setEditing(props.payload.defaultValue),
            label: 'Edit label',
            'data-test': '@metadata/edit-button',
            key: 'edit-label',
        },
        {
            callback: () => onSubmit(''),
            label: 'Remove label',
            'data-test': '@metadata/remove-button',
            key: 'remove-label',
        },
    ];

    if (props.dropdownOptions) {
        dropdownItems = [...dropdownItems, ...props.dropdownOptions];
    }

    const dataTestBase = `@metadata/${props.payload.type}/${props.payload.defaultValue}`;

    if (metadata.initiating) return <span>loading...</span>;

    if (
        metadata.editing === props.payload.defaultValue &&
        !metadata.initiating &&
        metadata.enabled &&
        deviceMetadata?.status === 'enabled'
    ) {
        return (
            <MetadataEdit
                originalValue={props.payload.value}
                onSubmit={onSubmit}
                onBlur={() => {
                    setEditing(undefined);
                }}
            />
        );
    }

    return (
        <LabelContainer>
            {props.payload.value ? (
                <Dropdown alignMenu="left" items={[{ options: dropdownItems, key: 'dropdown' }]}>
                    <Label data-test={dataTestBase}>
                        <LabelValue>{props.payload.value}</LabelValue>
                        {props.defaultVisibleValue && (
                            <LabelDefaultValue>{props.defaultVisibleValue}</LabelDefaultValue>
                        )}
                    </Label>
                </Dropdown>
            ) : (
                props.defaultVisibleValue
            )}

            {!props.payload.value && (
                <AddLabelButton
                    data-test={`${dataTestBase}/add-label-button`}
                    variant="tertiary"
                    icon={!isDiscoveryRunning ? 'LABEL' : undefined}
                    isLoading={isDiscoveryRunning}
                    isDisabled={isDiscoveryRunning}
                    onClick={e => {
                        e.stopPropagation();
                        // by clicking on add label button, metadata.editing field is set
                        // to default value of whatever may be labeled (address, etc..)
                        // this way we ensure that only one field may be active at time
                        activateEdit();
                    }}
                >
                    {!isDiscoveryRunning ? 'Add label' : 'Loading...'}
                </AddLabelButton>
            )}
        </LabelContainer>
    );
};

export default MetadataLabeling;
