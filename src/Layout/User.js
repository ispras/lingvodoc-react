import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Icon, Menu } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import PropTypes from "prop-types";

import { getId, getUser, signOut } from "api/user";
import EditUserModal from "components/EditUserModal";
import SignInModal from "components/SignInModal";
import SignUpModal from "components/SignUpModal";
import { setIsAuthenticated } from "ducks/auth";
import { openModal as openBanModal } from "ducks/ban";
import { requestUser, setError, setUser } from "ducks/user";
import TranslationContext from "Layout/TranslationContext";
import { startTrackUser, stopTrackUser } from "utils/matomo";
import { isAdmin } from "utils/isadmin";

import imageUser from "../images/user.svg";

const spinner = (
  <Menu.Item className="top_menu">
    <span>
      <Icon loading name="spinner" />
    </span>
  </Menu.Item>
);

const Anonymous = () => {
  const [modal, setModal] = useState();
  const getTranslation = useContext(TranslationContext);

  return (
    <>
      <Menu.Item className="top_menu top_menu__item_signin">
        <div className="sign_in" onClick={() => setModal("signin")}>
          {getTranslation("Sign In")}
        </div>
      </Menu.Item>
      <Menu.Item className="top_menu top_menu__item_signup">
        <div className="sign_up" onClick={() => setModal("signup")}>
          {getTranslation("Sign Up")}
        </div>
      </Menu.Item>
      <Dropdown
        item
        trigger={
          <span>
            <img src={imageUser} alt={getTranslation("User")} className="icon-user" />
          </span>
        }
        className="top_menu top_menu__dropdown-user top_menu__item_user"
      >
        <Dropdown.Menu>
          <Dropdown.Item as="a" onClick={() => setModal("signin")}>
            {getTranslation("Sign In")}
          </Dropdown.Item>
          <Dropdown.Item as="a" onClick={() => setModal("signup")}>
            {getTranslation("Sign Up")}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {modal === "signin" && <SignInModal close={() => setModal(undefined)} />}
      {modal === "signup" && <SignUpModal close={() => setModal(undefined)} />}
    </>
  );
};

const Signed = ({ user }) => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const dispatch = useDispatch();

  const [editModal, setEditModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getTranslation = useContext(TranslationContext);

  const logoutUser = useCallback(async () => {
    setLoggingOut(true);
    const response = await signOut();
    if (response.data) {
      setLoggingOut(false);
      stopTrackUser();
      navigate("/");
      dispatch(setUser({}));
      dispatch(setIsAuthenticated({ isAuthenticated: false }));
      client.cache.reset();
    } else {
      setLoggingOut(false);
      window.logger.err(getTranslation("Could not sign out"));
    }
  }, [client, dispatch, navigate, getTranslation]);

  if (loggingOut) {
    return spinner;
  }

  return (
    <>
      <Dropdown
        item
        trigger={
          <span>
            <img src={imageUser} alt={user.name} className="top_menu__signed-icon icon-user" />
            <span className="top_menu__signed-user">{user.name}</span>
          </span>
        }
        className={isAdmin(user.id) ? "top_menu top_menu__item_user top_menu__item_admin" : "top_menu top_menu__item_user"}
      >
        <Dropdown.Menu>
          <Dropdown.Item as="a" onClick={() => setEditModal(true)}>
            {getTranslation("Edit profile")}
          </Dropdown.Item>
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
          {isAdmin(user.id) && (
            <Dropdown.Item onClick={() => dispatch(openBanModal())}>
              {getTranslation("User account activation/deactivation")}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
      {editModal && <EditUserModal user={user} setUser={setUser} close={() => setEditModal(false)} />}
    </>
  );
};

Signed.propTypes = {
  user: PropTypes.object.isRequired
};

const UserDropdown = () => {
  const userInfo = useSelector(state => state.user);
  const dispatch = useDispatch();

  const getTranslation = useContext(TranslationContext);

  useEffect(() => {
    const fetchUserInformation = async () => {
      const response = await getUser();
      if (response.data) {
        startTrackUser(getId(), response.data.login);
        dispatch(setUser(response.data));
        dispatch(setIsAuthenticated({ isAuthenticated: true }));
      } else {
        window.logger.err(getTranslation("Could not get user information"));
        dispatch(setError());
      }
    };
    if (getId() && !userInfo.user.id && !userInfo.loading && !userInfo.error) {
      dispatch(requestUser());
      fetchUserInformation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userInfo.loading) {
    return spinner;
  }

  return userInfo.user.id === undefined ? <Anonymous /> : <Signed user={userInfo.user} />;
};

export default UserDropdown;
