import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import { Container, Dimmer, Loader, Tab, Button, Divider, Menu, Message, Segment } from 'semantic-ui-react';
import { isEqual, memoize } from 'lodash';
import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMapMocked';
import IntersectionControl from 'components/Search/IntersectionControl';
import AreasMode from 'components/Search/AreasMode';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import BlobsModal from 'components/Search/blobsModal';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';

import './style.scss';

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
  query Search($query: [[ObjectVal]]!, $category: Int, $adopted: Boolean, $etymology: Boolean, $mode: String, $langs: [LingvodocID], $dicts: [LingvodocID], $searchMetadata: ObjectVal) {
    advanced_search(search_strings: $query, category: $category, adopted: $adopted, etymology: $etymology, mode: $mode, languages: $langs, dicts_to_filter: $dicts, search_metadata: $searchMetadata, simple: false) {
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

const isAdditionalParamsSet = (langs, dicts, searchMetadata) => {
  if ((langs && langs.length) > 0 || (dicts && dicts.length > 0)) {
    return true;
  }

  if (searchMetadata &&
      searchMetadata.hasAudio !== null &&
      searchMetadata.kind !== null &&
      searchMetadata.years.length > 0 &&
      searchMetadata.humanSettlement.length > 0 &&
      searchMetadata.authors.length > 0) {
    return true;
  }

  return false;
};

// const allQueriesOnlyWithRegexp = (queryGroup) => {
//   return queryGroup.every(query => query.matching_type === 'regexp');
// };

const isQueryWithoutEmptyString = (query) => {
  return query.search_string.length > 0 && query.matching_type.length > 0;
};

const getCleanQueries = (query) => {
  return query
    .map(q => q.filter(p => isQueryWithoutEmptyString(p)))
    .filter(q => q.length > 0);
};

const isQueriesClean = (query) => {
  return getCleanQueries(query).length > 0;
};

const isNeedToRenderLanguageTree = (query) => {
  return isQueriesClean(query);
};

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

    const { language_tree: allLanguages, advanced_search: advancedSearch, variables } = data;
    const { query } = variables;
    const needToRenderLanguageTree = isNeedToRenderLanguageTree(query);
    const searchResults = Immutable.fromJS(advancedSearch);
    const resultsCount = searchResults.get('dictionaries').filter(d => (d.getIn(['additional_metadata', 'location']) !== null));
    let searchResultsTree = null;
    if (needToRenderLanguageTree) {
      const languages = Immutable.fromJS(allLanguages);
      const languagesTree = buildLanguageTree(languages);
      searchResultsTree = buildSearchResultsTree(searchResults, languagesTree);
    }

    return <div>
      <Message positive>
        Found {resultsCount.size} resuls on <a href="" onClick={(e) => {
          e.preventDefault();
          document.getElementById('mapResults').scrollIntoView();
        }}>map</a>
      </Message>
      {needToRenderLanguageTree ?
        <LanguageTree searchResultsTree={searchResultsTree} /> :
        null
      }
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
  query, searchId, adopted, etymology, category, langs, dicts, searchMetadata,
}) => {
  const queryClean = isQueriesClean(query);
  const additionalParamsSet = isAdditionalParamsSet(langs, dicts, searchMetadata);
  let resultQuery = query;

  if (!queryClean) {
    resultQuery = [];
  }

  if (queryClean > 0 || additionalParamsSet) {
    return (
      <WrapperWithData
        searchId={searchId}
        query={resultQuery}
        category={category}
        adopted={adopted}
        etymology={etymology}
        langs={langs}
        dicts={dicts}
        searchMetadata={searchMetadata}
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
  dicts: PropTypes.array,
  searchMetadata: PropTypes.object,
};

const searchesFromProps = memoize(
  (searches) => {
    return searches.reduce((ac, s) => ac.set(s.id, Immutable.fromJS({
      id: s.id,
      text: `Search ${s.id}`,
      color: mdColors.get(s.id - 1),
      isActive: true,
    })), new Immutable.Map());
  });

class SearchTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mapSearches: searchesFromProps(props.searches),
      intersec: 0,
      areasMode: false,
      selectedAreaGroups: [],
    };

    this.labels = this.labels.bind(this);
    this.clickLabel = this.clickLabel.bind(this);
    this.onAreasModeChange = this.onAreasModeChange.bind(this);
    this.onSelectedAreaGroupsChange = this.onSelectedAreaGroupsChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      mapSearches: searchesFromProps(nextProps.searches),
      intersec: 0,
    });
  }

  onAreasModeChange(ev, { checked }) {
    this.setState({
      areasMode: checked,
    });
  }

  onSelectedAreaGroupsChange(data) {
    this.setState({
      selectedAreaGroups: data,
    });
  }

  getFilteredMapSearches = memoize(mapSearches => mapSearches.filter(f => f.get('isActive')));

  getDictResults = memoize((searches) => {
    return new Immutable.Map().withMutations((map) => {
      searches.forEach((search) => {
        if (search.results.dictionaries) {
          const filteredDicts = search.results.dictionaries.filter(d => d.additional_metadata.location);

          filteredDicts.forEach(dict =>
            map.update(Immutable.fromJS(dict), new Immutable.Set(), v => v.add(search.id)));
        }
      });
    });
  });

  labels() {
    return this.state.mapSearches.valueSeq().toJS();
  }

  clickLabel(id) {
    this.setState({
      mapSearches: this.state.mapSearches.updateIn([id, 'isActive'], v => !v),
    });
  }

  // dictResults() {
  //   return new Immutable.Map().withMutations((map) => {
  //     this.props.searches.forEach((search) => {
  //       if (search.results.dictionaries) {
  //         const filteredDicts = search.results.dictionaries.filter(d => d.additional_metadata.location);

  //         filteredDicts.forEach(dict =>
  //           map.update(Immutable.fromJS(dict), new Immutable.Set(), v => v.add(search.id)));
  //       }
  //     });
  //   });
  // }

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
              dicts={search.dicts}
              searchMetadata={search.searchMetadata}
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

    const {
      areasMode, mapSearches, intersec, selectedAreaGroups,
    } = this.state;
    const filteredMapSearches = this.getFilteredMapSearches(mapSearches);

    return (
      <Container>
        <Tab menu={{ pointing: true }} panes={panes} />
        <Divider id="mapResults" section />
        <Labels
          data={this.labels()}
          isActive={!areasMode}
          onClick={this.clickLabel}
        />
        <Segment>
          <AreasMode
            isAreasModeOn={areasMode}
            areasGroups={filteredMapSearches}
            onAreasModeChange={this.onAreasModeChange}
            onSelectedAreaGroupsChange={this.onSelectedAreaGroupsChange}
          />
        </Segment>
        <Segment>
          <IntersectionControl
            max={filteredMapSearches.size}
            value={intersec}
            isActive={!areasMode}
            onChange={e => this.setState({ intersec: parseInt(e.target.value, 10) })}
          />
        </Segment>
        <ResultsMap
          data={this.getDictResults(this.props.searches)}
          meta={filteredMapSearches}
          intersect={intersec}
          areasMode={areasMode}
          areaGroups={selectedAreaGroups}
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
