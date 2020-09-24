import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import SelectorDictionary from './selectorDictionary';
import { compose } from 'recompose';
import Placeholder from 'components/Placeholder';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setDataWithTree } from 'ducks/distanceMap';


const allFieldQuery = gql`
  query{
    all_fields{
      id
      translation
      english_translation: translation(locale_id: 2)
      data_type
  }
}`;

const dictionaryWithPerspectives = gql`
  query DictionaryWithPerspectives{
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translation
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
    }
    is_authenticated
  }
`;

function distanceMap(props) {
  const {
    dictionaryWithPerspectives,
    allField,
    actions,
    location
  } = props;
  const {
    language_tree: languageTree,
    dictionaries,
    loading,
    perspectives,
    is_authenticated: isAuthenticated
  } = dictionaryWithPerspectives;

  if (loading && !location.state) {
    return <Placeholder />;
  }

  useEffect(() => {
    actions.setDataWithTree({
      ...dictionaryWithPerspectives,
      allField
    });
  }, []);

  return (
    <div>
      <SelectorDictionary
        languageTree={languageTree || location.state.languageTree}
        dictionaries={dictionaries || location.state.dictionaries}
        perspectives={perspectives || location.state.perspectives}
        isAuthenticated={isAuthenticated}
        allField={allField.all_fields || location.state.allField}
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
  dataWithTree: PropTypes.object.isRequired
};
export default compose(
  connect(state => state.distanceMap, dispatch => ({ actions: bindActionCreators({ setDataWithTree }, dispatch) })),
  graphql(dictionaryWithPerspectives, { name: 'dictionaryWithPerspectives' }), graphql(allFieldQuery, { name: 'allField' }),
)(distanceMap);

