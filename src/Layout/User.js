import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import { Dropdown, Icon, Menu } from 'semantic-ui-react';

import * as userActions from 'ducks/user';
import { openModal } from 'ducks/ban';

import SignInModal from 'components/SignInModal';
import SignUpModal from 'components/SignUpModal';
import EditUserModal from 'components/EditUserModal';
import { getTranslation } from 'api/i18n';

import imageUser from '../images/user.svg';

const Anonymous = ({
  modal, launchSignInForm, launchSignUpForm, closeForm, loading
}) =>
loading
?
<Menu.Item className="top_menu">
  <span><Icon loading name="spinner"/></span>
</Menu.Item>
:
<React.Fragment>
  <Menu.Item className="top_menu top_menu__item_signin">
    <div className="sign_in" onClick={launchSignInForm}>{getTranslation('Sign In')}</div>
  </Menu.Item>
  <Menu.Item className="top_menu top_menu__item_signup">
    <div className="sign_up" onClick={launchSignUpForm}>{getTranslation('Sign Up')}</div>
  </Menu.Item>
  <Dropdown
    item
    trigger={
      loading ?
        <span><img src={imageUser} alt={getTranslation('User')} className="icon-user" />{' '}<Icon loading name="spinner"/></span> :
        <span><img src={imageUser} alt={getTranslation('User')} className="icon-user" /></span>}
    className="top_menu top_menu__dropdown-user top_menu__item_user">
    <Dropdown.Menu>
      <Dropdown.Item as="a" onClick={launchSignInForm}>{getTranslation('Sign In')}</Dropdown.Item>
      <Dropdown.Item as="a" onClick={launchSignUpForm}>{getTranslation('Sign Up')}</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
  <SignInModal
    open={modal === 'signin'}
    handleClose={closeForm}
  />
  <SignUpModal
    open={modal === 'signup'}
    handleClose={closeForm}
  />
</React.Fragment>;

Anonymous.propTypes = {
  modal: PropTypes.any.isRequired,
  launchSignInForm: PropTypes.func.isRequired,
  launchSignUpForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
};
/* eslint-disable no-shadow */
const Signed = ({
  user, modal, signOut, launchEditForm, closeForm, openModal
}) =>
  <Dropdown item 
    trigger={<span>
      <img src={imageUser} alt={user.name} className="top_menu__signed-icon icon-user" />
      <span className="top_menu__signed-user">{user.name}</span>
    </span>}
    className="top_menu top_menu__item_user">
    <Dropdown.Menu>
      <EditUserModal
        trigger={<Dropdown.Item as="a" onClick={launchEditForm}>{getTranslation('Edit profile')}</Dropdown.Item>}
        user={user}
        open={modal === 'edit'}
        handleClose={closeForm}
      />

      <Dropdown.Item as={Link} to="/files">{getTranslation('My files')}</Dropdown.Item>
      <Dropdown.Item as={Link} to="/grants">{getTranslation('Grants')}</Dropdown.Item>
      <Dropdown.Item as={Link} to="/organizations">{getTranslation('Organizations')}</Dropdown.Item>
      <Dropdown.Item as={Link} to="/requests">{getTranslation('Requests')}</Dropdown.Item>
      <Dropdown.Item as="a" onClick={signOut}>{getTranslation('Sign out')}</Dropdown.Item>


      {user.id === 1 && (
        <Dropdown.Item onClick={openModal}>{getTranslation('User account activation/deactivation')}</Dropdown.Item>
      )}

    </Dropdown.Menu>
  </Dropdown>;
/* eslint-enable no-shadow */
Signed.propTypes = {
  modal: PropTypes.any.isRequired,
  user: PropTypes.object.isRequired,
  signOut: PropTypes.func.isRequired,
  launchEditForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
};

function UserDropdown({ user, ...rest }) {
  return isEmpty(user)
    ? <Anonymous {...rest} />
    : <Signed user={user} {...rest} />;
}

UserDropdown.propTypes = {
  user: PropTypes.object.isRequired,
};

export default connect(
  state => state.user,
  {
    launchSignInForm: userActions.launchSignInForm,
    launchSignUpForm: userActions.launchSignUpForm,
    launchEditForm: userActions.launchEditForm,
    closeForm: userActions.closeForm,
    signOut: userActions.signOut,
    openModal,
  }
)(UserDropdown);
