import React from 'react';
import { signUpForm } from 'ducks/user';
import FormModal from 'components/FormModal';

const SIGN_UP_FIELDS = [
  {
    name: 'login',
    type: 'text',
    label: 'Login',
  },
  {
    name: 'name',
    type: 'text',
    label: 'Full name',
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
  },
  {
    name: 'password2',
    type: 'password',
    label: 'Confirm Password',
  },
];

function validate({ login, email }) {
  const errors = {};
  if (!login) {
    errors.login = 'Login is required';
  }
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
}

const SignUpModal = props =>
  <FormModal
    form="signup"
    actions={signUpForm}
    fields={SIGN_UP_FIELDS}
    validate={validate}
    {...props}
  />;

export default SignUpModal;
