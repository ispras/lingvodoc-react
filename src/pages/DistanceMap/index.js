import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import SelectorDictionary from './selectorDictionary';
import { compose } from 'recompose';
import Placeholder from 'components/Placeholder';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setDataForTree, setDefaultGroup, setMainGroupLanguages } from 'ducks/distanceMap';
import checkCoordAndLexicalEntries from './checkCoordinatesAndLexicalEntries';


const allFieldQuery = gql`
    query{
        all_fields{
            id
            translation
            english_translation: translation(locale_id: 2)
            data_type
        }
    }`;

const dictionaryWithPerspectivesQuery = gql`
    query DictionaryWithPerspectives{
        dictionaries(proxy: false, published: true) {
            id
            parent_id
            translation
            category
            additional_metadata {
                authors
                location
            }
            perspectives {
                id
                translation
                columns{
                    field_id
                }
            }
        }
        perspectives {
            id
            parent_id
            translation

        }
        language_tree {
            id
            parent_id
            translation
            created_at
            dictionaries(deleted: false, published: true) {
                id
                parent_id
                translation
                category
                additional_metadata {
                    authors
                    location
                }
                perspectives {
                    id
                    translation
                    columns{
                        field_id
                    }
                }
            }
            additional_metadata {
                speakersAmount
            }
        }
        is_authenticated
    }
`;

function distanceMap(props) {
  const {
    dataForTree,
    dictionaryWithPerspectives,
    allField,
    actions,
    languagesGroupState,
    selected,
    mainGroupDict
  } = props;

  const {
    language_tree: languageTree,
    dictionaries,
    loading,
    perspectives,
    is_authenticated: isAuthenticated
  } = props.dictionaryWithPerspectives;

  const { arrDictionariesGroup } = languagesGroupState;


  if (loading && !dataForTree.dictionaries) {
    return <Placeholder/>;
  }




    useEffect(() => {
      if (!dataForTree.dictionaries) {
      actions.setDataForTree({
        ...dictionaryWithPerspectives,
        allField,
        id: selected.id
      });}
    }, []);


  if (selected.id !== dataForTree.idLocale) {
    if (!dictionaries) {
      actions.setDataForTree({
        ...dictionaryWithPerspectives,
        allField,
        id: selected.id
      });
      return <Placeholder/>;
    }
  }


  useEffect(() => {
    if (mainGroupDict.length !== 0) {
      actions.setMainGroupLanguages({});
    }
  }, []);


  const newDictionaries = checkCoordAndLexicalEntries(dictionaries || dataForTree.dictionaries);
  const newLanguagesTree = languageTree || dataForTree.languageTree;
  const fileredLanguageTree = newLanguagesTree.map((lang) => {
    lang.dictionaries = checkCoordAndLexicalEntries(lang.dictionaries);
    return lang;
  });

  return (
    <div>
      <SelectorDictionary
        languageTree={fileredLanguageTree}
        dictionaries={newDictionaries}
        perspectives={perspectives || dataForTree.perspectives}
        isAuthenticated={isAuthenticated}
        allField={allField.all_fields || dataForTree.allField}
      />
    </div>
  );
}

distanceMap.propTypes = {
  dictionaryWithPerspectives: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    loading: PropTypes.bool
  }).isRequired,
  allField: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  languagesGroupState: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  mainGroupDict: PropTypes.object.isRequired
};
export default compose(
  connect(state => state.distanceMap, dispatch => ({
    actions: bindActionCreators({
      setDataForTree,
      setDefaultGroup,
      setMainGroupLanguages
    }, dispatch)
  })),
  connect(state => state.locale),
  graphql(dictionaryWithPerspectivesQuery, { name: 'dictionaryWithPerspectives' }), graphql(allFieldQuery, { name: 'allField' }),
)(distanceMap);

