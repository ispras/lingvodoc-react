import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, Icon, Message } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';

function handleKeyDown(cb) {
  return (event) => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
      cb();
    }
  };
}

const Rf = ({ input, label, type, meta: { touched, error } }) => (
  <Form.Field>
    <label htmlFor={input.name}>{label}</label>
    <Form.Input {...input} placeholder={label} type={type} error={touched && !!error} />
    <Message error visible={touched && !!error} content={error} />
  </Form.Field>
);

Rf.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
};

const FormModal = ({ open, actions, fields, handleClose, trigger, handleSubmit, submitting, error }) =>
  <Modal
    trigger={trigger}
    open={open}
    onClose={handleClose}
    size="small"
    dimmer="blurring"
  >
    <Modal.Header>Sign up</Modal.Header>
    <Modal.Content>
      <Form onSubmit={handleSubmit(actions)} onKeyDown={handleKeyDown(handleSubmit(actions))}>
        {
          fields.map(field =>
            <Field key={field.name} component={Rf} {...field} />)
        }

        <Message visible={!!error} error>
          <Icon name="remove" /> {error}
        </Message>
        <Button basic color="red" onClick={handleClose}>
          <Icon name="remove" /> Close
        </Button>
        <Button color="green" type="submit" disabled={submitting}>
          <Icon name="checkmark" /> Submit
        </Button>
      </Form>
    </Modal.Content>
  </Modal>;

FormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  trigger: PropTypes.element.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.any.isRequired,
  fields: PropTypes.any.isRequired,
  actions: PropTypes.any.isRequired,
};

FormModal.defaultProps = {
  error: '',
};

export default reduxForm()(FormModal);
