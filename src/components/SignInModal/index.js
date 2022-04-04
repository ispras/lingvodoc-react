import React from "react";
import { connect } from "react-redux";
import { getTranslation } from "api/i18n";

import FormModal from "components/FormModal";
import { signInForm } from "ducks/user";

const SignInModal = props => {
  const signInFields = [
    {
      name: "login",
      type: "text",
      label: getTranslation("Login")
    },
    {
      name: "password",
      type: "password",
      label: getTranslation("Password")
    }
  ];

  return (
    <FormModal
      form="signin"
      header={getTranslation("Please sign in")}
      actions={signInForm}
      fields={signInFields}
      {...props}
    />
  );
};

export default connect(state => ({ message: state.user.signin_info }))(SignInModal);
