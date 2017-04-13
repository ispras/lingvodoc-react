import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';

const SignInForm = () =>
  <Form>
    <Form.Field>
      <label htmlFor="login">Login</label>
      <Field name="login" component="input" type="text" />
    </Form.Field>
    <Form.Field>
      <label htmlFor="password">Password</label>
      <Field name="password" component="input" type="password" />
    </Form.Field>
  </Form>;

SignInForm.propTypes = {
};

export default reduxForm({
  form: 'signin',
})(SignInForm);
