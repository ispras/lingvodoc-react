/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { withApollo } from "react-apollo";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Label, Segment } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import Placeholder from "components/Placeholder";
import Languages from "components/Search/AdditionalFilter/Languages";
import {
  setCheckStateTreeFlat,
  setDataForTree,
  setDefaultGroup,
  setDictionariesGroup,
  setMainGroupLanguages} from "ducks/distanceMap";
import { buildLanguageTree } from "pages/Search/treeBuilder";
import { compositeIdToString } from "utils/compositeId";

import checkCoordAndLexicalEntries from "./checkCoordinatesAndLexicalEntries";
import { dictionaryName, dictionaryWithPerspectivesQuery } from "./graphql";

class FilterDictionaries extends React.Component {
  constructor(props) {
    super(props);

    const { newProps } = this.props;

    const { actions, dataForTree, mainGroupDictionaresAndLanguages, mainDictionary, selected } = newProps;

    const { dictionaries, languageTree } = dataForTree;

    this.state = {
      filterMode: true,
      showSearchSelectLanguages: true
    };

    this.getUpdatedLanguagesTree = this.getUpdatedLanguagesTree.bind(this);
    this.fillWithLangsWithDicts = this.fillWithLangsWithDicts.bind(this);
    this.isLanguageWithDictsDeep = this.isLanguageWithDictsDeep.bind(this);

    const allDictionaries = dictionaries.filter(
      dict => compositeIdToString(dict.id) !== compositeIdToString(mainDictionary.id)
    );

    const copyLanguageTree = JSON.parse(JSON.stringify(languageTree));

    const fileredLanguageTree = copyLanguageTree.map(lang => {
      lang.dictionaries = lang.dictionaries.filter(
        dict => compositeIdToString(dict.id) !== compositeIdToString(mainDictionary.id)
      );
      return lang;
    });

    if (
      (mainGroupDictionaresAndLanguages && !mainGroupDictionaresAndLanguages.dictsChecked) ||
      selected.id !== dataForTree.idLocale
    ) {
      this.languages = fileredLanguageTree.map(el => el.id);
      this.dictsChecked = allDictionaries.map(el => el.id);
      actions.setMainGroupLanguages({ dictsChecked: [], languages: [] });
    }

    const rawLanguagesTree = buildLanguageTree(fromJS(fileredLanguageTree)).toJS();
    this.languagesTree = this.getUpdatedLanguagesTree(rawLanguagesTree);
  }

  getUpdatedLanguagesTree(rawLanguagesTree) {
    const newLanguagesTree = [];

    rawLanguagesTree.forEach(language => {
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
        ...item
      };
      fillContainer.push(addingItem);

      addingItem.children = [];

      item.children.forEach(child => this.fillWithLangsWithDicts(child, addingItem.children));
    }
  }

  render() {
    const { newProps } = this.props;

    const { mainGroupDictionaresAndLanguages, onLangsDictsChange, selectedLanguages } = newProps;

    return (
      <Segment className="filter-dictionaries">
        {mainGroupDictionaresAndLanguages.languages && (
          <Languages
            onChange={onLangsDictsChange}
            languagesTree={this.languagesTree}
            langsChecked={mainGroupDictionaresAndLanguages.languages}
            dictsChecked={mainGroupDictionaresAndLanguages.dictsChecked}
            selectedLanguages={selectedLanguages}
            showTree={this.state.showSearchSelectLanguages}
            filterMode={this.state.filterMode}
            checkAllButtonText={getTranslation("Check all")}
            uncheckAllButtonText={getTranslation("Uncheck all")}
          />
        )}
      </Segment>
    );
  }
}

FilterDictionaries.propTypes = {
  newProps: PropTypes.shape({
    dictionariesGroupState: PropTypes.object,
    history: PropTypes.object,
    dataForTree: PropTypes.object,
    client: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,
    selected: PropTypes.object
  }).isRequired
};

