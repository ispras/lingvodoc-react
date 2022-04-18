import React from "react";
import { Dimmer, Header, Icon, Input } from "semantic-ui-react";
import { withApollo } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";

import { searchQuery } from "./graphql";
import buildPartialLanguageTree from "./partialTree";
import Tree from "./Tree";

class SearchLexicalEntries extends React.Component {
  constructor(props) {
    super(props);

    const { lexicalEntry } = props;
    const entity = lexicalEntry.entities.find(e => e.content && e.content.length >= 2 && e.content.length < 8);

    this.state = {
      searchString: entity ? entity.content.trim() : "",
      resultsTree: null,
      searchInProgress: false
    };

    this.search = this.search.bind(this);
  }

  search() {
    const { searchString } = this.state;
    const { lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, perspectiveId, connectedWords } =
      this.props;

    this.setState({ resultsTree: null, searchInProgress: true });
    this.props.client
      .query({
        query: searchQuery,
        variables: { searchString, field_id: fieldId, perspectiveId }
      })
      .then(
        result => {
          const {
            data: {
              basic_search: { lexical_entries: lexicalEntries }
            }
          } = result;

          const idsToFilter = connectedWords ? connectedWords.lexical_entries.map(entry => entry.id) : [];
          const resultsTree = buildPartialLanguageTree({
            lexicalEntries: lexicalEntries.filter(entry => {
              const entryId = entry.id.toString();
              if (entryId == lexicalEntry.id.toString()) {
                return false;
              }

              return idsToFilter.every(id => id.toString() != entryId);
            }),
            allLanguages,
            allDictionaries,
            allPerspectives
          });
          this.setState({ resultsTree, searchInProgress: false });
        },
        () => {
          this.setState({ searchInProgress: false });
        }
      );
  }

  render() {
    const { joinGroup } = this.props;
    const actions = [{ title: getTranslation("Connect"), action: entry => joinGroup(entry) }];
    return (
      <div style={{ paddingTop: "20px" }}>
        <Input
          action={{ icon: "search", onClick: this.search }}
          placeholder={getTranslation("Type to search")}
          value={this.state.searchString}
          onChange={(e, data) => this.setState({ searchString: data.value })}
        />
        {this.state.searchInProgress && (
          <Dimmer active style={{ minHeight: "600px", background: "none" }}>
            <Header as="h2" icon>
              <Icon name="spinner" loading />
            </Header>
          </Dimmer>
        )}
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
  connectedWords: PropTypes.object
};

export default compose(withApollo, pure)(SearchLexicalEntries);
