import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { withApollo } from 'react-apollo';
import { Input } from 'semantic-ui-react';

import { searchQuery, connectedQuery } from './graphql';
import buildPartialLanguageTree from './partialTree';
import Tree from './Tree';
import { getTranslation } from 'api/i18n';

class SearchLexicalEntries extends React.Component {
  constructor(props) {
    super(props);

    const { lexicalEntry } = props;
    const entity = lexicalEntry.entities.find(e => e.content && e.content.length >= 2 && e.content.length < 8);

    this.state = {
      searchString: entity ? entity.content : '',
      resultsTree: null,
    };

    this.search = this.search.bind(this);
  }

  async search() {
    const { searchString } = this.state;
    const {
      lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, perspectiveId, entitiesMode, filterConnected
    } = this.props;

    const { data: { basic_search: { lexical_entries: lexicalEntries } } } = await this.props.client.query({
      query: searchQuery,
      variables: { searchString, field_id: fieldId, perspectiveId },
    });

    let idsToFilter = [];
    if (filterConnected) {
      const result = await this.props.client.query({
        query: connectedQuery,
        variables: { id: lexicalEntry.id, fieldId, entitiesMode },
      });
      idsToFilter = result.data.connected_words.lexical_entries.map(entry => entry.id);
    }

    const resultsTree = buildPartialLanguageTree({
      lexicalEntries: lexicalEntries.filter(entry => {
        const entryId = entry.id.toString();
        if (entryId == lexicalEntry.id.toString()) {
          return false;
        }

        return idsToFilter.every(id => id.toString() != entryId)
      }),
      allLanguages,
      allDictionaries,
      allPerspectives,
    });
    this.setState({ resultsTree });
  }

  render() {
    const { joinGroup } = this.props;
    const actions = [{ title: getTranslation('Connect'), action: entry => joinGroup(entry) }];
    return (
      <div style={{ paddingTop: '20px' }}>
        <Input
          action={{ icon: 'search', onClick: this.search }}
          placeholder={getTranslation("Type to search")}
          value={this.state.searchString}
          onChange={(e, data) => this.setState({ searchString: data.value })}
        />
        {this.state.resultsTree && <Tree resultsTree={this.state.resultsTree} actions={actions} />}
      </div>
    );
  }
}

SearchLexicalEntries.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  perspectiveId: PropTypes.array,
  joinGroup: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  entitiesMode: PropTypes.string,
  filterConnected: PropTypes.bool
};

export default compose(withApollo, pure)(SearchLexicalEntries);
