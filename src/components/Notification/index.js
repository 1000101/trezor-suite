import * as React from 'react';

import styled from 'styled-components';
import { FONT_SIZE, FONT_WEIGHT } from '../../config/variables';
import { getIcon, getPrimaryColor, getSecondaryColor } from '../../utils/notification';

import Icon from '../Icon';
import Loader from '../Loader';
import NotificationButton from './components/NotificationButton';
import icons from '../../config/icons';

const Wrapper = styled.div`
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    color: ${props => getPrimaryColor(props.type)};
    background: ${props => getSecondaryColor(props.type)};
`;

const Content = styled.div`
    width: 100%;
    max-width: 1170px;
    padding: 24px;
    display: flex;
    flex-direction: row;
    text-align: left;
    align-items: center;
`;

const Body = styled.div`
    display: flex;
`;

const Message = styled.div`
    font-size: ${FONT_SIZE.SMALL};
`;

const Title = styled.div`
    padding-bottom: 5px;
    padding-top: 1px;
    font-weight: ${FONT_WEIGHT.MEDIUM};
`;

const CloseClick = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    padding-right: inherit;
    padding-top: inherit;
    cursor: pointer;
`;

const StyledIcon = styled(Icon)`
    position: relative;
    top: -7px;
    min-width: 20px;
`;

const IconWrapper = styled.div`
    min-width: 30px;
`;

const Texts = styled.div`
    display: flex;
    padding: 0 10px 0 0;
    flex-direction: column;
`;

const AdditionalContent = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex: 1;
`;

const ActionContent = styled.div`
    display: flex;
    justify-content: right;
    align-items: flex-end;
`;

const Notification = (props) => {
    const close = typeof props.close === 'function' ? props.close : () => {}; // TODO: add default close action

    return (
        <Wrapper className={props.className} type={props.type}>
            <Content>
                {props.loading && <Loader size={50} /> }
                {props.cancelable && (
                    <CloseClick onClick={() => close()}>
                        <Icon
                            color={getPrimaryColor(props.type)}
                            icon={icons.CLOSE}
                            size={20}
                        />
                    </CloseClick>
                )}
                <Body>
                    <IconWrapper>
                        <StyledIcon
                            color={getPrimaryColor(props.type)}
                            icon={getIcon(props.type)}
                        />
                    </IconWrapper>
                    <Texts>
                        <Title>{ props.title }</Title>
                        { props.message ? <Message>{props.message}</Message> : '' }
                    </Texts>
                </Body>
                <AdditionalContent>
                    {props.actions && props.actions.length > 0 && (
                        <ActionContent>
                            {props.actions.map(action => (
                                <NotificationButton
                                    key={action.label}
                                    type={props.type}
                                    isLoading={props.isActionInProgress}
                                    onClick={() => { close(); action.callback(); }}
                                >{action.label}
                                </NotificationButton>
                            ))}
                        </ActionContent>
                    )}
                </AdditionalContent>
            </Content>
        </Wrapper>
    );
};

export default Notification;