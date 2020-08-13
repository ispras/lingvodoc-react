import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map';
import SelectorDict from './selectorDictionary';
import SelectorLangGropu from './selectorLangGroup';
import { compose } from 'recompose';
import Placeholder from 'components/Placeholder';

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


class SelectorDictionary extends React.Component {
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
  }

  render() {
    const {
      data: {
        language_tree: languageTree,
        dictionaries,
        loading
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

    return (
      <div>
        {(this.state.dictionary === null && this.state.groupLang === null && !loading &&
          <SelectorDict
            languagesGroup={languagesGroup}
            dictWithPersp={this.props.data}
            mainDictionary={mainDictionary}
          />)}
        {(this.state.dictionary !== null && this.state.groupLang === null && !loading &&
          <SelectorLangGropu
            mainDictionaryFun={mainDictionary}
            languagesGroup={this.arrLang}
            mainGroup={mainGroup}
            mainDictionary={this.state.dictionary}
            allLanguages={this.languageTree}
            allDictionaries={this.dictionaries}
            allField={allField}
            groupLang={this.state.groupLang}
          />)}
        {(this.state.groupLang !== null &&
          <MapDict
            dictionaries={this.state.groupLang}
            mainDictionary={this.state.dictionary}
            rootLanguage={this.state.rootLanguage}
            backToDictionaries={mainDictionary}
            allField={allField}
          />)}

      </div>
    );
  }
}

SelectorDictionary.propTypes = {
  data: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    loading: PropTypes.bool
  }).isRequired,
  allField: PropTypes.object.isRequired

};
export default compose(graphql(dictionaryWithPerspectives), graphql(allFieldQuery, { name: 'allField' }))(SelectorDictionary);

