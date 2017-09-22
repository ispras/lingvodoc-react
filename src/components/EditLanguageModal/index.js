import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, Dropdown } from 'semantic-ui-react';
import compositeIdToString from '../../utils/compositeId';

import TranslationGist from '../TranslationGist';


/** Component represents a modal dialog for editing language
 * */
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
export default class EditModal extends React.Component {
  render() {
    const { language, close, data } = this.props;

    if (data.loading) {
      return null;
    }

    let parentId;
    if (language.parent_id.every(e => e === null)) {
      parentId = [0, 0];
    } else {
      parentId = data.languages.find(
        lang => compositeIdToString(lang.id) === compositeIdToString(language.parent_id)
      ).parent_id;
    }


    const languageOptions = [
      { key: compositeIdToString([0, 0]),
        text: 'None (Root-level language)',
        value: compositeIdToString([0, 0]),
      },
      ...data.languages.map(
        lang => (
          { key: compositeIdToString(lang.id),
            text: lang.translation,
            value: compositeIdToString(lang.id),
          })),
    ];

    return (

      <Modal dimmer open size="small" >
        <Modal.Header>Language edit</Modal.Header>
        <Modal.Content>


          {/* List of parent languages */}
          <h4>Parent language</h4>
          <Dropdown
            floating
            options={languageOptions}
            search
            selection
            scrolling
            placeholder="Select Language"
            defaultValue={compositeIdToString(parentId)}
          />

          {/* List of translations */}
          <h4>Translations</h4>
          <TranslationGist id={language.translation_gist_id} editable />

        </Modal.Content>

        <Modal.Actions>
          <Button icon="check" content="Save" onClick={close} />
          <Button icon="minus" content="Cancel" onClick={close} />
        </Modal.Actions>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
};

EditModal.defaultProps = {
  data: {},
};
