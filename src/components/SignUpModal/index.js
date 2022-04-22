import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Header, Input, Message, Modal } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import PropTypes from "prop-types";

import { getTranslation } from "api/i18n";
import { getId, getUser, signIn, signUp } from "api/user";
import { setIsAuthenticated } from "ducks/auth";
import { requestUser, setError, setUser } from "ducks/user";
import { EMAIL_MATCHER } from "utils";
import { startTrackUser } from "utils/matomo";

const SignUpModal = ({ close }) => {
  const client = useApolloClient();
  const dispatch = useDispatch();

  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailIncorrect, setEmailIncorrect] = useState(false);
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [password2, setPassword2] = useState("");
  const [hidePassword2, setHidePassword2] = useState(true);
  const [password2Incorrect, setPassword2Incorrect] = useState(false);

  const [signingUp, setSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const checkPasswordsMatch = useCallback(() => {
    const error = password !== "" && password2 !== "" && password !== password2;
    setPassword2Incorrect(error);
    return error;
  }, [password, password2]);

  const onSubmit = useCallback(async () => {
    let errors = checkPasswordsMatch();
    if (!EMAIL_MATCHER.test(email)) {
      setEmailIncorrect(true);
      errors = true;
    }
    if (errors) {
      return;
    }

    setSigningUp(true);
    let response = await signUp({ login, name, email, password });
    if (response.data) {
      if (response.data.result === "Signup success.") {
        response = await signIn(login, password);
        if (response.data) {
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
        }
        window.logger.suc(getTranslation("Signup success"));
      } else if (response.data.result === "Signup approval pending.") {
        window.logger.suc(getTranslation(getTranslation("Signup approval pending")));
      } else {
        window.logger.log(getTranslation(response.data.result));
      }
    } else if (response.err) {
      setErrorMessage(getTranslation(typeof response.err === "string" ? response.err : response.err.error));
      setSigningUp(false);
    }
  }, [checkPasswordsMatch, client, dispatch, email, login, name, password]);

  return (
    <Modal open className="lingvo-modal" closeIcon onClose={close} size="mini" dimmer="blurring">
      <Modal.Content className="lingvo-modal-content">
        <Header textAlign="center" as="h1">
          {getTranslation("Sign Up")}
        </Header>
        <Form size="big" error={emailIncorrect} onSubmit={async () => await onSubmit()}>
          <Form.Field
            label={getTranslation("Login")}
            control={Input}
            name="login"
            placeholder={getTranslation("Login")}
            value={login}
            onChange={event => setLogin(event.target.value)}
          />
          <Form.Field
            label={getTranslation("Full name")}
            control={Input}
            name="name"
            placeholder={getTranslation("Full name")}
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <Form.Field
            label={getTranslation("Email")}
            control={Input}
            name="email"
            type="email"
            placeholder={getTranslation("Email")}
            error={emailIncorrect ? { content: getTranslation("Invalid email address") } : undefined}
            value={email}
            onChange={event => setEmail(event.target.value)}
            onBlur={() => setEmailIncorrect(email !== "" && !EMAIL_MATCHER.test(email))}
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
            onBlur={checkPasswordsMatch}
          />
          <Form.Field
            label={getTranslation("Confirm Password")}
            control={Input}
            name="password2"
            type={hidePassword2 ? "password" : "text"}
            placeholder={getTranslation("Confirm Password")}
            error={password2Incorrect ? { content: getTranslation("Passwords do not match") } : undefined}
            icon={{
              name: hidePassword2 ? "eye slash" : "eye",
              link: true,
              color: "violet",
              onClick: () => setHidePassword2(!hidePassword2)
            }}
            value={password2}
            onChange={event => setPassword2(event.target.value)}
            onBlur={checkPasswordsMatch}
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
            loading={signingUp}
            disabled={
              signingUp ||
              login.trim() === "" ||
              name.trim() === "" ||
              email.trim() === "" ||
              emailIncorrect ||
              password.trim() === "" ||
              password2.trim() === "" ||
              password2Incorrect
            }
          >
            {getTranslation("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

SignUpModal.propTypes = {
  close: PropTypes.func.isRequired
};

export default SignUpModal;
