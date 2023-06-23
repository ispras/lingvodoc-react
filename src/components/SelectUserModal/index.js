import React, { useContext, useState } from "react";
import { Button, Dropdown, Icon, Message, Modal } from "semantic-ui-react";
import { gql, useQuery } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { filter } from "lodash";
//import { filter, find, some, union, uniq, without } from "lodash";
import PropTypes from "prop-types";
import { queryUsers } from "components/BanModal";
import { useMutation } from "hooks";

import TranslationContext from "Layout/TranslationContext";

const computeRolesBulkMutation = gql`
  mutation computeRolesBulk(
    $userId: Int!
    $languageId: LingvodocID!
  ) {
    add_roles_bulk(
      user_id: $userId
      language_id: $languageId
    ) {
      language_count,
      dictionary_count,
      perspective_count
    }
  }
`;

const SelectUserModal = ({ language, close }) => {
  const [addRole] = useMutation(computeRolesBulkMutation);
  const getTranslation = useContext(TranslationContext);
  const [ selectedUser, setSelectedUser ] = useState(null);
  const { data, error, loading } = useQuery(queryUsers);

  if (loading) {
    return (
      <span>
        {getTranslation("Loading user data")}... <Icon name="spinner" loading />
      </span>
    );
  }
  if (error) {
    return (
      <Message negative compact>
        <Message.Header>{getTranslation("User data loading error")}</Message.Header>
        <div style={{ marginTop: "0.25em" }}>
          {getTranslation("Try reloading the page; if the error persists, please contact administrators.")}
        </div>
      </Message>
    );
  }

  const allUsers = data.users ? data.users : [];
  const userOptions = allUsers
    .map(u => ({
      key: u.id,
      value: u.id,
      text: `${u.name} (${u.intl_name !== u.login ? `${u.intl_name}, ` : ""}${u.login})`
    }))
    .filter(u => u.value !== 1);

  return (
    <Modal className="lingvo-modal2" dimmer open size="small" closeIcon onClose={close}>
      <Modal.Header>{getTranslation("Allow permissions")}</Modal.Header>
      <Modal.Content>
        <h4>{getTranslation("Allow permissions")}</h4>
        <Dropdown
          key={selectedUser}
          placeholder={getTranslation("Select user")}
          search
          selection
          options={userOptions}
          selectOnBlur={false}
          value={selectedUser}
          onChange={(e, d) => setSelectedUser(d.value)}
          className="lingvo-roles-dropdown lingvo-roles-dropdown_search"
          icon={<i className="lingvo-icon lingvo-icon_arrow" />}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Close")} onClick={close} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
}

SelectUserModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default SelectUserModal;
