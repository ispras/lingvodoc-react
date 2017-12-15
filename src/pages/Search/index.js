import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { gql, graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { Checkbox, Segment, Radio, Container, Grid, Dimmer, Loader, Tab, Button, Divider } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import BlobsModal from 'components/Search/blobsModal';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { compositeIdToString } from 'utils/compositeId';

import { newSearch, storeSearchResult } from 'ducks/search';

const adder = i => v => v.add(`search_${i}`);

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
  query Search($query: [[ObjectVal]]!, $category: Int, $adopted: Boolean, $etymology: Boolean) {
    advanced_search(search_strings: $query, category: $category, adopted: $adopted, etymology: $etymology) {
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
      }
      entities {
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

    const lexicalEntriesWithEntities = advancedSearch.lexical_entries.map((entry) => {
      const id = compositeIdToString(entry.id);
      return {
        ...entry,
        entities: advancedSearch.entities.filter(entity => compositeIdToString(entity.parent_id) === id),
      };
    });

    const r = {
      ...advancedSearch,
      lexical_entries: lexicalEntriesWithEntities,
    };

    const searchResults = Immutable.fromJS(r);
    const languages = Immutable.fromJS(allLanguages);
    const languagesTree = buildLanguageTree(languages);
    const searchResultsTree = buildSearchResultsTree(searchResults, languagesTree);

    return <LanguageTree searchResultsTree={searchResultsTree} />;
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
  query, searchId, adopted, etymology, category,
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

  render() {
    const { searches, actions } = this.props;

    const searchPanes = searches.map(search => ({
      menuItem: { key: `${search.id}`, content: `Search ${search.id}` },
      render: () => (
        <Tab.Pane key={search.id}>
          <Container>
            <h3>Search</h3>

            <QueryBuilder searchId={search.id} data={fromJS(search.query)} />
            <Info
              searchId={search.id}
              query={search.query}
              category={search.category}
              adopted={search.adopted}
              etymology={search.etymology}
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

    const dictionariesWithLocation = searches.map(result =>
      (result.results.dictionaries ? result.results.dictionaries.filter(d => d.additional_metadata.location) : []));

    const dictResults = dictionariesWithLocation.reduce(
      (ac, vals, i) => vals.reduce((iac, val) => iac.update(Immutable.fromJS(val), new Immutable.Set(), adder(i)), ac),
      new Immutable.Map()
    );

    return (
      <Container>
        <Tab panes={panes} />
        <Divider section />
        <Labels data={this.labels()} onClick={this.clickLabel} />
        <IntersectionControl
          max={this.state.mapSearches.filter(f => f.get('isActive')).size}
          value={this.state.intersec}
          onChange={e => this.setState({ intersec: e.target.value })}
        />
        <ResultsMap
          data={dictResults}
          colors={this.state.mapSearches.map(v => v.get('color'))}
          actives={this.state.mapSearches}
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
  }).isRequired,
};

export default connect(
  state => state.search,
  dispatch => ({
    actions: bindActionCreators({ newSearch }, dispatch),
  })
)(SearchTabs);
