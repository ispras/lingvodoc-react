/* eslint-disable */
import React, { useContext } from "react";
import { Segment, Button, Modal, Loader } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import { compose } from "recompose";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import { gql } from "@apollo/client";
import { buildLanguageTree } from "pages/Search/treeBuilder";
import TranslationContext from "Layout/TranslationContext";
import Languages from "./Languages";
import AdvancedFilter from "./AdvancedFilter";
import GrammarFilter from "./GrammarFilter";
import { getNodeValue, getNodeValueById } from "./Languages/helpers";

import AdditionalFilterInfo from "./Info";

import "./index.scss";

/* ----------- PROPS ----------- */

const classNames = {
  container: "additional-filter",
  buttonGroup: "additional-filter__button-group",
  modal: "additional-filter__modal lingvo-modal2"
};

/* ----------- COMPONENT ----------- */
/**
 * Additional fields for the search form.
 */
class AdditionalFilter extends React.PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    allLangsDictsChecked: PropTypes.bool,
    languagesQuery: PropTypes.object.isRequired,
    showLanguagesTreeText: PropTypes.string.isRequired,
    checkAllButtonText: PropTypes.string.isRequired,
    uncheckAllButtonText: PropTypes.string.isRequired,
    showAdvancedFilterText: PropTypes.string.isRequired,
    showGrammarFilterText: PropTypes.string.isRequired
  };

  static defaultProps = {
    allLangsDictsChecked: false
  };

  /**
   * Get all nodes values for allLangsDictsChecked option
   * @param {Array} languagesTree - input array with languages
   */
  static getAllNodesValues(languagesTree, result) {
    if (!result) {
      result = {
        languages: [],
        dictionaries: []
      };
    }
    languagesTree.forEach(item => {
      const isLanguage = !!item.dictionaries;
      const type = isLanguage ? "languages" : "dictionaries";

      result[type].push([item.id[0], item.id[1]]);

      if (isLanguage && item.dictionaries.length > 0) {
        item.dictionaries.forEach(dictionary => result.dictionaries.push([dictionary.id[0], dictionary.id[1]]));
      }

      this.getAllNodesValues(item.children, result);
    });

    return result;
  }

  /**
   * Checks if language has dictionaries on any level
   * @param {Object} language - language tree node
   * @returns {boolean} - result
   */
  static isLanguageWithDictsDeep(language) {
    if (language.dictionaries.length > 0) {
      return true;
    }

    if (language.children.some(child => this.isLanguageWithDictsDeep(child))) {
      return true;
    }

    return false;
  }

  /**
   * Adds item to the fillContainer if item has dictionaries on any level
   * @param {Object} item - language tree node
   * @param {Array} fillContainer - container for languages with dictionaries
   */
  static fillWithLangsWithDicts(item, fillContainer) {
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

  /**
   * Get language tree without languages that have no dictionaries on any level
   * @param {Array} rawLanguagesTree - input languages tree
   * @returns {Array} - new languages tree without languages that have no dictionaries on any level
   */
  static getUpdatedLanguagesTree(rawLanguagesTree) {
    const newLanguagesTree = [];

    rawLanguagesTree.forEach(language => {
      this.fillWithLangsWithDicts(language, newLanguagesTree);
    });

    return newLanguagesTree;
  }

  static isFieldLanguageVulnerability(name) {
    return name === "languageVulnerability";
  }

  static isLanguageVulnerabilitySet(language) {
    return language.vulnerability !== null;
  }

  static needToUpdateCheckedLanguages(allLangsDictsChecked, checkedLanguages, checkedDictionaries) {
    return !allLangsDictsChecked && checkedLanguages.length === 0 && checkedDictionaries.length > 0;
  }

  constructor(props) {
    super();

    const rawLanguagesTree = buildLanguageTree(fromJS(props.languagesQuery.languages)).toJS();

    const { hasAudio, kind, years, humanSettlement, authors, languageVulnerability, grammaticalSigns } = props.data;

    this.state = {
      // calculating final lists of languages and dictionaries
      languagesTree: this.constructor.getUpdatedLanguagesTree(rawLanguagesTree),
      filterMode: false,
      showSearchSelectLanguages: false,
      showAdvancedFilter: false,
      showGrammarFilter: false,
      hasAudio,
      kind,
      years,
      humanSettlement,
      authors,
      languageVulnerability,
      grammaticalSigns,
      isDataDefault: true
    };

    this.flatLanguages = {};
    this.flattenLanguages(this.state.languagesTree, this.flatLanguages);

    const { allLangsDictsChecked } = props;

    // set checked list depends on "allLangsDictsChecked" prop
    this.state.checked = !allLangsDictsChecked
      ? {
          languages: props.data.languages,
          dictionaries: props.data.dictionaries
        }
      : this.constructor.getAllNodesValues(this.state.languagesTree);
    this.saveChecked();

    const { languages: checkedLanguages, dictionaries: checkedDictionaries } = this.state.checked;
    const isNeedToUpdateCheckedLanguages = this.constructor.needToUpdateCheckedLanguages(
      allLangsDictsChecked,
      checkedLanguages,
      checkedDictionaries
    );

    if (isNeedToUpdateCheckedLanguages) {
      this.state.checked.languages = this.getCheckedLanguagesByDictionaries(
        this.state.languagesTree,
        checkedDictionaries
      ).map(language => language.id);
    }

    // notify parent component with checked list if allLangsDictsChecked is true
    // it's here because final lists with languages and dictionaries calculated in this component,
    // not in the parent component
    if (allLangsDictsChecked || isNeedToUpdateCheckedLanguages) {
      props.onChange({
        ...props.data,
        languages: this.state.checked.languages,
        dictionaries: this.state.checked.dictionaries
      });
    }

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
    this.onAdvancedFilterChange = this.onAdvancedFilterChange.bind(this);
    this.onGrammarFilterChange = this.onGrammarFilterChange.bind(this);
    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
    this.onShowAdvancedFilterButtonClick = this.onShowAdvancedFilterButtonClick.bind(this);
    this.onShowGrammarFilterButtonClick = this.onShowGrammarFilterButtonClick.bind(this);

    this.infoOnClickCallbacks = {
      grammar: this.onShowGrammarFilterButtonClick
    };
  }

  getCheckedLanguagesByDictionaries(languages, checkedDictionaries) {
    const checkedLanguages = [];

    languages.forEach(lang => this.addLangCheckedLangsToContainer(lang, checkedLanguages, checkedDictionaries));

    return checkedLanguages;
  }

  addLangCheckedLangsToContainer(language, container, checkedDictionaries) {
    if (this.languageIsChecked(language, checkedDictionaries)) {
      container.push(language);
    }

    language.children.forEach(child => this.addLangCheckedLangsToContainer(child, container, checkedDictionaries));
  }

  languageIsChecked(language, checkedDictionaries) {
    const nodeHasDicts = language.dictionaries && language.dictionaries.length > 0;

    if (nodeHasDicts) {
      const allDictsChecked = language.dictionaries.every(dictionary =>
        this.isDictionaryInChecked(dictionary, checkedDictionaries)
      );

      if (!allDictsChecked) {
        return false;
      }

      if (language.children.length === 0) {
        return true;
      }
    }

    return language.children.every(child => this.languageIsChecked(child, checkedDictionaries));
  }

  isDictionaryInChecked(dictionary, checked) {
    let result = false;

    checked.forEach(checkedDictionaryId => {
      if (checkedDictionaryId[0] === dictionary.id[0] && checkedDictionaryId[1] === dictionary.id[1]) {
        result = true;
      }
    });

    return result;
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for languages and dictionaries selection.
   */
  onShowLangsButtonClick() {
    this.setState({
      showSearchSelectLanguages: !this.state.showSearchSelectLanguages
    });
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for advanced filter.
   */
  onShowAdvancedFilterButtonClick() {
    this.setState({
      showAdvancedFilter: !this.state.showAdvancedFilter
    });
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for grammar filter.
   */
  onShowGrammarFilterButtonClick() {
    this.setState({
      showGrammarFilter: !this.state.showGrammarFilter
    });
  }

  /**
   * Event handler for languages or dictionaries selecting.
   * @param {Object} list - checked languages and/or dictionaries
   */
  onLangsDictsChange(list) {
    const { languageVulnerability } = this.state;
    this.setState({
      checked: list,
      filterMode: false,
      languageVulnerability: languageVulnerability.length !== 0 ? [] : languageVulnerability,
      isDataDefault: false
    });

    const result = {
      ...this.props.data,
      ...list
    };

    this.props.onChange(result);
  }

  /**
   * Event handler for advanced filter changes.
   * @param {*} value - advanced filter field value
   * @param {string} name - advanced filter field name
   */
  onAdvancedFilterChange(value, name) {
    let state = {
      [name]: value,
      filterMode: false,
      isDataDefault: false
    };

    const currentState = {
      hasAudio: this.state.hasAudio,
      kind: this.state.kind,
      years: this.state.years,
      humanSettlement: this.state.humanSettlement,
      authors: this.state.authors,
      languageVulnerability: this.state.languageVulnerability
    };

    let dataToSendToTop = {
      ...currentState,
      [name]: value
    };

    if (this.constructor.isFieldLanguageVulnerability(name)) {
      const handlingResult = this.handleLanguageVulnerability(value);

      state = {
        ...state,
        ...handlingResult
      };

      dataToSendToTop = {
        ...dataToSendToTop,
        ...handlingResult.checked
      };
    }

    this.setState(state);
    this.props.onChange(dataToSendToTop);
  }

  /**
   * Event handler for grammar filter changes.
   * @param {*} data - grammar filter value
   */
  onGrammarFilterChange(data) {
    const state = {
      grammaticalSigns: data,
      isDataDefault: false
    };

    this.setState(state);
    this.props.onChange(state);
  }

  /**
   * Filtering of current checked state based on languageVulnerability value
   * @param {Array} vulnerabilityValue - languageVulnerability field value
   */
  getCheckedByLanguageVulnerability(vulnerabilityValue) {
    if (vulnerabilityValue.length === 0) {
      return this.savedChecked;
    }

    const formattedLanguageVulnerability = vulnerabilityValue.map(item => item.toLowerCase());

    const { languages } = this.savedChecked;
    let filtered = [];

    languages.forEach(languageId => {
      const language = this.getFlatLanguagesById(languageId);
      const languageVulnerability = !this.constructor.isLanguageVulnerabilitySet(language)
        ? language.vulnerability
        : language.vulnerability.toLowerCase();

      if (formattedLanguageVulnerability.indexOf(languageVulnerability) !== -1 && filtered.indexOf(languageId) < 0) {
        filtered.push(languageId);
        filtered = [...filtered, ...this.getAllChildrenId(language)];
      }
    });

    const filteredLanguages = [];
    const filteredDicts = [];

    filtered.forEach(itemId => {
      const item = this.getFlatLanguagesById(itemId);

      if (!item) {
        filteredDicts.push(itemId);
      } else {
        filteredLanguages.push(itemId);
      }
    });

    return {
      languages: filteredLanguages,
      dictionaries: filteredDicts
    };
  }

  /**
   * Gets all children (languages and dictionaries) ids of the language node on any depth
   * @param {Object} language - language node
   * @param {Array} container - array of ids
   */
  getAllChildrenId(language, container = []) {
    language.children.forEach(item => {
      container.push(item.id);
      this.getAllChildrenId(item, container);
    });

    language.dictionaries.forEach(item => {
      container.push(item.id);
    });

    return container;
  }

  getFlatLanguages() {
    return this.flatLanguages;
  }

  getFlatLanguagesByValue(value) {
    const flatLanguages = this.getFlatLanguages();

    return flatLanguages[value];
  }

  getFlatLanguagesByLanguage(language) {
    const value = getNodeValue(language);

    return this.getFlatLanguagesByValue(value);
  }

  getFlatLanguagesById(id) {
    const value = getNodeValueById(id);

    return this.getFlatLanguagesByValue(value);
  }

  isNeedToShowVulnerabilityWarning() {
    const { checked, languageVulnerability } = this.state;
    return checked.languages.length === 0 && checked.dictionaries.length === 0 && languageVulnerability.length !== 0;
  }

  /**
   * Creates flat object of languages from the tree structure
   */
  flattenLanguages = (languages, flatLanguages) => {
    if (!Array.isArray(languages) || languages.length === 0) {
      return;
    }

    languages.forEach(languageItem => {
      flatLanguages[getNodeValue(languageItem)] = {
        vulnerability: languageItem.additional_metadata.speakersAmount,
        children: languageItem.children,
        dictionaries: languageItem.dictionaries
      };
      this.flattenLanguages(languageItem.children, flatLanguages);
    });
  };

  /**
   * Saves checked state for reconstruction after exit from filterMode (with languageVulnerability filter)
   */
  saveChecked() {
    this.savedChecked = this.state.checked;
  }

  /**
   * Handles languageVulnerability field changes.
   * @param {Array} value - languageVulnerability value
   */
  handleLanguageVulnerability(value) {
    const { languageVulnerability: currentLanguageVulnerability } = this.state;

    if (currentLanguageVulnerability.length === 0 && value.length > 0) {
      this.saveChecked();
    }

    const filteredChecked = this.getCheckedByLanguageVulnerability(value);

    if (filteredChecked === this.savedChecked) {
      return {
        checked: filteredChecked,
        filterMode: false
      };
    }

    return {
      checked: filteredChecked,
      filterMode: true
    };
  }

  render() {
    const { checked } = this.state;
    const { languages, dictionaries } = checked;
    const { languagesTree } = this.state;
    const {
      checkAllButtonText,
      uncheckAllButtonText,
      showLanguagesTreeText,
      showAdvancedFilterText,
      showGrammarFilterText
    } = this.props;
    const { hasAudio, kind, years, humanSettlement, authors, languageVulnerability, isDataDefault, grammaticalSigns } =
      this.state;
    const closeText = this.context("Close");

    return (
      <div className={classNames.container}>
        <Segment.Group>
          <Segment className={classNames.buttonGroup}>
            <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
              {showLanguagesTreeText}
            </Button>
            <Button primary basic fluid onClick={this.onShowGrammarFilterButtonClick}>
              {showGrammarFilterText}
            </Button>
            <Button primary basic fluid onClick={this.onShowAdvancedFilterButtonClick}>
              {showAdvancedFilterText}
            </Button>
          </Segment>
          <Segment.Group>
            <Segment>
              <AdditionalFilterInfo
                languages={languages}
                dictionaries={dictionaries}
                hasAudio={hasAudio}
                kind={kind}
                years={years}
                humanSettlement={humanSettlement}
                authors={authors}
                languageVulnerability={languageVulnerability}
                grammaticalSigns={grammaticalSigns}
                isDataDefault={isDataDefault}
                onClickCallbacks={this.infoOnClickCallbacks}
              />
            </Segment>
          </Segment.Group>
          <Modal
            className={classNames.modal}
            open={this.state.showSearchSelectLanguages}
            closeIcon
            onClose={this.onShowLangsButtonClick}
          >
            <Modal.Header>{showLanguagesTreeText}</Modal.Header>
            <Modal.Content scrolling>
              <div className="filter-dictionaries">
                <Languages
                  onChange={this.onLangsDictsChange}
                  languagesTree={languagesTree}
                  langsChecked={languages}
                  dictsChecked={dictionaries}
                  showTree={this.state.showSearchSelectLanguages}
                  filterMode
                  checkAllButtonText={checkAllButtonText}
                  uncheckAllButtonText={uncheckAllButtonText}
                />
              </div>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.onShowLangsButtonClick} className="lingvo-button-basic-black">
                {closeText}
              </Button>
            </Modal.Actions>
          </Modal>
          <Modal
            className={classNames.modal}
            open={this.state.showGrammarFilter}
            closeIcon
            onClose={this.onShowGrammarFilterButtonClick}
          >
            <Modal.Header>{showGrammarFilterText}</Modal.Header>
            <Modal.Content scrolling>
              <GrammarFilter checked={grammaticalSigns} onChange={this.onGrammarFilterChange} />
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.onShowGrammarFilterButtonClick} className="lingvo-button-basic-black">
                {closeText}
              </Button>
            </Modal.Actions>
          </Modal>
          <Modal
            className={classNames.modal}
            open={this.state.showAdvancedFilter}
            closeIcon
            onClose={this.onShowAdvancedFilterButtonClick}
          >
            <Modal.Header>{showAdvancedFilterText}</Modal.Header>
            <Modal.Content scrolling>
              {/* aka "tags" component */}
              <AdvancedFilter
                show={this.state.showAdvancedFilter}
                hasAudio={hasAudio}
                kind={kind}
                years={years}
                humanSettlement={humanSettlement}
                authors={authors}
                languageVulnerability={languageVulnerability}
                showVulnerabilityWarning={this.isNeedToShowVulnerabilityWarning()}
                onChange={this.onAdvancedFilterChange}
              />
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.onShowAdvancedFilterButtonClick} className="lingvo-button-basic-black">
                {closeText}
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment.Group>
      </div>
    );
  }
}

