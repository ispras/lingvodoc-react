import React from 'react';
import { signUpForm } from 'ducks/user';
import FormModal from 'components/FormModal';
import { getTranslation } from 'api/i18n';

const SIGN_UP_FIELDS = [
  {
    name: 'login',
    type: 'text',
    label: getTranslation('Login'),
  },
  {
    name: 'name',
    type: 'text',
    label: getTranslation('Full name'),
  },
  {
    name: 'email',
    type: 'email',
    label: getTranslation('Email'),
  },
  {
    name: 'password',
    type: 'password',
    label: getTranslation('Password'),
  },
  {
    name: 'password2',
    type: 'password',
    label: getTranslation('Confirm Password'),
  },
];

function validate({ login, name, email }) {
  const errors = {};
  if (!login) {
    errors.login = getTranslation('Login is required');
  }
  if (!name) {
    errors.name = getTranslation('Name is required');
  }
  if (!email) {
    errors.email = getTranslation('Email is required');
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = getTranslation('Invalid email address');
  }
  return errors;
}

const SignUpModal = props =>
  <FormModal
    form="signup"
    header={getTranslation("Sign Up")}
    actions={signUpForm}
    fields={SIGN_UP_FIELDS}
    validate={validate}
    {...props}
  />;

export default SignUpModal;
