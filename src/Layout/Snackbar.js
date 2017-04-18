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
  z-index: 2000;

  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start
`;

const Message = styled(SUMessage)`
  padding: 0.5em 1em !important;
  margin: 0.5em 0 !important;
  max-width: 30vw;

  & i {
    margin-left: 0.5em;
    margin-right: 0 !important;
    float: right;
    cursor: pointer;
  }

  &.${TRANSITION}-enter {
    left: -120% !important;
  }

  &.${TRANSITION}-enter.${TRANSITION}-enter-active {
    left: 0 !important;
    transition: left ${ENTER}ms cubic-bezier(0.89, 0.01, 0.5, 1.1) !important;
  }

  &.${TRANSITION}-leave {
    left: 0 !important;
    transition: flex-grow ${LEAVE}ms linear;
  }

  &.${TRANSITION}-leave.${TRANSITION}-leave-active {
    left: -120% !important;
    transition: left ${LEAVE}ms cubic-bezier(0.89, 0.01, 0.5, 1.1) !important;
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
