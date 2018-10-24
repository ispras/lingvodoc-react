import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import { Container, Dimmer, Loader, Tab, Button, Divider, Menu, Message } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import BlobsModal from 'components/Search/blobsModal';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { compositeIdToString } from 'utils/compositeId';

import { newSearch, deleteSearch, storeSearchResult } from 'ducks/search';

const mdColors = new Immutable.List([
  '#E53935',
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
]).sortBy(Math.random);

const searchQuery = gql`
  query Search($query: [[ObjectVal]]!, $category: Int, $adopted: Boolean, $etymology: Boolean, $mode: String, $langs: [LingvodocID]) {
    advanced_search(search_strings: $query, category: $category, adopted: $adopted, etymology: $etymology, mode: $mode, languages: $langs) {
      dictionaries {
        id
        parent_id
        translation
        additional_metadata {
          location
          blobs
        }
      }
      perspectives {
        id
        parent_id
        translation
        additional_metadata {
          location
        }
        tree {
          id
          translation
        }
      }
      lexical_entries {
        id
        parent_id
        entities(mode: $mode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
        }
      }
      entities {
        id
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
  }
`;

class Wrapper extends React.Component {
  componentWillReceiveProps(props) {
    // store search results aquired with graphql into Redux state
    const { data, searchId, actions } = props;
    if (!data.error && !data.loading) {
      const oldSearchResult = this.props.searches.find(s => s.id === searchId);
      // only update if results are different to avoid infinite loop
      if (!isEqual(oldSearchResult.results, data.advanced_search)) {
        actions.storeSearchResult(searchId, data.advanced_search);
      }
    }
  }

  render() {
    const { data } = this.props;

    if (data.error) {
      return null;
    }

    if (data.loading) {
      return (
        <Dimmer active={data.loading} inverted>
          <Loader>Loading</Loader>
        </Dimmer>
      );
    }

    const { language_tree: allLanguages, advanced_search: advancedSearch } = data;

    const searchResults = Immutable.fromJS(advancedSearch);
    const languages = Immutable.fromJS(allLanguages);
    const languagesTree = buildLanguageTree(languages);
    const searchResultsTree = buildSearchResultsTree(searchResults, languagesTree);
    const resultsCount = searchResults.get('dictionaries').filter(d => (d.getIn(['additional_metadata', 'location']) !== null));
    return <div>
      <Message positive>
        Found {resultsCount.size} resuls on <a href="" onClick={(e) => {
          e.preventDefault();
          document.getElementById('mapResults').scrollIntoView();
        }}>map</a>
      </Message>
      <LanguageTree searchResultsTree={searchResultsTree} />
    </div>;
  }
}

const WrapperWithData = compose(
  connect(
    state => state.search,
    dispatch => ({
      actions: bindActionCreators({ storeSearchResult }, dispatch),
    })
  ),
  graphql(searchQuery)
)(Wrapper);

const Info = ({
  query, searchId, adopted, etymology, category, langs,
}) => {
  // remove empty strings
  const cleanQuery = query
    .map(q => q.filter(p => p.search_string.length > 0 && p.matching_type.length > 0))
    .filter(q => q.length > 0);
  if (cleanQuery.length > 0) {
    return (
      <WrapperWithData
        searchId={searchId}
        query={cleanQuery}
        category={category}
        adopted={adopted}
        etymology={etymology}
        langs={langs}
        mode="published"
      />
    );
  }
  return null;
};

Info.propTypes = {
  query: PropTypes.array.isRequired,
  searchId: PropTypes.number.isRequired,
  category: PropTypes.number,
  adopted: PropTypes.bool,
  etymology: PropTypes.bool,
  langs: PropTypes.array,
};

function searchesFromProps({ searches }) {
  return searches.reduce((ac, s) => ac.set(s.id, Immutable.fromJS({
    id: s.id,
    text: `Search ${s.id}`,
    color: mdColors.get(s.id - 1),
    isActive: true,
  })), new Immutable.Map());
}

class SearchTabs extends React.Component {
  constructor(props) {
    super(props);

    this.labels = this.labels.bind(this);
    this.clickLabel = this.clickLabel.bind(this);
    this.dictResults = this.dictResults.bind(this);


    this.state = {
      mapSearches: searchesFromProps(props),
      intersec: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      mapSearches: searchesFromProps(nextProps),
      intersec: 0,
    });
  }

  labels() {
    return this.state.mapSearches.valueSeq().toJS();
  }

  clickLabel(id) {
    this.setState({
      mapSearches: this.state.mapSearches.updateIn([id, 'isActive'], v => !v),
    });
  }

  dictResults() {
    return new Immutable.Map().withMutations((map) => {
      this.props.searches.forEach((search) => {
        if (search.results.dictionaries) {
          const filteredDicts = search.results.dictionaries.filter(d => d.additional_metadata.location);

          filteredDicts.forEach(dict =>
            map.update(Immutable.fromJS(dict), new Immutable.Set(), v => v.add(search.id)));
        }
      });
    });
  }

  render() {
    const { searches, actions } = this.props;

    function onSearchClose(id) {
      return (event) => {
        event.stopPropagation();
        actions.deleteSearch(id);
      };
    }

    const searchPanes = searches.map(search => ({
      menuItem: (
        <Menu.Item key={search.id}>
          Search {search.id}
          <Button
            compact
            basic
            icon="delete"
            style={{ marginLeft: '1em' }}
            onClick={onSearchClose(search.id)}
          />
        </Menu.Item>
      ),
      render: () => (
        <Tab.Pane attached={false} key={search.id}>
          <Container>
            <h3>Search</h3>

            <QueryBuilder searchId={search.id} data={fromJS(search.query)} />
            <Info
              searchId={search.id}
              query={search.query}
              category={search.category}
              adopted={search.adopted}
              etymology={search.etymology}
              langs={search.langs}
            />
          </Container>
        </Tab.Pane>
      ),
    }));

    // create tabs
    const panes = [
      ...searchPanes,
      {
        menuItem: <Button key="@search_tab_add_button" basic onClick={actions.newSearch} content="+" />,
        render: () => null,
      },
    ];

    return (
      <Container>
        <Tab menu={{ pointing: true }} panes={panes} />
        <Divider id="mapResults" section />
        <Labels data={this.labels()} onClick={this.clickLabel} />
        <IntersectionControl
          max={this.state.mapSearches.filter(f => f.get('isActive')).size}
          value={this.state.intersec}
          onChange={e => this.setState({ intersec: e.target.value })}
        />
        <ResultsMap
          data={this.dictResults()}
          meta={this.state.mapSearches}
          intersect={this.state.intersec}
        />
        <BlobsModal />
      </Container>
    );
  }
}

SearchTabs.propTypes = {
  searches: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    newSearch: PropTypes.func.isRequired,
    deleteSearch: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(
  state => state.search,
  dispatch => ({
    actions: bindActionCreators({ newSearch, deleteSearch }, dispatch),
  })
)(SearchTabs);
