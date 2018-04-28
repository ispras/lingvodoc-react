import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, gql, withApollo } from 'react-apollo';
import { closeModal } from 'ducks/ban';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { Button, Dropdown, Form, Icon, List, Message, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

const queryUsers = gql`
  query Users {
    users {
      id
      name
      login
      intl_name
      is_active
    }
  }
`;

const deactivateUserMutation = gql`
  mutation deactivateUser($userId: Int!) {
    deactivate_user(user_id: $userId) { triumph } }
`;

class BanModal extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = { selected_id: null };
    this.handleBan = this.handleBan.bind(this);
  }

  handleBan()
  {
    if (this.state.selected_id === null)
      return;

    this.props.deactivateUser({
      variables: { userId: this.state.selected_id }
    }).then(() => {
      this.props.closeModal();
    }, () => {
      window.logger.err('Failed to ban user!');
    });
  }

  render()
  {
    const { data } = this.props;
        
    if (data.loading)
      return null;

    const { users } = data;

    const user_selection = users
      .filter(user => user.id != 1 && user.is_active)
      .map(user => ({
        key: user.id,
        value: user.id,
        text: user.login +
          (user.intl_name !== user.login ? ' ' + user.intl_name : '') +
          ` (${user.name})`,
        icon: 'user'}))

    return (
      <div>
        <Modal dimmer open size="small">
          <Modal.Header>Deactivate user account</Modal.Header>
          <Modal.Content>
            <Dropdown
              placeholder="Select user"
              search
              selection
              options={user_selection}
              onChange={(event, data) => this.setState({ selected_id: data.value })}
            />
          </Modal.Content>

          <Modal.Actions>
            <Button
              icon="checkmark"
              basic
              disabled={this.state.selected_id === null}
              color="purple"
              content="Deactivate"
              onClick={this.handleBan} />
            <Button
              icon="remove"
              basic
              content="Cancel"
              onClick={this.props.closeModal} />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

BanModal.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    users: PropTypes.array,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  deactivateUser: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.ban, dispatch => bindActionCreators({ closeModal }, dispatch)),
  graphql(queryUsers),
  graphql(deactivateUserMutation, { name: 'deactivateUser' }),
  branch(({ visible }) => !visible, renderNothing),
  branch(({ data }) => data.loading, renderNothing),
)(BanModal);
