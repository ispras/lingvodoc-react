import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map';
import { Dropdown, Label } from 'semantic-ui-react';
import SelectorDict from './selectorDict';
import SelectorLangGropu from './selectorLangGroup';


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
    };
    this.arrLang = [];
  }

  render() {
    const { data: { dictionaries } } = this.props;
    const mainDictionary = (e) => {
      this.setState({ dictionary: e });
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
        {(this.state.dictionary !== null && <SelectorLangGropu languagesGroup={this.arrLang} dictionaries={dictionaries} mainGroup={mainGroup} mainDictionary={this.state.dictionary} />)}
        {(this.state.groupLang !== null && <MapDict dictionaries={dictionaries} mainDictionary={this.state.dictionary} />)}

      </div>
    );
  }
}


export default graphql(dictionaryWithPerspectives)(SelectorDictionary);
