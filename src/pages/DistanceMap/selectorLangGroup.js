import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Label, Segment } from "semantic-ui-react";
import { withApollo } from "@apollo/client/react/hoc";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Placeholder from "components/Placeholder";
import Languages from "components/Search/AdditionalFilter/Languages";
import {
  setCheckStateTreeFlat,
  setDataForTree,
  setDefaultGroup,
  setDictionariesGroup,
  setMainGroupLanguages
} from "ducks/distanceMap";
import TranslationContext from "Layout/TranslationContext";
import { buildLanguageTree } from "pages/Search/treeBuilder";
import { compositeIdToString } from "utils/compositeId";

import checkCoordAndLexicalEntries from "./checkCoordinatesAndLexicalEntries";
import { dictionaryName, dictionaryWithPerspectivesQuery } from "./graphql";

class FilterDictionaries extends React.Component {
  constructor(props) {
    super(props);

    const { newProps } = this.props;

    const { actions, dataForTree, mainGroupDictionaresAndLanguages, mainDictionary, selected } = newProps;

    const { dictionaries, languages } = dataForTree;

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

    const copyLanguages = JSON.parse(JSON.stringify(languages));

    const filteredLanguages = copyLanguages.map(lang => {
      lang.dictionaries = lang.dictionaries.filter(
        dict => compositeIdToString(dict.id) !== compositeIdToString(mainDictionary.id)
      );
      return lang;
    });

    if (
      (mainGroupDictionaresAndLanguages && !mainGroupDictionaresAndLanguages.dictsChecked) ||
      selected.id !== dataForTree.idLocale
    ) {
      this.languages = filteredLanguages.map(el => el.id);
      this.dictsChecked = allDictionaries.map(el => el.id);
      actions.setMainGroupLanguages({ dictsChecked: [], languages: [] });
    }

    const rawLanguagesTree = buildLanguageTree(fromJS(filteredLanguages)).toJS();
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
            checkAllButtonText={this.context("Check all")}
            uncheckAllButtonText={this.context("Uncheck all")}
          />
        )}
      </Segment>
    );
  }
}

FilterDictionaries.contextType = TranslationContext;

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
  const getTranslation = useContext(TranslationContext);

  const location = useLocation();
  const navigate = useNavigate();

  /* Initializing here due to eact-hooks/rules-of-hooks, exact same hook order. */

  const { actions, dataForTree, client, mainGroupDictionaresAndLanguages, selected, user } = props;

  const [mainGroupDictsAndLangs, setMainGroupDictsAndLangs] = useState(mainGroupDictionaresAndLanguages);
  const [mainDictionary, setMainDictionary] = useState(null);

  useEffect(() => {
    if (!location.state) {
      navigate("/distance_map");
      return null;
    }
  }, [location, navigate]);

  try {
    if (!location.state) {
      navigate("/distance_map");
      return null;
    }

    if (!user || user.id !== 1) {
      return (
        <div style={{ marginTop: "1em" }}>
          <Label>
            {getTranslation("For the time being Distance Map functionality is available only for the administrator.")}
          </Label>
        </div>
      );
    }

    const { mainPerspectives } = location.state;
    let selectedLanguagesChecken = [];
    let rootLanguage = {};
    const arrDictionariesGroup = [];
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
      dataForTree.languages.forEach(lang => {
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
          const { languages, dictionaries, perspectives, is_authenticated } = result.data;
          const filteredDictionary = checkCoordAndLexicalEntries(dictionaries);
          const filteredLanguages = languages.map(l => {
            const lang = { ...l };
            lang.dictionaries = checkCoordAndLexicalEntries(lang.dictionaries);
            return lang;
          });

          actions.setDataForTree({
            languages: filteredLanguages,
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
            <h1 style={{ margin: "15px 0" }}>{T(mainDictionary.translations)}</h1>
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
            navigate(-1);
          }}
        >
          {" "}
          {getTranslation("Back")}
        </Button>

        <Link to="/distance_map/selected_languages/map" state={{ mainDictionary, rootLanguage }}>
          <Button style={{ margin: "15px 0" }} onClick={() => send()}>
            {" "}
            {getTranslation("Next")}{" "}
          </Button>
        </Link>
      </div>
    );
  } catch (er) {
    console.error(er);
    navigate("/distance_map");
    return null;
  }
}

SelectorLangGroup.propTypes = {
  actions: PropTypes.object.isRequired,
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
