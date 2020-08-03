import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map';
import { Dropdown, Label } from 'semantic-ui-react';
import SelectorDict from './selectorDict';
import SelectorLangGropu from './selectorLangGroup';
import { compose } from 'recompose';



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
      rootLanguage:null
    };
    this.arrLang = [];
  }

  render() {
    const { data: { dictionaries } } = this.props;


    const mainDictionary = (e,rootLanguage) => {
      this.setState({ dictionary: e });
      this.setState({rootLanguage:rootLanguage})
    };
    const mainGroup = (e) => {
      this.setState({ groupLang: e });
    };
    const languagesGroup = (e) => {
      this.arrLang.push(e);
    };

    return (
      <div>

        {(this.state.dictionary === null && this.state.groupLang === null && <SelectorDict languagesGroup={languagesGroup} dictWithPersp={this.props.data} mainDictionary={mainDictionary} />)}
        {(this.state.dictionary !== null && this.state.groupLang === null && <SelectorLangGropu mainDictionaryFun={mainDictionary} languagesGroup={this.arrLang} mainGroup={mainGroup} mainDictionary={this.state.dictionary} />)}
        {(this.state.groupLang !== null && <MapDict dictionaries={this.state.groupLang} mainDictionary={this.state.dictionary} rootLanguage={this.state.rootLanguage} backToDictionaries={mainDictionary} />)}

      </div>
    );
  }
}


export default compose(graphql(dictionaryWithPerspectives))(SelectorDictionary);

