import React from "react";
import { connect } from "react-redux";
import { Button, Dropdown, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { sortBy } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { closeModal } from "ducks/ban";
import TranslationContext from "Layout/TranslationContext";

export const queryUsers = gql`
  query Users {
    users {
      id
      name
      login
      intl_name
      email
      is_active
    }
  }
`;

const activateDeactivateUserMutation = gql`
  mutation activateDeactivateUser($userId: Int!, $isActive: Boolean!) {
    activate_deactivate_user(user_id: $userId, is_active: $isActive) {
      triumph
    }
  }
`;

class BanModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected_user: null };
    this.handleActivateDeactivate = this.handleActivateDeactivate.bind(this);
  }

  handleActivateDeactivate() {
    const user = this.state.selected_user;
    if (user === null) {
      return;
    }

    const success_str = user.is_active ? "Successfully deactivated user" : "Successfully activated user";
    const error_str = user.is_active ? "Failed to deactive user" : "Failed to activate user";

    const user_str = `'${user.login}' (${user.name}${user.intl_name !== user.login ? `, ${user.intl_name}` : ""})`;

    const { refetch } = this.props.data;

    this.props
      .activateDeactivateUser({
        variables: {
          userId: user.id,
          isActive: !user.is_active
        }
      })
      .then(
        () => {
          window.logger.suc(`${this.context(success_str)} ${user_str}.`);
          this.props.closeModal();
          refetch();
        },
        () => {
          window.logger.err(`${this.context(error_str)} ${user_str}!`);
        }
      );
  }

  render() {
    const { visible, data } = this.props;
    if (!visible || data.loading || data.error) {
      return null;
    }

    const { users } = data;
    const user_list = sortBy(
      users.filter(user => user.id != 1),
      user => [user.login, user.name, user.intl_name, user.email]
    );
    const user_map = new Map(user_list.map(user => [user.id, user]));
    const user_selection = user_list.map(user => ({
      key: user.id,
      value: user.id,
      text:
        `'${user.login}'` +
        ` (${user.name}${user.intl_name !== user.login ? `, ${user.intl_name}` : ""})` +
        ` ${user.email} [${user.is_active ? "active" : "inactive"}]`,
      icon: "user"
    }));

    return (
      <div>
        <Modal closeIcon onClose={this.props.closeModal} dimmer open size="small" className="lingvo-modal2">
          <Modal.Header>{this.context("User account activation/deactivation")}</Modal.Header>
          <Modal.Content>
            <div style={{ width: "80%" }}>
              <Dropdown
                fluid
                placeholder={this.context("Select user")}
                search
                selection
                options={user_selection}
                onChange={(event, data) => this.setState({ selected_user: user_map.get(data.value) })}
              />
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button
              disabled={this.state.selected_user === null}
              content={
                this.state.selected_user === null
                  ? this.context("Activate / Deactivate")
                  : this.state.selected_user.is_active
                  ? this.context("Deactivate")
                  : this.context("Activate")
              }
              onClick={this.handleActivateDeactivate}
              className="lingvo-button-violet"
            />
            <Button
              content={this.context("Cancel")}
              onClick={this.props.closeModal}
              className="lingvo-button-basic-black"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

BanModal.contextType = TranslationContext;

BanModal.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    users: PropTypes.array
  }),
  closeModal: PropTypes.func.isRequired,
  activateDeactivateUser: PropTypes.func.isRequired
};

export default compose(
  connect(
    state => state.ban,
    dispatch => bindActionCreators({ closeModal }, dispatch)
  ),
  graphql(queryUsers, { skip: props => !props.visible }),
  graphql(activateDeactivateUserMutation, { name: "activateDeactivateUser" })
)(BanModal);
