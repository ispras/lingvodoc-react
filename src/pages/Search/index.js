import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Immutable, { fromJS } from 'immutable';
import { Container, Dimmer, Loader, Tab, Button, Divider, Menu, Message, Segment } from 'semantic-ui-react';
import { isEqual, memoize } from 'lodash';
import { withRouter } from 'react-router-dom'

import Labels from 'components/Search/Labels';
import ResultsMap from 'components/Search/ResultsMap';
import IntersectionControl from 'components/Search/IntersectionControl';
import AreasMode from 'components/Search/AreasMode';
import QueryBuilder from 'components/Search/QueryBuilder';
import LanguageTree from 'components/Search/LanguageTree';
import BlobsModal from 'components/Search/blobsModal';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { setDefaultGroup, setMainGroupLanguages, setCheckStateTreeFlat, setDefaultDataForTree } from 'ducks/distanceMap';
import { getTranslation } from 'api/i18n';

import './style.scss';

import { newSearch, deleteSearch, storeSearchResult, newSearchWithAdditionalFields, setSearches } from 'ducks/search';


const mdColors = new Immutable.List([
  '#00897B',
  '#E53935',
  '#3949AB',
  '#FDD835',
  '#43A047',
  '#D81B60',
  '#1E88E5',
  '#FFB300',
  '#7CB342',
  '#8E24AA',
  '#039BE5',
  '#FB8C00',
  '#C0CA33',
  '#5E35B1',
  '#00ACC1',
  '#F4511E',
  '#6D4C41',
]);

const searchQuery = gql`
  query Search(
    $query: [[ObjectVal]]!,
    $category: Int,
    $adopted: Boolean,
    $etymology: Boolean,
    $diacritics: String,
    $mode: String,
    $langs: [LingvodocID],
    $dicts: [LingvodocID],
    $searchMetadata: ObjectVal,
    $blocks: Boolean,
    $xlsxExport: Boolean)
  {
    advanced_search(
      search_strings: $query,
      category: $category,
      adopted: $adopted,
      etymology: $etymology,
      diacritics: $diacritics,
      mode: $mode,
      languages: $langs,
      dicts_to_filter: $dicts,
      search_metadata: $searchMetadata,
      simple: $blocks,
      xlsx_export: $xlsxExport)
    {
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
      xlsx_url
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
  }
`;

const unstructuredDataQuery = gql`
  query unstructuredData(
    $id: String!)
  {
    unstructured_data(id: $id) {
      id
      data
      additional_metadata
    }
  }
`;

const newUnstructuredDataMutation = gql`
  mutation newUnstructuredData(
    $data: ObjectVal!,
    $metadata: ObjectVal) {
      new_unstructured_data(
        data: $data,
        metadata: $metadata)
      {
        triumph
        id
      }
    }
`;

