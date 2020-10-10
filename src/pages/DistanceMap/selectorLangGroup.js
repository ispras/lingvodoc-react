/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox, Segment, Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import { fromJS, Map } from 'immutable';
import { buildLanguageTree, assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setDictionariesGroup, setDefaultGroup, setMainGroupLanguages } from 'ducks/distanceMap';

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

    const { newProps } = this.props;


    const {
      location,
      actions,
      history,
      dataForTree,
      selected,
      mainGroupDict,
      mainDictionary
    } = newProps;


    const {
      dictionaries,
      languageTree,
      perspectives
    } = dataForTree;

    if (!location.state) {
      history.push('/distance_map');
    }
    if (selected && (selected.id !== dataForTree.idLocale)) {
      history.push('/distance_map');
    }

    this.state = {
      filterMode: false,
      showSearchSelectLanguages: true,
    };


    this.getUpdatedLanguagesTree = this.getUpdatedLanguagesTree.bind(this);
    this.fillWithLangsWithDicts = this.fillWithLangsWithDicts.bind(this);
    this.isLanguageWithDictsDeep = this.isLanguageWithDictsDeep.bind(this);


    const allDictionaries = dictionaries.filter(dict => compositeIdToString(dict.id) !== compositeIdToString(mainDictionary.id));

    const copyLanguageTree = JSON.parse(JSON.stringify(languageTree));

    const fileredLanguageTree = copyLanguageTree.map((lang) => {
      lang.dictionaries = lang.dictionaries.filter(dict => compositeIdToString(dict.id) !== compositeIdToString(mainDictionary.id));
      return lang;
    });

    if (!mainGroupDict.length) {
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
    const { newProps } = this.props;

    const {
      mainGroupDict,
      onLangsDictsChange
    } = newProps;


    return (
      <Segment>
        {(mainGroupDict.languages) && (<Languages
          onChange={onLangsDictsChange}
          languagesTree={this.test2}
          langsChecked={mainGroupDict.languages}
          dictsChecked={mainGroupDict.dictsChecked}
          showTree={this.state.showSearchSelectLanguages}
          filterMode={this.state.filterMode}
          checkAllButtonText="Check all"
          uncheckAllButtonText="Uncheck all"
        />)}

      </Segment>

    );
  }
}

SelectorLangGroup.propTypes = {
  newProps: PropTypes.shape({
    languagesGroupState: PropTypes.object,
    history: PropTypes.object,
    dataForTree: PropTypes.object,
    client: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,
    selected: PropTypes.object
  }).isRequired

};


function testQWE(props) {
  const {
    location,
    actions,
    history,
    dataForTree,
    client,
    mainGroupDict,
    /*     mainDictionary */
  } = props;

  const {
    mainPerspectives,
  } = location.state;
  console.log(props);

  const [test9, setTest9] = useState(mainGroupDict);
  const [mainDictionary, setLabelDict] = useState(null);
  const parentId = mainPerspectives[0].parent_id;

  client.query({
    query: dictionaryName,
    variables: { id: parentId },
  }).then(result => setLabelDict(result.data.dictionary));

  function onLangsDictsChange(list) {
    setTest9(list);
  }


  const arrDictionariesGroup = [];
  let rootLanguage = {};


  if (test9.dictionaries) {
    test9.dictionaries.forEach(el => dataForTree.dictionaries.forEach((dict) => {
      if (compositeIdToString(dict.id) === compositeIdToString(el)) {
        arrDictionariesGroup.push(dict);
      }
    }));
  }


  if (mainDictionary) {
    dataForTree.languageTree.forEach((lang) => {
      if (compositeIdToString(lang.id) === compositeIdToString(mainDictionary.parent_id)) { rootLanguage = lang; }
    });
  }


  function send() {
    actions.setDictionariesGroup({ arrDictionariesGroup });
    actions.setMainGroupLanguages({ dictsChecked: test9.dictionaries || [], languages: test9.languages || [] });
  }

  return (
    <div>
      {(mainDictionary) && (
        <div>
          <h1 style={{ margin: '15px 0' }}>{mainDictionary.translation}</h1>
          <SelectorLangGroup newProps={{
            ...props,
            onLangsDictsChange,
            mainDictionary
          }}
          />
        </div>

      )}
      <Button style={{ margin: '15px 15px 0 0' }} onClick={() => {
        actions.setDefaultGroup();
        history.goBack();
      }}
      > {getTranslation('Back')}
      </Button>

      <Link
        to={{
          pathname: '/distance_map/selected_languages/map',
          state: {
            mainDictionary,
            rootLanguage
          }
        }}
      >
        <Button style={{ margin: '15px 0' }} onClick={() => send()}> {getTranslation('Next')} </Button>
      </Link>
    </div>

  );
}

export default compose(
  connect(
    state => ({ ...state.distanceMap })
    , dispatch => ({ actions: bindActionCreators({ setDictionariesGroup, setDefaultGroup, setMainGroupLanguages }, dispatch) })
  ),
  connect(state => state.locale),
  withApollo
)(testQWE);
