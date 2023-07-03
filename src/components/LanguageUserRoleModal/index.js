import React, { useContext, useState, useMemo } from "react";
import { Button, Dropdown, Icon, Message, Modal } from "semantic-ui-react";
import { gql, useQuery } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { filter } from "lodash";
import PropTypes from "prop-types";
import { queryUsers } from "components/BanModal";
import { useMutation } from "hooks";
import { updateLanguageMetadataMutation } from "backend";

import TranslationContext from "Layout/TranslationContext";

// gql to call add_roles_bulk mutation
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

// functional component
const SelectUserModal = ({ language, close, added, kind}) => {
  const getTranslation = useContext(TranslationContext);
  const [ selectedUser, setSelectedUser ] = useState(null);
  const [addRole, { error: addRoleError, loading: addRoleLoading }] = useMutation(computeRolesBulkMutation);
  const [addSign, { error: addSignError, loading: addSignLoading }] = useMutation(updateLanguageMetadataMutation);

  const onSelectUser = (userId) => {
    const onSuccess = () => {
      close();
      added({user_id: userId, language_id: language.id});
      window.logger.suc(getTranslation("Added " + kind + " successfully."));
    }

    if (kind === 'roles')
      addRole({ variables: { userId, languageId: language.id }}).then(onSuccess);

    if (kind === 'sign')
      addSign({
        variables: {
          id: language.id,
          metadata: {},
          new_user: userId
        }
      }).then(onSuccess);
  }

  // handling gql to query users list
  const { data, error, loading } = useQuery(queryUsers);
  const userOptions = useMemo(
    () =>
      data && data.users &&
      data.users
        .map(u => ({
          key: u.id,
          value: u.id,
          text: `${u.name} (${u.intl_name !== u.login ? `${u.intl_name}, ` : ""}${u.login})`
        }))
        .filter(u => u.value !== 1),
    [data]);

  const asModal = (content) => (
    <Modal className="lingvo-modal2" dimmer open size="small" closeIcon onClose={close}>
      <Modal.Header>{getTranslation("Add " + kind)}</Modal.Header>
      <Modal.Content>
        {content}
      </Modal.Content>
      <Modal.Actions>
        <Button content={addRoleLoading || addSignLoading
                         ? <span>{getTranslation("Adding " + kind)}... <Icon name="spinner" loading /></span>
                         : getTranslation("Add " + kind)}
                disabled={!selectedUser || addRoleLoading || addSignLoading}
                onClick={() => selectedUser && onSelectUser(selectedUser)}
                className="lingvo-button-violet"
        />
        <Button content={getTranslation("Close")} onClick={close} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );

  if (loading) {
    return asModal(
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
  if (addRoleError || addSignError) {
    return (
      <Message negative compact>
        <Message.Header>{getTranslation("Adding " + kind + " error")}</Message.Header>
        <div style={{ marginTop: "0.25em" }}>
          {getTranslation("Please contact administrators.")}
        </div>
      </Message>
    );
  }

  return asModal(
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
      disabled={addRoleLoading || addSignLoading}
    />
  );
}

SelectUserModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  added: PropTypes.func.isRequired,
  kind: PropTypes.string.isRequired
};

export default SelectUserModal;
