import React, { useCallback, useState } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Dropdown, Icon, Menu } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import { getTranslation } from "api/i18n";
import { signOut } from "api/user";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";

import EditUserModal from "components/EditUserModal";
import SignInModal from "components/SignInModal";
import SignUpModal from "components/SignUpModal";
import { openModal } from "ducks/ban";
import * as userActions from "ducks/user";
import { stopTrackUser } from "sagas/matomo";

import imageUser from "../images/user.svg";

const spinner = (
  <Menu.Item className="top_menu">
    <span>
      <Icon loading name="spinner" />
    </span>
  </Menu.Item>
);

const Anonymous = ({ modal, launchSignInForm, launchSignUpForm, closeForm, loading, error }) =>
  loading && !error ? (
    spinner
  ) : (
    <>
      <Menu.Item className="top_menu top_menu__item_signin">
        <div className="sign_in" onClick={launchSignInForm}>
          {getTranslation("Sign In")}
        </div>
      </Menu.Item>
      <Menu.Item className="top_menu top_menu__item_signup">
        <div className="sign_up" onClick={launchSignUpForm}>
          {getTranslation("Sign Up")}
        </div>
      </Menu.Item>
      <Dropdown
        item
        trigger={
          loading ? (
            <span>
              <img src={imageUser} alt={getTranslation("User")} className="icon-user" /> <Icon loading name="spinner" />
            </span>
          ) : (
            <span>
              <img src={imageUser} alt={getTranslation("User")} className="icon-user" />
            </span>
          )
        }
        className="top_menu top_menu__dropdown-user top_menu__item_user"
      >
        <Dropdown.Menu>
          <Dropdown.Item as="a" onClick={launchSignInForm}>
            {getTranslation("Sign In")}
          </Dropdown.Item>
          <Dropdown.Item as="a" onClick={launchSignUpForm}>
            {getTranslation("Sign Up")}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <SignInModal open={modal === "signin"} handleClose={closeForm} />
      <SignUpModal open={modal === "signup"} handleClose={closeForm} />
    </>
  );

Anonymous.propTypes = {
  modal: PropTypes.any.isRequired,
  launchSignInForm: PropTypes.func.isRequired,
  launchSignUpForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object
};

const Signed = ({ user, modal, launchEditForm, closeForm, setUser, openBanModal, history }) => {
  const client = useApolloClient();

  const [loggingOut, setLoggingOut] = useState(false);

  const logoutUser = useCallback(async () => {
    setLoggingOut(true);
    const response = await signOut();
    if (response.data) {
      setLoggingOut(false);
      stopTrackUser();
      history.push("/");
      setUser({});
      client.cache.reset();
    } else {
      setLoggingOut(false);
      window.logger.err(getTranslation("Could not sign out"));
    }
  }, [client, history, setUser]);

  return loggingOut ? (
    spinner
  ) : (
    <Dropdown
      item
      trigger={
        <span>
          <img src={imageUser} alt={user.name} className="top_menu__signed-icon icon-user" />
          <span className="top_menu__signed-user">{user.name}</span>
        </span>
      }
      className={user.id === 1 ? "top_menu top_menu__item_user top_menu__item_admin" : "top_menu top_menu__item_user"}
    >
      <Dropdown.Menu>
        <EditUserModal
          trigger={
            <Dropdown.Item as="a" onClick={launchEditForm}>
              {getTranslation("Edit profile")}
            </Dropdown.Item>
          }
          user={user}
          open={modal === "edit"}
          handleClose={closeForm}
        />

        <Dropdown.Item as={Link} to="/files">
          {getTranslation("My files")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/grants">
          {getTranslation("Grants")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/organizations">
          {getTranslation("Organizations")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/requests">
          {getTranslation("Requests")}
        </Dropdown.Item>
        <Dropdown.Item as="a" onClick={async () => await logoutUser()}>
          {getTranslation("Sign out")}
        </Dropdown.Item>

        {user.id === 1 && (
          <Dropdown.Item onClick={openBanModal}>{getTranslation("User account activation/deactivation")}</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

Signed.propTypes = {
  modal: PropTypes.any.isRequired,
  user: PropTypes.object.isRequired,
  launchEditForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  openBanModal: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

function UserDropdown({ user, ...rest }) {
  return isEmpty(user) ? <Anonymous {...rest} /> : <Signed user={user} {...rest} />;
}

UserDropdown.propTypes = {
  user: PropTypes.object.isRequired
};

export default compose(
  connect(state => state.user, {
    launchSignInForm: userActions.launchSignInForm,
    launchSignUpForm: userActions.launchSignUpForm,
    launchEditForm: userActions.launchEditForm,
    closeForm: userActions.closeForm,
    setUser: userActions.setUser,
    openBanModal: openModal
  }),
  withRouter
)(UserDropdown);
