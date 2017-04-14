import React from 'react';
import { signInForm } from 'ducks/user';
import FormModal from 'components/FormModal';

const SIGN_IN_FIELDS = [
  {
    name: 'login',
    type: 'text',
    label: 'Login',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
  },
];

const SignInModal = props =>
  <FormModal
    form="signin"
    header="Please sign in"
    actions={signInForm}
    fields={SIGN_IN_FIELDS}
    {...props}
  />;

export default SignInModal;
