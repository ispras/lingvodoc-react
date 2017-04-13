import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import { Dropdown, Header, Modal } from 'semantic-ui-react';

import * as userActions from 'ducks/user';
import * as modalActions from 'ducks/modal';

const TITLE = 'User';

const Anonymous = ({ signIn }) =>
  <Dropdown item text={TITLE}>
    <Dropdown.Menu>
      <Dropdown.Item as="a">Sign Up</Dropdown.Item>
      <Dropdown.Item as="a" onClick={signIn}>Sign In</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>;

Anonymous.propTypes = {
  signIn: PropTypes.func.isRequired,
};

const Signed = ({ name, signOut }) =>
  <Dropdown item text={name}>
    <Dropdown.Menu>
      <Dropdown.Item as="a">Edit profile</Dropdown.Item>
      <Dropdown.Item as={Link} to="/files">My files</Dropdown.Item>
      <Dropdown.Item as="a" onClick={signOut}>Sign out</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>;

Signed.propTypes = {
  name: PropTypes.string.isRequired,
  signOut: PropTypes.func.isRequired,
};

function UserDropdown({ user, signOut, signIn }) {
  return isEmpty(user)
    ? <Anonymous signIn={signIn} />
    : <Signed {...user} signOut={signOut} />;
}

UserDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    signIn: () => dispatch(modalActions.signInForm({
      submit: () => dispatch(userActions.signIn()),
    })),
    signOut: () => dispatch(userActions.signOut()),
  };
}

export default connect(
  state => state.user,
  mapDispatchToProps,
)(UserDropdown);