function SelectorLangGroup(props) {
  try {
    const { location, actions, history, dataForTree, client, mainGroupDictionaresAndLanguages, selected, user } = props;

    if (!location.state) {
      history.push("/distance_map");
      return null;
    }

    if (!user || user.id != 1)
      {return (
        <div style={{ marginTop: "1em" }}>
          <Label>
            {getTranslation("For the time being Distance Map functionality is available only for the administrator.")}
          </Label>
        </div>
      );}

    const { mainPerspectives } = location.state;
    let selectedLanguagesChecken = [];
    let rootLanguage = {};
    const arrDictionariesGroup = [];
    const [mainGroupDictsAndLangs, setMainGroupDictsAndLangs] = useState(mainGroupDictionaresAndLanguages);
    const [mainDictionary, setMainDictionary] = useState(null);
    const parentId = mainPerspectives[0].parent_id;

    client
      .query({
        query: dictionaryName,
        variables: { id: parentId }
      })
      .then(result => setMainDictionary(result.data.dictionary));

    if (mainGroupDictsAndLangs.dictionaries) {
      mainGroupDictsAndLangs.dictionaries.forEach(el =>
        dataForTree.dictionaries.forEach(dict => {
          if (compositeIdToString(dict.id) === compositeIdToString(el)) {
            arrDictionariesGroup.push(dict);
          }
        })
      );
    }

    if (mainDictionary) {
      dataForTree.languageTree.forEach(lang => {
        if (compositeIdToString(lang.id) === compositeIdToString(mainDictionary.parent_id)) {
          rootLanguage = lang;
        }
      });
    }
    if (selected.id !== dataForTree.idLocale) {
      client
        .query({
          query: dictionaryWithPerspectivesQuery,
          name: "dictionaryWithPerspectives"
        })
        .then(result => {
          const { language_tree, dictionaries, perspectives, is_authenticated } = result.data;
          const filteredDictionary = checkCoordAndLexicalEntries(dictionaries);
          const fileredLanguageTree = language_tree.map(lang => {
            lang.dictionaries = checkCoordAndLexicalEntries(lang.dictionaries);
            return lang;
          });

          actions.setDataForTree({
            language_tree: fileredLanguageTree,
            dictionaries: filteredDictionary,
            perspectives,
            is_authenticated,
            allField: dataForTree.allField,
            id: selected.id
          });
        });
      return <Placeholder />;
    }

    function send() {
      if (arrDictionariesGroup.length) {
        arrDictionariesGroup.push(mainDictionary);
        actions.setDictionariesGroup({ arrDictionariesGroup });
        actions.setMainGroupLanguages({
          dictsChecked: mainGroupDictsAndLangs.dictionaries || [],
          languages: mainGroupDictsAndLangs.languages || []
        });
        actions.setCheckStateTreeFlat({ selectedLanguagesChecken });
      }
    }

    function selectedLanguages(e) {
      selectedLanguagesChecken = e;
    }

    function onLangsDictsChange(list) {
      setMainGroupDictsAndLangs(list);
    }

    return (
      <div className="page-content">
        {mainDictionary && (
          <div>
            <h1 style={{ margin: "15px 0" }}>{mainDictionary.translation}</h1>
            <FilterDictionaries
              newProps={{
                ...props,
                onLangsDictsChange,
                mainDictionary,
                selectedLanguages
              }}
            />
          </div>
        )}
        <Button
          style={{ margin: "15px 15px 0 0" }}
          onClick={() => {
            actions.setDefaultGroup();
            history.goBack();
          }}
        >
          {" "}
          {getTranslation("Back")}
        </Button>

        <Link
          to={{
            pathname: "/distance_map/selected_languages/map",
            state: {
              mainDictionary,
              rootLanguage
            }
          }}
        >
          <Button style={{ margin: "15px 0" }} onClick={() => send()}>
            {" "}
            {getTranslation("Next")}{" "}
          </Button>
        </Link>
      </div>
    );
  } catch (er) {
    const { history } = props;
    console.error(er);
    history.push("/distance_map");
  }
}

SelectorLangGroup.propTypes = {
  location: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  mainGroupDictionaresAndLanguages: PropTypes.object.isRequired
};

export default compose(
  connect(
    state => ({ ...state.distanceMap }),
    dispatch => ({
      actions: bindActionCreators(
        {
          setDictionariesGroup,
          setDefaultGroup,
          setMainGroupLanguages,
          setCheckStateTreeFlat,
          setDataForTree
        },
        dispatch
      )
    })
  ),
  connect(state => state.locale),
  connect(state => state.user),
  withApollo
)(SelectorLangGroup);
