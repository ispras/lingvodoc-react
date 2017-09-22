import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, Dropdown } from 'semantic-ui-react';
import compositeIdToString from '../../utils/compositeId';

import TranslationGist from '../TranslationGist';

@graphql(gql`
  query Languages {
    languages {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
  }
`)
export default class CreateModal extends React.Component {
  render() {
    const { parent, close, data } = this.props;

    if (data.loading) {
      return null;
    }

    let parentId;
    if (parent.id.every(e => e === null)) {
      parentId = [0, 0];
    } else {
      parentId = parent.id;
    }

    // We need to supply dropdown with the list of languages in order to
    // use its search capabilities
    // { key: '1_1', text: 'English', value: '1_1' }
    const languageOptions = data.languages.map(
      lang => (
        { key: compositeIdToString(lang.id),
          text: lang.translation,
          value: compositeIdToString(lang.id),
        }
      )
    );

    return (
      <Modal
        size="small"
        dimmer
        open
      >
        <Modal.Header>Language create</Modal.Header>
        <Modal.Content>
          {/* List of parent languages */}
          <h4>Parent language</h4>
          <Dropdown
            floating
            options={languageOptions}
            search
            selection
            placeholder="Select Language"
            defaultValue={compositeIdToString(parentId)}
          />

          {/* List of translations */}
          <h4>Translations</h4>
          <TranslationGist id={[1, 169]} editable />

        </Modal.Content>

        <Modal.Actions>
          <Button icon="check" content="Save" onClick={close} />
          <Button icon="minus" content="Cancel" onClick={close} />
        </Modal.Actions>
      </Modal>
    );
  }
}

CreateModal.propTypes = {
  parent: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
};

CreateModal.defaultProps = {
  data: {},
};
