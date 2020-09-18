import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map';
import SelectorDictionary from './selectorDictionary';
import SelectorLangGropu from './selectorLangGroup';
import { compose } from 'recompose';
import Placeholder from 'components/Placeholder';
import { connect } from 'react-redux';

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
  query DictionaryWithPerspectivesProxy {
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

class DistanceMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionary: null,
      groupLang: null,
      rootLanguage: null,
    };
    this.arrLang = [];
    this.languageTree = [];
    this.dictionaries = [];
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      dictionary: null,
      groupLang: null
    });
  }
  render() {
    const {
      data: {
        language_tree: languageTree,
        dictionaries,
        loading,
        perspectives,
        is_authenticated: isAuthenticated
      },
      allField
    }
      = this.props;

    const mainDictionary = (e, rootLanguage) => {
      this.setState({ dictionary: e });
      this.setState({ rootLanguage });
    };
    const mainGroup = (e) => {
      this.setState({ groupLang: e });
    };
    const languagesGroup = (e) => {
      this.arrLang.push(e);
    };

    if (loading) {
      return <Placeholder />;
    }

    this.languageTree = languageTree || this.languageTree;
    this.dictionaries = dictionaries || this.dictionaries;
    this.perspectives = perspectives || this.perspectives;
    this.isAuthenticated = isAuthenticated || this.isAuthenticated;
    return (
      <div>
        {(((this.state.dictionary === null && this.state.groupLang === null && !loading) ||
          (this.state.statusTest)) &&
          <SelectorDictionary
            languagesGroup={languagesGroup}
            mainDictionary={mainDictionary}
            languageTree={this.languageTree}
            dictionaries={this.dictionaries}
            perspectives={this.perspectives}
            isAuthenticated={this.isAuthenticated}
          />)}
        {(this.state.dictionary !== null && this.state.groupLang === null && !loading &&
          <SelectorLangGropu
            mainDictionaryFun={mainDictionary}
            languagesGroup={this.arrLang}
            mainGroup={mainGroup}
            mainDictionary={this.state.dictionary}
            allLanguages={this.languageTree}
            allDictionaries={this.dictionaries}
            groupLang={this.state.groupLang}
          />)}
        {(this.state.groupLang !== null &&
          <MapDict
            mainDictionaryFun={mainDictionary}
            mainGroup={mainGroup}
            dictionaries={this.state.groupLang}
            mainDictionary={this.state.dictionary}
            rootLanguage={this.state.rootLanguage}
            backToDictionaries={this.reset}
            allField={allField}
          />)}

      </div>
    );
  }
}

DistanceMap.propTypes = {
  data: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    loading: PropTypes.bool
  }).isRequired,
  allField: PropTypes.object.isRequired

};
export default compose(graphql(dictionaryWithPerspectives), graphql(allFieldQuery, { name: 'allField' }))(DistanceMap);

