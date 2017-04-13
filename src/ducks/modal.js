import React from 'react';
import { combineReducers } from 'redux';
import { Button, Icon, Modal } from 'semantic-ui-react';
import SignInForm from 'components/SignInForm';

// Actions
export const SET = '@modal/SET';
export const CLOSE = '@modal/CLOSE';

// Reducers
const sizeInit = 'small';
function size(state = sizeInit, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.size || sizeInit;
    case CLOSE:
      return sizeInit;
    default:
      return state;
  }
}

const dimmerInit = 'blurring';
function dimmer(state = dimmerInit, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.dimmer || dimmerInit;
    case CLOSE:
      return dimmerInit;
    default:
      return state;
  }
}

function open(state = false, action = {}) {
  switch (action.type) {
    case SET:
      return !!action.payload.body;
    case CLOSE:
      return false;
    default:
      return state;
  }
}

function body(state = null, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.body;
    case CLOSE:
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  size,
  dimmer,
  open,
  body,
});

// Action Creators
export function setModal(payload) {
  return { type: SET, payload };
}

export function close() {
  return { type: CLOSE };
}

export function signInForm({ submit }) {
  const formBody = {
    header: (
      <Modal.Header>Please sign in</Modal.Header>
    ),
    content: (
      <Modal.Content>
        <SignInForm />
      </Modal.Content>
    ),
    actions: (
      <Modal.Actions>
        <Button color="green" onClick={submit}>
          <Icon name="checkmark" /> Submit
        </Button>
      </Modal.Actions>
    ),
  };

  return { type: SET, payload: { body: formBody } };
}
