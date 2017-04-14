import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import { Dropdown } from 'semantic-ui-react';

import * as userActions from 'ducks/user';

import SignInModal from 'components/SignInModal';
import SignUpModal from 'components/SignUpModal';

const TITLE = 'User';

const Anonymous = ({ modal, launchSignInForm, launchSignUpForm, closeForm }) =>
  <Dropdown item text={TITLE}>
    <Dropdown.Menu>
      <SignInModal
        trigger={<Dropdown.Item as="a" onClick={launchSignInForm}>Sign In</Dropdown.Item>}
        open={modal === 'signin'}
        handleClose={closeForm}
      />
      <SignUpModal
        trigger={<Dropdown.Item as="a" onClick={launchSignUpForm}>Sign Up</Dropdown.Item>}
        open={modal === 'signup'}
        handleClose={closeForm}
      />
    </Dropdown.Menu>
  </Dropdown>;

Anonymous.propTypes = {
  modal: PropTypes.any.isRequired,
  launchSignInForm: PropTypes.func.isRequired,
  launchSignUpForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
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

function UserDropdown({ user, signOut, ...rest }) {
  return isEmpty(user)
    ? <Anonymous {...rest} />
    : <Signed {...user} signOut={signOut} />;
}

UserDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  signOut: PropTypes.func.isRequired,
};

export default connect(
  state => state.user,
  {
    launchSignInForm: userActions.launchSignInForm,
    launchSignUpForm: userActions.launchSignUpForm,
    closeForm: userActions.closeForm,
    signOut: userActions.signOut,
  },
)(UserDropdown);
