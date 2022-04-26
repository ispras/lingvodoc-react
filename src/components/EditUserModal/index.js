import React, { useCallback, useContext, useState } from "react";
import { Button, Form, Header, Input, Message, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";

import { editProfile, getId, getUser } from "api/user";
import TranslationContext from "Layout/TranslationContext";
import { EMAIL_MATCHER } from "utils";

const EditUserModal = ({ user, setUser, close }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [emailIncorrect, setEmailIncorrect] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [hideOldPassword, setHideOldPassword] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [hideNewPassword, setHideNewPassword] = useState(true);

  const [executing, setExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const getTranslation = useContext(TranslationContext);

  const onSubmit = useCallback(async () => {
    if (!EMAIL_MATCHER.test(email)) {
      setEmailIncorrect(true);
      return;
    }

    setExecuting(true);
    let response = await editProfile({
      id: getId(),
      name,
      email,
      new_password: newPassword,
      old_password: oldPassword
    });
    if (response.data) {
      response = await getUser();
      if (response.data) {
        window.logger.suc(getTranslation("Profile has been updated"));
        setUser(response.data);
        close();
      } else {
        window.logger.err(getTranslation("Could not get user information"));
      }
    } else if (response.err) {
      setErrorMessage(getTranslation(typeof response.err === "string" ? response.err : response.err.error));
      setExecuting(false);
    }
  }, [close, email, name, newPassword, oldPassword, setUser, getTranslation]);

  return (
    <Modal open className="lingvo-modal" closeIcon onClose={close} size="mini" dimmer="blurring">
      <Modal.Content className="lingvo-modal-content">
        <Header textAlign="center" as="h1">
          {getTranslation("Edit profile")}
        </Header>
        <Form size="big" error={emailIncorrect} onSubmit={async () => await onSubmit()}>
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
            label={getTranslation("Full name")}
            control={Input}
            name="name"
            placeholder={getTranslation("Full name")}
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <Form.Field
            label={getTranslation("Old password")}
            control={Input}
            name="old_password"
            type={hideOldPassword ? "password" : "text"}
            placeholder={getTranslation("Old password")}
            icon={{
              name: hideOldPassword ? "eye slash" : "eye",
              link: true,
              color: "violet",
              onClick: () => setHideOldPassword(!hideOldPassword)
            }}
            value={oldPassword}
            onChange={event => setOldPassword(event.target.value)}
          />
          <Form.Field
            label={getTranslation("New password")}
            control={Input}
            name="new_password"
            type={hideNewPassword ? "password" : "text"}
            placeholder={getTranslation("New password")}
            icon={{
              name: hideNewPassword ? "eye slash" : "eye",
              link: true,
              color: "violet",
              onClick: () => setHideNewPassword(!hideNewPassword)
            }}
            value={newPassword}
            onChange={event => setNewPassword(event.target.value)}
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
            loading={executing}
            disabled={executing || name.trim() === "" || email.trim() === "" || emailIncorrect}
          >
            {getTranslation("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

EditUserModal.propTypes = {
  user: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
};

export default EditUserModal;
