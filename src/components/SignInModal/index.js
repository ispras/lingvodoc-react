import React, { useCallback, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Header, Input, Message, Modal } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import PropTypes from "prop-types";

import { getId, getUser, signIn } from "api/user";
import { setIsAuthenticated } from "ducks/auth";
import { requestUser, setError, setUser } from "ducks/user";
import TranslationContext from "Layout/TranslationContext";
import { startTrackUser } from "utils/matomo";

const SignInModal = ({ close }) => {
  const client = useApolloClient();
  const dispatch = useDispatch();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const [logginIn, setLogginIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const getTranslation = useContext(TranslationContext);

  const onSubmit = useCallback(async () => {
    setLogginIn(true);
    let response = await signIn(login, password);
    if (!response.data) {
      setErrorMessage(
        getTranslation(
          "Signin failure. Either no such login/password combination exists, or this user account has been deactivated."
        )
      );
      setLogginIn(false);
      return;
    }
    dispatch(requestUser());
    response = await getUser();
    if (response.data) {
      startTrackUser(getId(), response.data.login);
      dispatch(setUser(response.data));
      dispatch(setIsAuthenticated({ isAuthenticated: true }));
      client.resetStore();
    } else {
      window.logger.err(getTranslation("Could not get user information"));
      dispatch(setError());
    }
  }, [client, dispatch, login, password, getTranslation]);

  const handleKeyDown = useCallback(event => {
    if (event.key === "Enter" && event.shiftKey === false) {
      document.getElementById("login-button").click();
    }
  }, []);

  return (
    <Modal open className="lingvo-modal" closeIcon onClose={close} size="mini" dimmer="blurring">
      <Modal.Content className="lingvo-modal-content">
        <Header textAlign="center" as="h1">
          {getTranslation("Please sign in")}
        </Header>
        <Form size="big" onSubmit={async () => await onSubmit()} onKeyDown={handleKeyDown}>
          <Form.Field
            label={getTranslation("Login")}
            control={Input}
            name="login"
            placeholder={getTranslation("Login")}
            value={login}
            onChange={event => setLogin(event.target.value)}
          />
          <Form.Field
            label={getTranslation("Password")}
            control={Input}
            name="password"
            type={hidePassword ? "password" : "text"}
            placeholder={getTranslation("Password")}
            icon={{
              name: hidePassword ? "eye slash" : "eye",
              link: true,
              color: "violet",
              onClick: () => setHidePassword(!hidePassword)
            }}
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <Message visible={errorMessage !== undefined} error>
            {errorMessage}
          </Message>
          <Button
            id="login-button"
            fluid
            size="huge"
            color="violet"
            type="submit"
            loading={logginIn}
            disabled={logginIn || login.trim() === "" || password.trim() === ""}
          >
            {getTranslation("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

SignInModal.propTypes = {
  close: PropTypes.func.isRequired
};

export default SignInModal;
