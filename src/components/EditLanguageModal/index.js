import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, Dropdown } from 'semantic-ui-react';
import { compositeIdToString } from '../../utils/compositeId';

import TranslationGist from '../TranslationGist';

import { languagesQuery } from '../../graphql/language';


/**
 * Component represents a modal dialog for editing language
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
@graphql(gql`
  mutation updateParentLanguage($id: [Int]!, $parent_id: [Int]!)  {
    update_language(id: $id, parent_id: $parent_id) {
      language {
        id
        translation
        translation_gist_id
      }
    }
  }
`, { name: 'updateParentLanguage' })
export default class EditModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parentId: props.language.parent_id,
    };

    this.onChangeParentLanguage = this.onChangeParentLanguage.bind(this);
    this.saveParentLanguage = this.saveParentLanguage.bind(this);
  }

  onChangeParentLanguage(event, data) {
    const { data: { languages } } = this.props;
    const language = languages.find(lang =>
      compositeIdToString(lang.id) === data.value);
    if (language) {
      this.setState({ parentId: language.id });
    }
  }

  saveParentLanguage() {
    const { updateParentLanguage, language } = this.props;
    const { parentId } = this.state;
    updateParentLanguage({
      variables: { parent_id: parentId, id: language.id },
      refetchQueries: [{
        query: languagesQuery,
      }],
    });
  }

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
      ).id;
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

    const isParentChanged = compositeIdToString(language.parent_id) !==
                            compositeIdToString(this.state.parentId);

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
            onChange={this.onChangeParentLanguage}
          />
          {isParentChanged &&
            <Button onClick={this.saveParentLanguage}>Save</Button>
          }

          {/* List of translations */}
          <h4>Translations</h4>
          <TranslationGist id={language.translation_gist_id} editable />

        </Modal.Content>

        <Modal.Actions>
          <Button icon="minus" content="Close" onClick={close} />
        </Modal.Actions>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
  updateParentLanguage: PropTypes.func,
};

EditModal.defaultProps = {
  data: {},
  updateParentLanguage: () => {},
};
