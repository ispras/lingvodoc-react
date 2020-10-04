/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { buildLanguageTree, assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import { Link, Redirect } from 'react-router-dom';
import checkLexicalEntries from './checkLexicalEntries';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguagesGroup, setDefaultGroup, setMainGroupLanguages } from 'ducks/distanceMap';

import { compositeIdToString } from 'utils/compositeId';

import Languages from 'components/Search/AdditionalFilter/Languages';


const dictionaryName = gql`
query dictionaryName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
    parent_id
    additional_metadata {
      authors
      location
    }
    perspectives {
      id
      translation
      columns{
        field_id
      }
    }
  }
}`;

class SelectorLangGroup extends React.Component {
  constructor(props) {
    super(props);

    const {
      client, location, actions, languagesGroupState, history, dataForTree, selected, mainGroupDict, labelDict
    } = this.props.props;
    if (!location.state) {
      history.push('/distance_map');
    }
    if (selected && (selected.id !== dataForTree.idLocale)) {
      history.push('/distance_map');
    }
    console.log(props);
    this.state = {
      labelDict: null,
      filterMode: false,
      showSearchSelectLanguages: true,
      showAdvancedFilter: false,
      showGrammarFilter: false,
      hasAudio: null,
      kind: null,
      years: null,
      humanSettlement: null,
      authors: null,
      languageVulnerability: null,
      grammaticalSigns: null,
      isDataDefault: true,
      languagesTree: [],
    };


    this.getUpdatedLanguagesTree = this.getUpdatedLanguagesTree.bind(this);
    this.fillWithLangsWithDicts = this.fillWithLangsWithDicts.bind(this);
    this.isLanguageWithDictsDeep = this.isLanguageWithDictsDeep.bind(this);


    const { arrDictionariesGroup } = languagesGroupState;
    const {
      allField,
      dictionaries,
      languageTree,
      perspectives
    } = dataForTree;
    const allDictionaries = dictionaries.filter(dict => compositeIdToString(dict.id) !== compositeIdToString(labelDict.id));

    const copyLanguageTree = JSON.parse(JSON.stringify(languageTree));

    const fileredLanguageTree = copyLanguageTree.map((lang) => {
      lang.dictionaries = lang.dictionaries.filter(dict => compositeIdToString(dict.id) !== compositeIdToString(labelDict.id));
      return lang;
    });

    if (mainGroupDict.length === 0) {
      this.languages = fileredLanguageTree.map(el => el.id);
      this.dictsChecked = allDictionaries.map(el => el.id);
      actions.setMainGroupLanguages({ dictsChecked: this.dictsChecked, languages: this.languages });
    }


    const dictsSource = fromJS(allDictionaries);


    const dicts = dictsSource.reduce(
      (acc, dict) => acc.set(dict.get('id'), dict.set(dict)),
      new Map()
    );
    const languageTreeNew = buildLanguageTree(fromJS(languageTree));

    const localPer = fromJS(perspectives);
    const localDic = fromJS(dicts);


    const nodeLanguagesNew = assignDictsToTree(
      buildDictTrees(fromJS({
        lexical_entries: [],
        perspectives: localPer,
        dictionaries: localDic,
      })),
      languageTreeNew
    );

    this.nodeLanguages = nodeLanguagesNew.toJS();

    const rawLanguagesTree = buildLanguageTree(fromJS(fileredLanguageTree)).toJS();
    this.test2 = this.getUpdatedLanguagesTree(rawLanguagesTree);
  }

  getUpdatedLanguagesTree(rawLanguagesTree) {
    const newLanguagesTree = [];

    rawLanguagesTree.forEach((language) => {
      this.fillWithLangsWithDicts(language, newLanguagesTree);
    });

    return newLanguagesTree;
  }


  isLanguageWithDictsDeep(language) {
    if (language.dictionaries.length > 0) {
      return true;
    }

    if (language.children.some(child => this.isLanguageWithDictsDeep(child))) {
      return true;
    }

    return false;
  }


  fillWithLangsWithDicts(item, fillContainer) {
    if (!fillContainer) {
      return;
    }

    const hasDictsDeep = this.isLanguageWithDictsDeep(item);

    if (hasDictsDeep) {
      const addingItem = {
        ...item,
      };
      fillContainer.push(addingItem);

      addingItem.children = [];

      item.children.forEach(child => this.fillWithLangsWithDicts(child, addingItem.children));
    }
  }


  render() {
    const {
      client, location, actions, languagesGroupState, history, dataForTree, selected, mainGroupDict, onLangsDictsChange
    } = this.props.props;

    return (
      <Segment>

        <Languages
          onChange={onLangsDictsChange}
          languagesTree={this.test2}
          langsChecked={mainGroupDict.languages}
          dictsChecked={mainGroupDict.dictsChecked}
          showTree={this.state.showSearchSelectLanguages}
          filterMode={this.state.filterMode}
          checkAllButtonText="Check all"
          uncheckAllButtonText="Uncheck all"
        />
      </Segment>

    );
  }
}

/* selectorLangGroup.propTypes = {
  languagesGroupState: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired
}; */


function testQWE(props) {
  const {
    history, actions, dataForTree, client, location,mainGroupDict
  } = props;

  const {
    mainDictionary,
  } = location.state;
  const [test9, setTest9] = useState({});
  const [labelDict, setLabelDict] = useState(null);
  function onLangsDictsChange(list) {
    setTest9(list);

  }
  const arrDictionariesGroup = [];
  let rootLanguage = {};
  console.log(mainGroupDict)

  if (test9.dictionaries) {
    test9.dictionaries.forEach(el => dataForTree.dictionaries.forEach((dict) => {
      if (compositeIdToString(dict.id) === compositeIdToString(el)) {
        arrDictionariesGroup.push(dict);
      }
    }));
    /*     console.log('list', arrDictionariesGroup); */
  }
  if (labelDict) {
    dataForTree.languageTree.forEach((lang) => {
      if (compositeIdToString(lang.id) === compositeIdToString(labelDict.parent_id)) { rootLanguage = lang; }
    });
  }

  const parentId = mainDictionary[0].parent_id;
  client.query({
    query: dictionaryName,
    variables: { id: parentId },
  }).then(result => setLabelDict(result.data.dictionary));

  function send() {
    actions.setLanguagesGroup({ arrDictionariesGroup })
    actions.setMainGroupLanguages({ dictsChecked: test9.dictsChecked || [], languages: test9.languages || [] });
  }
  return (
    <div>
      {(labelDict) && (
        <div>
          <Label size="massive" >{labelDict.translation}</Label>
          <SelectorLangGroup props={{
            ...props,
            onLangsDictsChange,
            labelDict
          }}
          />
        </div>

      )}
      <Button onClick={() => {
        actions.setDefaultGroup();
        history.goBack();
      }}
      > {getTranslation('Back')}
      </Button>

      <Link
        to={{
          pathname: '/distance_map/selected_languages/map',
          state: {
            mainDictionary: labelDict,
            rootLanguage
          }
        }}
      >
        <Button onClick={() => send()}> {getTranslation('Next')} </Button>
      </Link>
    </div>

  );
}

export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setLanguagesGroup, setDefaultGroup, setMainGroupLanguages }, dispatch) })
  ),
  connect(state => state.locale),
  withApollo
)(testQWE);
