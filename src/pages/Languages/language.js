import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import { Dropdown } from 'semantic-ui-react';
import compositeIdToString from '../../utils/compositeId';

import { languagesQuery, createLanguageMutation } from '../../graphql/language';


// this enhancer function is used to wrap
const enhancer = compose(
  graphql(createLanguageMutation, { name: 'createLanguage' })
);

/**
 * This component represent a single node of the of languages
 */
const Language = enhancer((props) => {
  // this callback is executed when user clicks '+'
  // button to create a new child language
  const createChildLanguage = () => {
    const { language: { id }, createLanguage } = props;
    createLanguage({
      variables: { parent_id: id, translation_atoms: [] },
      refetchQueries: [{ query: languagesQuery }],
    });
  };

  const { language, edit } = props;
  return (<ul>
    <li>
      <Dropdown inline text={language.translation}>
        <Dropdown.Menu>
          <Dropdown.Item icon="plus" text="Create a new child language" onClick={createChildLanguage} />
          <Dropdown.Item icon="setting" text="Edit..." onClick={() => edit(language)} />
        </Dropdown.Menu>
      </Dropdown>

      <ul>
        {language.languages.map(lang => (
          <Language
            key={compositeIdToString(lang.id)}
            language={lang}
            edit={edit}
          />
        ))}
      </ul>
    </li>
  </ul>);
});

Language.propTypes = {
  /**
   * Language object
   */
  language: PropTypes.object.isRequired,

  /**
   * Edit language handler
   * @param {Array} parentId IDs of language which will be used as parent
   *                         for newly created language.
   */
  edit: PropTypes.func,

  create: PropTypes.func,
};

Language.defaultProps = {
  edit: () => {},
  createLanguage: () => {},
};

export default Language;
