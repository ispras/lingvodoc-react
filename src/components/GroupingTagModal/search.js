import React, { useState, useContext } from "react";
import { Dimmer, Header, Icon, Input, Segment } from "semantic-ui-react";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { branch, compose, pure, renderComponent, renderNothing } from "recompose";
import Placeholder from "components/Placeholder";
import TranslationContext from "Layout/TranslationContext";

import { searchQuery, perspectiveFieldsQuery } from "./graphql";
import buildPartialLanguageTree from "./partialTree";
import Tree from "./Tree";
import { isEqual } from "lodash";

const SearchLexicalEntries = ({
  data,
  joinGroup,
  lexicalEntry,
  fieldId,
  allLanguages,
  allDictionaries,
  allPerspectives,
  perspectiveId,
  connectedWords,
  client
}) => {
  const getTranslation = useContext(TranslationContext);

  const {
    perspective: { columns }
  } = data;

  let aff_meaning_field_id = null;

  for (const column of columns) {
    const {
      field: { id: field_id, english_translation: field_name }
    } = column;
    if (field_name === "Meaning of affix") {
      aff_meaning_field_id = field_id;
      break;
    }
  }

  const aff_meaning = lexicalEntry.entities.find(e => e.content && isEqual(e.field_id, aff_meaning_field_id));
  const some_entity = lexicalEntry.entities.find(e => e.content && e.content.length >= 2 && e.content.length < 8);
  const entity = aff_meaning ? aff_meaning : some_entity;

  const [searchString, setSearchString] = useState(entity ? entity.content.trim() : "");
  const [resultsTree, setResultsTree] = useState(null);
  const [searchInProgress, setSearchInProgress] = useState(false);

  const search = () => {
    setResultsTree(null);

    setSearchInProgress(true);

    client
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
          setResultsTree(resultsTree);
          setSearchInProgress(false);
        },
        () => {
          setSearchInProgress(false);
        }
      );
  };

  const actions = [
    {
      title: getTranslation("Connect"),
      className: "lingvo-button-greenest",
      action: entry => joinGroup(entry)
    }
  ];
  return (
    <div>
      <Segment className="lingvo-segment-grouptag-search">
        <Input
          action={{ icon: <i className="lingvo-icon lingvo-icon_search2" />, onClick: search }}
          placeholder={getTranslation("Type to search")}
          value={searchString}
          onChange={(e, data) => setSearchString(data.value)}
          className="lingvo-search-input lingvo-search-input_grouptag"
        />

        {searchInProgress && (
          <Dimmer active style={{ minHeight: "600px", background: "none" }}>
            <Header as="h2" icon>
              <Icon name="spinner" loading />
            </Header>
          </Dimmer>
        )}
        {resultsTree && <Tree resultsTree={resultsTree} actions={actions} />}
      </Segment>
    </div>
  );
};

SearchLexicalEntries.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  perspectiveId: PropTypes.array,
  joinGroup: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  entitiesMode: PropTypes.string,
  connectedWords: PropTypes.object
};

export default compose(
  graphql(perspectiveFieldsQuery, {
    options: ({ lexicalEntry }) => ({ variables: { perspectiveId: lexicalEntry.parent_id } })
  }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing),
  withApollo,
  pure
)(SearchLexicalEntries);
