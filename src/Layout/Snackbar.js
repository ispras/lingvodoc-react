import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import styled from 'styled-components';

import { Message as SUMessage, Icon, Container } from 'semantic-ui-react';

import { remove } from 'ducks/snackbar';

const TRANSITION = 'snackbar';
const ENTER = 500;
const LEAVE = 1000;

const Wrapper = styled(CSSTransitionGroup)`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 1em;
  max-width: 30vw;
  z-index: 2000;

  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start
`;

const Message = styled(SUMessage)`
  padding: 0.5em 1em !important;
  margin: 0.5em 0 !important;

  & i {
    margin-left: 0.5em;
    margin-right: 0 !important;
    float: right;
    cursor: pointer;
  }

  &.${TRANSITION}-enter {
    opacity: 0.01 !important;
  }

  &.${TRANSITION}-enter.${TRANSITION}-enter-active {
    opacity: 1 !important;
    transition: opacity ${ENTER}ms ease-in !important;
  }

  &.${TRANSITION}-leave {
    opacity: 1 !important;
  }

  &.${TRANSITION}-leave.${TRANSITION}-leave-active {
    opacity: 0.01 !important;
    transition: opacity ${LEAVE}ms ease-in !important;
  }
`;

const Snack = ({ text, color, dismissable, onDismiss }) =>
  <Message color={color}>
    {text} { dismissable && <Icon name="remove" onClick={onDismiss} /> }
  </Message>;

Snack.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  dismissable: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const Snackbar = ({ messages, dismiss }) =>
  <Wrapper
    transitionName={TRANSITION}
    transitionEnterTimeout={ENTER}
    transitionLeaveTimeout={LEAVE}
  >
    {
      messages.map(message =>
        <Snack key={message.timestamp} {...message} onDismiss={() => dismiss(message)} />)
    }
  </Wrapper>;

Snackbar.propTypes = {
  messages: PropTypes.array.isRequired,
  dismiss: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    messages: state.snackbar.messages.toArray(),
  };
}

export default connect(
  mapStateToProps,
  { dismiss: remove },
)(Snackbar);