const isAdditionalParamsSet = (langs, dicts, searchMetadata) => {
  if ((langs && langs.length > 0) || (dicts && dicts.length > 0)) {
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

  componentWillReceiveProps(props)
  {
    if (props.preloadFlag)
      return;

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

  render()
  {
    if (this.props.preloadFlag)
      return (
        <Dimmer active={true} inverted>
          <Loader>Loading</Loader>
        </Dimmer>
      );

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
        <div>
          Found {resultsCount.size} results on <a href="" onClick={(e) => {
            e.preventDefault();
            document.getElementById('mapResults').scrollIntoView();
          }}>map</a>
        </div>
        {advancedSearch.xlsx_url ?
          <div>
            <a href={advancedSearch.xlsx_url}>XLSX-exported search results</a>
          </div> :
          null
        }
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
  graphql(
    searchQuery,
    { skip: ({ preloadFlag }) => preloadFlag })
)(Wrapper);

const Info = ({
  query, searchId, adopted, etymology, diacritics, category,
  langs, dicts, searchMetadata, blocks, xlsxExport, subQuery,
  preloadFlag,
  props
}) => {

  if (subQuery) {
    return null;
  }

  const queryClean = isQueriesClean(query);
  const additionalParamsSet = isAdditionalParamsSet(langs, dicts, searchMetadata);
  let resultQuery = query;

  if (!queryClean) {
    resultQuery = [];
  }

  if (queryClean || additionalParamsSet) {
    return (
      <WrapperWithData
        searchId={searchId}
        query={resultQuery}
        category={category}
        adopted={adopted}
        etymology={etymology}
        diacritics={diacritics}
        langs={langs}
        dicts={dicts}
        searchMetadata={searchMetadata}
        blocks={blocks}
        xlsxExport={xlsxExport}
        mode="published"
        preloadFlag={preloadFlag}
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
  blocks: PropTypes.bool,
  xlsxExport: PropTypes.bool,
  subQuery: PropTypes.bool.isRequired,
};

const searchesFromProps = memoize(searches => Immutable.fromJS(searches)
  .reduce((result, search) => result.set(search.get('id'), search), new Immutable.Map()));

class SearchTabs extends React.Component {
  static groupHasDicts(groupId, dictsResults) {
    return dictsResults
      .valueSeq()
      .toJS()
      .some(groupsIds => groupsIds.indexOf(groupId) !== -1);
  }

  constructor(props) {
    super(props);

    this.is_mounted = false;

    const sourceSearches =
      searchesFromProps(props.searches);

    const source_searches_info = 

      sourceSearches.map(
        search => search.delete('results'));

    this.state = {
      mapSearches: this.addDefaultActiveStateToMapSearches(sourceSearches),
      sourceSearches,
      source_searches_info,
      intersec: 0,
      areasMode: false,
      selectedAreaGroups: [],
      search_id_map: new Immutable.Map(),
      search_id_set: new Immutable.Set(),
      search_link_loading: false,
      search_link_error: false,
      error_flag: false,
      preload_count: 0,
    };

    this.dictsHandlers = {
      deleteDictFromSearches: this.deleteDictFromSearches.bind(this),
      deleteAllDictsOfGroups: this.deleteAllDictsOfGroups.bind(this),
      addDictToGroup: this.addDictToGroup.bind(this),
      addAllDictsToGroup: this.addAllDictsToGroup.bind(this),
      moveDictToGroup: this.moveDictToGroup.bind(this),
    };

    this.tabsRef = null;

    this.labels = this.labels.bind(this);
    this.clickLabel = this.clickLabel.bind(this);
    this.onAreasModeChange = this.onAreasModeChange.bind(this);
    this.onSelectedAreaGroupsChange = this.onSelectedAreaGroupsChange.bind(this);
    this.getSearchURL = this.getSearchURL.bind(this);

    const { actions } = props

    actions.setDefaultDataForTree({})
    actions.setDefaultGroup({})
    actions.setMainGroupLanguages({})
    actions.setCheckStateTreeFlat({})
  }

  componentDidMount()
  {
    this.is_mounted = true;
  }

  componentWillUnmount()
  {
    /* Preventing 'setState on umounted component' warning, copied from
     * https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component. */

    this.is_mounted = false;
    this.setState = (state, callback) => null;
  }

  componentWillReceiveProps(nextProps)
  {
    const {
      actions,
      match: {
        params: {
          searchId: search_id }},
      data,
      client } =
      
      nextProps;

    /* We have new search data loaded by a search data id. */

    if (
      search_id &&
      !this.state.search_id_set.has(search_id))
    {
      if (!data.loading && !data.error)
      {
        const {
          unstructured_data: {
            data: search_data }} =
          
          data;

        const source_searches_info =
          fromJS(search_data);

        const entry_list =
          Object.entries(search_data).sort((a, b) => a[0] - b[0]);

        const searches = [];

        for (const [key, value] of entry_list)
          searches.push(value);

        actions.setSearches(searches);

        this.state.preload_count = entry_list.length;

        for (const [key, value] of entry_list)
        {
          if (value.subQuery)
          {
            this.state.preload_count--;
            continue;
          }

          client
            
            .query({
              query: searchQuery,
              variables: {
                mode: 'published',
                query: isQueriesClean(value.query) ? value.query : [],
                category: value.category,
                adopted: value.adopted,
                etymology: value.etymology,
                diacritics: value.diacritics,
                langs: value.langs,
                dicts: value.dicts,
                searchMetadata: value.searchMetadata,
                blocks: value.blocks,
                xlsxExport: value.xlsxExport,
              },
            })

            .then(

              ({ data: { advanced_search } }) =>
              {
                this.setState({ preload_count: this.state.preload_count - 1 });

                if (this.is_mounted)
                  actions.storeSearchResult(value.id, advanced_search);
              },

              error_data =>
              {
                window.logger.err('Failed search query!');
                console.log(error_data);

                this.setState({ preload_count: this.state.preload_count - 1 });
              }
            );
        }

        const search_id_map =

          this.state.search_id_map.set(
            source_searches_info,
            search_id);

        const search_id_set =

          this.state.search_id_set.add(
            search_id);

        this.setState({
          error_flag: false,
          search_id_map,
          search_id_set,
        });
      }

      else if (data.error)
        this.setState({ error_flag: true });

      return;
    }

    const [mapSearches, sourceSearches] = 
      this.updateMapSearchesActiveState(searchesFromProps(nextProps.searches));

    /* toJS() / fromJS() for canonical representation. */

    const source_searches_info = 

      fromJS(
        sourceSearches
          .map(search => search.delete('results'))
          .toJS());

    this.setState({
      mapSearches,
      sourceSearches,
      source_searches_info,
      intersec: 0,
    });
  }

  componentDidUpdate(prevProps) {
    const currentSearchesCount = this.props.searches.length;
    const lastSearch = this.props.searches[currentSearchesCount - 1];

    if (this.props.searches.length > prevProps.searches.length && lastSearch.subQuery) {
      const tabsItems = this.tabsRef.querySelectorAll('.ui.menu .item');
      const newSearchItem = tabsItems[currentSearchesCount - 1];

      if (newSearchItem) {
        newSearchItem.click();
      }
    }
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

  getUniqueSearchGroups = memoize(mapSearches => mapSearches
    .map(search => Immutable.fromJS({
      id: search.get('id'),
      text: `Search ${search.get('id')}`,
      color: mdColors.get(search.get('id') - 1),
      isActive: search.get('isActive'),
    })));

  getSearchGroups = memoize(mapSearches => this.getUniqueSearchGroups(mapSearches));

  getActiveSearchGroups = memoize(
    (mapSearches) => {
      const activeSearchGroups = this.getSearchGroups(mapSearches)
        .filter(f => f.get('isActive'));

      return activeSearchGroups
        .filter((groupMeta) => {
          const group = mapSearches.get(groupMeta.get('id'));
          const results = group.get('results');
          if (!results || !results.get('dictionaries') || results.get('dictionaries').size === 0) {
            return false;
          }

          return true;
        });
    });

  getDictsResults = memoize((mapSearches) => {
    const activeSearchGroups = this.getActiveSearchGroups(mapSearches);

    return new Immutable.Map().withMutations((map) => {
      mapSearches.forEach((search) => {
        const searchInActive = activeSearchGroups.get(search.get('id'));
        if (!searchInActive || !search.get('results') || !search.get('results').get('dictionaries')) {
          return;
        }

        const filteredDicts = search.get('results').get('dictionaries')
          .filter(dict => dict.getIn(['additional_metadata', 'location']));

        filteredDicts.forEach(dict => map.update(dict, new Immutable.Set(), v => v.add(search.get('id'))));
      });
    });
  });

  addDefaultActiveStateToMapSearches = memoize(
    mapSearches => mapSearches.map(search => search.set('isActive', true)));

  updateMapSearchesActiveState =
    (sourceSearches) =>
    {
      const {
        mapSearches: oldMapSearches,
        sourceSearches: oldSourceSearches } = this.state;

      const mapSearches =

        sourceSearches.map(
          (sourceSearch) =>
          {
            const search_id = sourceSearch.get('id');

            const mapSearchOld = oldMapSearches.get(search_id);
            const sourceSearchOld = oldSourceSearches.get(search_id);

            let isActive = false;

            /* 
             * Updating map search state only if the initial source search data changed, otherwise map
             * search state, e.g. disabling / enabling of markers, will be reset, and we don't want that.
             */

            const no_update_flag = 

              mapSearchOld &&
                sourceSearch.equals(sourceSearchOld);
            
            let updatedSearch =
              no_update_flag ? mapSearchOld : sourceSearch;

            if (mapSearchOld) {
              isActive = mapSearchOld.get('isActive');
            } else {
              isActive = true;
            }

            if (typeof isActive !== 'boolean') {
              isActive = true;
            }

            updatedSearch =
              updatedSearch.update(
                'isActive', () => isActive);

            return updatedSearch;
          });

      return [mapSearches, sourceSearches];
    };

  labels() {
    return this.getSearchGroups(this.state.mapSearches).valueSeq().toJS();
  }

  toggleSearchGroup(id) {
    const newMapSearch = this.state.mapSearches.updateIn([id, 'isActive'], v => !v);
    this.setState({
      mapSearches: newMapSearch,
    });
  }

  clickLabel(id) {
    this.toggleSearchGroup(id);
  }

  getSearchURL()
  {
    const { newUnstructuredData } = this.props;
    const { source_searches_info } = this.state;

    this.setState({
      search_link_loading: true });

    newUnstructuredData({
      variables: {
        data: source_searches_info.toJS(),
        metadata: {tag: 'search'}
      },
    }).then(

      ({ data: { new_unstructured_data: { id } } }) => {

        this.setState({

          search_id_map:
            this.state.search_id_map.set(
              source_searches_info, id),

          search_link_loading:
            false,
        });

      },

      (error_data) => {

        window.logger.err('Failed to save search data!');
        console.log(error_data);
        
        this.setState({
          search_link_loading: false,
          search_link_error: true });
      }
    );
  }

  deleteDictFromSearches(dictionary, groupsIds) {
    const { mapSearches } = this.state;
    let newMapSearches = mapSearches;

    groupsIds.forEach((id) => {
      if (!newMapSearches.hasIn([id, 'results', 'dictionaries'])) {
        return;
      }

      newMapSearches = newMapSearches.updateIn([id, 'results', 'dictionaries'], (dictionaries) => {
        const indexOfDictionary = dictionaries.indexOf(dictionary);

        if (indexOfDictionary === -1) {
          return;
        }

        return dictionaries.delete(indexOfDictionary);
      });
    });

    this.setState({
      mapSearches: newMapSearches,
    });
  }

  deleteAllDictsOfGroups(groupsIds) {
    const { mapSearches } = this.state;
    let newMapSearches = mapSearches;

    groupsIds.forEach((id) => {
      if (!newMapSearches.hasIn([id, 'results', 'dictionaries'])) {
        return;
      }

      newMapSearches = newMapSearches.updateIn([id, 'results', 'dictionaries'], dictionaries => dictionaries.clear());
    });

    this.setState({
      mapSearches: newMapSearches,
    });
  }

  addDictToGroup(dictionary, groupId) {
    const { mapSearches } = this.state;
    let newMapSearches = null;

    if (!mapSearches.hasIn([groupId, 'results', 'dictionaries'])) {
      return;
    }

    newMapSearches = mapSearches
      .updateIn([groupId, 'results', 'dictionaries'], dictionaries => dictionaries.push(dictionary));

    this.setState({
      mapSearches: newMapSearches || mapSearches,
    });
  }

  moveDictToGroup(dictionary, sourceGroupsIds, destionationGroupId) {
    const { mapSearches } = this.state;
    let newMapSearches = mapSearches;

    sourceGroupsIds.forEach((id) => {
      if (!newMapSearches.hasIn([id, 'results', 'dictionaries'])) {
        return;
      }

      newMapSearches = newMapSearches.updateIn([id, 'results', 'dictionaries'], (dictionaries) => {
        const indexOfDictionary = dictionaries.indexOf(dictionary);

        if (indexOfDictionary === -1) {
          return;
        }

        return dictionaries.delete(indexOfDictionary);
      });
    });

    newMapSearches = newMapSearches
      .updateIn([destionationGroupId, 'results', 'dictionaries'], dictionaries => dictionaries.push(dictionary));

    this.setState({
      mapSearches: newMapSearches || mapSearches,
    });
  }

  addAllDictsToGroup(currentGroupsIds, destinationGroupId) {
    const { mapSearches } = this.state;
    let newMapSearches = mapSearches;
    let dictionaries = new Immutable.Set();

    currentGroupsIds.forEach((id) => {
      const search = mapSearches.get(id);
      if (!search || !search.get('results') || !search.get('results').get('dictionaries')) {
        return;
      }

      search.get('results').get('dictionaries').forEach((dict) => {
        dictionaries = dictionaries.add(dict);
      });
    });

    dictionaries.forEach((dict) => {
      const indexOfDictInDestination = newMapSearches
        .get(destinationGroupId)
        .get('results')
        .get('dictionaries')
        .indexOf(dict);

      if (indexOfDictInDestination !== -1) {
        return;
      }

      newMapSearches = newMapSearches
        .updateIn([destinationGroupId, 'results', 'dictionaries'], dicts => dicts.push(dict));
    });

    this.setState({
      mapSearches: newMapSearches,
    });
  }

  isNeedToShowCreateSearchButton(search) {
    if (!search || !search.query) {
      return false;
    }

    if (!search.results || !search.results.dictionaries || search.results.dictionaries.length === 0) {
      return false;
    }

    const dictionariesCount = search.results.dictionaries
      .filter(dict => dict.additional_metadata && dict.additional_metadata.location)
      .map(dict => dict.id)
      .length;

    if (dictionariesCount === 0) {
      return false;
    }

    return isNeedToRenderLanguageTree(search.query);
  }

  createSearchWithAdditionalFields = search => () => {
    const { results } = search;
    const showCreateSearchButton = this.isNeedToShowCreateSearchButton(search);

    if (!showCreateSearchButton || !results || !results.dictionaries) {
      return;
    }

    const dicts = results.dictionaries
      .filter(dict => dict.additional_metadata && dict.additional_metadata.location)
      .map(dict => dict.id);

    if (!dicts || dicts.length === 0) {
      return;
    }

    const additionalFields = {
      dicts,
      searchMetadata: {
        ...search.searchMetadata,
      },
      grammaticalSigns: search.grammaticalSigns,
      languageVulnerability: search.languageVulnerability,
    };

    this.props.actions.newSearchWithAdditionalFields(additionalFields);
  }

  render() {
    const { searches, actions, match, data } = this.props;

    if (match.params.searchId)
    {
      if (this.state.error_flag || data.error)

        return (
          <Message compact negative style={{marginTop: '1em'}}>
            {getTranslation('Can\'t get data of the') +
              ` '${match.params.searchId}' ` +
              getTranslation('search') +
              '.'}
          </Message>);

      else if (data.loading)

        return (
          <Dimmer active={data.loading} inverted>
            <Loader>Loading</Loader>
          </Dimmer>);
    }

    const search_url_id =

      this.state.search_id_map.get(
        this.state.source_searches_info);

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
      render: () => {
        const showCreateSearchButton = this.isNeedToShowCreateSearchButton(search);

        return (
          <Tab.Pane attached={false} key={search.id}>
            <Container className="lingvo-container_margin-auto">
              <h3>Search</h3>
              <QueryBuilder
                searchId={search.id}
                data={fromJS(search.query)}
                langs={search.langs}
                dicts={search.dicts}
                searchMetadata={search.searchMetadata}
                grammaticalSigns={search.grammaticalSigns}
                languageVulnerability={search.languageVulnerability}
                showCreateSearchButton={showCreateSearchButton}
                createSearchWithAdditionalFields={this.createSearchWithAdditionalFields(search)}
                getSearchURL={this.getSearchURL}
                searchURLId={search_url_id}
                searchURLIdMap={this.state.search_id_map}
                searchLinkLoading={this.state.search_link_loading}
                searchLinkError={this.state.search_link_error}
              />
              <Info
                props={this.props}
                searchId={search.id}
                query={search.query}
                category={search.category}
                adopted={search.adopted}
                etymology={search.etymology}
                diacritics={search.diacritics}
                langs={search.langs}
                dicts={search.dicts}
                searchMetadata={search.searchMetadata}
                blocks={search.blocks}
                xlsxExport={search.xlsxExport}
                subQuery={search.subQuery}
                preloadFlag={this.state.preload_count > 0}
              />
            </Container>
          </Tab.Pane>
        );
      },
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
      areasMode, intersec, selectedAreaGroups, mapSearches,
    } = this.state;

    const activeSearchGroups = this.getActiveSearchGroups(mapSearches);
    const labels = this.labels();
    const dictsResults = this.getDictsResults(mapSearches);
    const intersectMax = activeSearchGroups.size === 0 ? 0 : activeSearchGroups.size - 1;

    return (
      <div className="page-content">
        <Container>
          <div
            ref={(ref) => {
              this.tabsRef = ref;
            }}
          >
            <Tab
              menu={{ pointing: true, stackable: true }}
              panes={panes}
            />
          </div>
          <Divider id="mapResults" section />
          <Labels
            data={labels}
            isActive={!areasMode}
            onClick={this.clickLabel}
          />
          <Segment>
            <AreasMode
              isAreasModeOn={areasMode}
              areasGroups={activeSearchGroups}
              onAreasModeChange={this.onAreasModeChange}
              onSelectedAreaGroupsChange={this.onSelectedAreaGroupsChange}
            />
          </Segment>
          <Segment>
            <IntersectionControl
              max={intersectMax}
              value={intersec}
              isActive={!areasMode}
              onChange={e => this.setState({ intersec: parseInt(e.target.value, 10) })}
            />
          </Segment>
          <ResultsMap
            data={dictsResults}
            meta={activeSearchGroups}
            intersect={intersec}
            areasMode={areasMode}
            areaGroups={selectedAreaGroups}
            markersHandlers={this.dictsHandlers}
          />
          <BlobsModal />
        </Container>
      </div>
    );
  }
}

SearchTabs.propTypes = {
  searches: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    newSearch: PropTypes.func.isRequired,
    deleteSearch: PropTypes.func.isRequired,
    newSearchWithAdditionalFields: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(connect(
  state => state.distanceMap
), connect(
  state => (state.search),
  dispatch => ({
    actions: bindActionCreators({
      newSearch, deleteSearch, newSearchWithAdditionalFields, setSearches,
      setDefaultGroup, setCheckStateTreeFlat, setDefaultDataForTree, setMainGroupLanguages,
      storeSearchResult
    }, dispatch),
  })),
  graphql(
    unstructuredDataQuery,
    {
      skip:
        ({ match: { params } }) =>
          !params.searchId,
      options:
        ({ match: { params } }) =>
          ({ variables: { id: params.searchId }}),
    }),
  graphql(
    newUnstructuredDataMutation,
    { name: 'newUnstructuredData' }),
  withRouter,
  withApollo,
)(SearchTabs);