AdditionalFilter.contextType = TranslationContext;

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {AdditionalFields} - component with added properties (data from API)
 */
const AdditionalFilterWrap = props => {
  const { languagesQuery } = props;
  const { error: languagesQueryError, loading: languagesQueryLoading } = languagesQuery;

  const getTranslation = useContext(TranslationContext);

  if (languagesQueryError) {
    return null;
  } else if (languagesQueryLoading) {
    return (
      <Segment>
        <Loader active={languagesQueryLoading} inline="centered">
          {getTranslation("Loading additional filter data...")}
        </Loader>
      </Segment>
    );
  }

  const newProps = {
    ...props,
    showLanguagesTreeText: getTranslation("Select languages"),
    checkAllButtonText: getTranslation("Check all"),
    uncheckAllButtonText: getTranslation("Uncheck all"),
    showAdvancedFilterText: getTranslation("Select tags"),
    showGrammarFilterText: getTranslation("Grammar")
  };

  return <AdditionalFilter {...newProps} />;
};

AdditionalFilterWrap.propTypes = {
  languagesQuery: PropTypes.object.isRequired
};

/* ----------- QUERIES ----------- */
const languagesWithDictionariesQuery = gql`
  query Languages {
    languages(in_tree_order: true) {
      id
      parent_id
      translations
      dictionaries(deleted: false, published: true) {
        id
        parent_id
        translations
        category
      }
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

export default compose(
  graphql(languagesWithDictionariesQuery, {
    name: "languagesQuery"
  })
)(AdditionalFilterWrap);
