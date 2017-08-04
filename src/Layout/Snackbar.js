import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import { Message as SUMessage, Icon } from 'semantic-ui-react';

import { remove } from 'ducks/snackbar';

const TRANSITION = {
  classNames: 'snackbar',
  enter: 500,
  exit: 1000,
};

const Wrapper = styled(TransitionGroup)`
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

  &.${TRANSITION.classNames}-enter {
    left: -120% !important;
  }

  &.${TRANSITION.classNames}-enter.${TRANSITION.classNames}-enter-active {
    left: 0 !important;
    transition: left ${TRANSITION.enter}ms cubic-bezier(0.89, 0.01, 0.5, 1.1) !important;
  }

  &.${TRANSITION.classNames}-exit {
    left: 0 !important;
    transition: flex-grow ${TRANSITION.exit}ms linear;
  }

  &.${TRANSITION.classNames}-exit.${TRANSITION.classNames}-exit-active {
    left: -120% !important;
    transition: left ${TRANSITION.exit}ms cubic-bezier(0.89, 0.01, 0.5, 1.1) !important;
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

const Snackbar = pure(({ messages, dismiss }) =>
  <Wrapper>
    {
      messages.map(message =>
        <CSSTransition
          key={message.timestamp}
          classNames={TRANSITION.classNames}
          timeout={TRANSITION}
        >
          <Snack {...message} onDismiss={() => dismiss(message)} />
        </CSSTransition>)
    }
  </Wrapper>
);

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
