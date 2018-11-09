import React from 'react';
import { signInForm } from 'ducks/user';
import FormModal from 'components/FormModal';
import { connect } from 'react-redux';
import { getTranslation } from 'api/i18n';

const SIGN_IN_FIELDS = [
  {
    name: 'login',
    type: 'text',
    label: getTranslation('Login'),
  },
  {
    name: 'password',
    type: 'password',
    label: getTranslation('Password'),
  },
];

const SignInModal = props =>
  <FormModal
    form="signin"
    header={getTranslation("Please sign in")}
    actions={signInForm}
    fields={SIGN_IN_FIELDS}
    {...props}
  />;

export default connect(state => ({ message: state.user.signin_info }))(SignInModal);
