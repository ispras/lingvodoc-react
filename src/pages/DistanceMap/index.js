import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import MapDict from './map'
import { Dropdown } from 'semantic-ui-react';
import SelectorDict from './selectorDict'


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
        super(props)
        this.state = {
            mainDictionary: null
        }
    }

    render() {
        const { data: { dictionaries: dictionaries } } = this.props
        return (
            <div>
                <label>Выберите словарь</label>
                {(this.state.mainDictionary === null && <SelectorDict dictWithPersp={this.props.data} />)}
                {(this.state.mainDictionary !== null && <MapDict dictionaries={dictionaries} />)}

            </div>
        )
    }
}


export default graphql(dictionaryWithPerspectives)(SelectorDictionary) 