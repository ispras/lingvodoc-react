import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { withApollo } from 'react-apollo';
import { Input } from 'semantic-ui-react';

import { searchQuery } from './graphql';
import buildPartialLanguageTree from './partialTree';
import Tree from './Tree';

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
      lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, perspectiveId
    } = this.props;

    const { data: { basic_search: { lexical_entries: lexicalEntries } } } = await this.props.client.query({
      query: searchQuery,
      variables: { searchString, field_id: fieldId, perspectiveId },
    });

    const resultsTree = buildPartialLanguageTree({
      lexicalEntries: lexicalEntries.filter(entry => entry.id.toString() != lexicalEntry.id.toString()),
      allLanguages,
      allDictionaries,
      allPerspectives,
    });
    this.setState({ resultsTree });
  }

  render() {
    const { joinGroup } = this.props;
    const actions = [{ title: 'Connect', action: entry => joinGroup(entry) }];
    return (
      <div style={{ paddingTop: '20px' }}>
        <Input
          action={{ icon: 'search', onClick: this.search }}
          placeholder="Search..."
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
};

export default compose(withApollo, pure)(SearchLexicalEntries);
