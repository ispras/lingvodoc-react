import React from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, Icon, Message, Header } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';
import { getTranslation } from 'api/i18n';

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

function FormModal(props) {
  const {
    open,
    header,
    subheader,
    actions,
    fields,
    trigger,
    handleSubmit,
    submitting,
    pristine,
    error,
    reset,
    handleClose,
    message,
  } = props;

  const close = () => reset() && handleClose();

  return (
    <Modal
      trigger={trigger}
      open={open}
      className="lingvo-modal"
      closeIcon
      onClose={close}
      size="mini"
      dimmer="blurring"
      onClick={e => e.stopPropagation()}
      onFocus={e => e.stopPropagation()}
    >
      <Modal.Content className="lingvo-modal-content">
        <Header textAlign="center" as="h1">{header}
          {subheader && <Header.Subheader>
            {subheader}
          </Header.Subheader>}
          {submitting && <Icon loading name="spinner" />}
        </Header>
        <Form size="big" onSubmit={handleSubmit(actions)} onKeyDown={handleKeyDown(handleSubmit(actions))}>
          {
            fields.map(field =>
              <Field key={field.name} component={field.component || Rf} {...field} />)
          }
          <Message visible={!!error} error>
            <Icon name="remove" /> {error}
          </Message>
          <Message visible={!!message} error>
            {message}
          </Message>
          
          <Button color="violet" fluid size="huge" type="submit" disabled={pristine || submitting}>
            {getTranslation("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

FormModal.propTypes = {
  header: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  error: PropTypes.any.isRequired,
  fields: PropTypes.any.isRequired,
  actions: PropTypes.any.isRequired,
};

FormModal.defaultProps = {
  error: '',
};

export default reduxForm()(FormModal);
