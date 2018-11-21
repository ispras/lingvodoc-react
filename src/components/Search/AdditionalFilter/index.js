import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import gql from 'graphql-tag';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import { getTranslation } from 'api/i18n';
import Languages from './Languages';
import AdvancedFilter from './AdvancedFilter';
import { getNodeValue, getNodeValueById } from './Languages/helpers';

import AdditionalFilterInfo from './AdditionalFilterInfo';

import './index.scss';

/* ----------- PROPS ----------- */

const classNames = {
  container: 'additional-filter',
  buttonGroup: 'additional-filter__button-group',
};

/* ----------- COMPONENT ----------- */
/**
 * Additional fields for the search form.
 */
class AdditionalFilter extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    allLangsDictsChecked: PropTypes.bool,
    languagesQuery: PropTypes.object.isRequired,
    showLanguagesTreeText: PropTypes.string,
    checkAllButtonText: PropTypes.string,
    uncheckAllButtonText: PropTypes.string,
    showAdvancedFilterText: PropTypes.string,
  }

  static defaultProps = {
    allLangsDictsChecked: false,
    showLanguagesTreeText: 'Select languages',
    checkAllButtonText: 'Check all',
    uncheckAllButtonText: 'Uncheck all',
    showAdvancedFilterText: 'Select tags',
  }

  /**
   * Get all nodes values for allLangsDictsChecked option
   * @param {Array} languagesTree - input array with languages
   */
  static getAllNodesValues(languagesTree, result) {
    if (!result) {
      result = {
        languages: [],
        dictionaries: [],
      };
    }
    languagesTree.forEach((item) => {
      const isLanguage = !!item.dictionaries;
      const type = isLanguage ? 'languages' : 'dictionaries';

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
        ...item,
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

    rawLanguagesTree.forEach((language) => {
      this.fillWithLangsWithDicts(language, newLanguagesTree);
    });

    return newLanguagesTree;
  }

  static isFieldLanguageVulnerability(name) {
    return name === 'languageVulnerability';
  }

  static isLanguageVulnerabilitySet(language) {
    return language.vulnerability !== null;
  }

  constructor(props) {
    super();

    const rawLanguagesTree = buildLanguageTree(fromJS(props.languagesQuery.language_tree)).toJS();
    const {
      hasAudio, kind, years, humanSettlement, authors, languageVulnerability,
    } = props.data;

    this.state = {
      // calculating final lists of languages and dictionaries
      languagesTree: this.constructor.getUpdatedLanguagesTree(rawLanguagesTree),
      filterMode: false,
      showSearchSelectLanguages: false,
      showAdvancedFilter: false,
      hasAudio,
      kind,
      years,
      humanSettlement,
      authors,
      languageVulnerability,
    };

    this.flatLanguages = {};
    this.flattenLanguages(this.state.languagesTree, this.flatLanguages);

    // set checked list depends on "allLangsDictsChecked" prop
    this.state.checked = !props.allLangsDictsChecked ?
      {
        languages: props.data.languages,
        dictionaries: props.data.dictionaries,
      } :
      this.constructor.getAllNodesValues(this.state.languagesTree);
    this.saveChecked();

    // notify parent component with checked list if allLangsDictsChecked is true
    // it's here because final lists with languages and dictionaries calculated in this component,
    // not in the parent component
    if (props.allLangsDictsChecked) {
      props.onChange({
        ...props.data,
        languages: this.state.checked.languages,
        dictionaries: this.state.checked.dictionaries,
      });
    }

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
    this.onAdvancedFilterChange = this.onAdvancedFilterChange.bind(this);
    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
    this.onShowAdvancedFilterButtonClick = this.onShowAdvancedFilterButtonClick.bind(this);
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for languages and dictionaries selection.
   */
  onShowLangsButtonClick() {
    this.setState({
      showSearchSelectLanguages: !this.state.showSearchSelectLanguages,
      showAdvancedFilter: !this.state.showSearchSelectLanguages ? false : this.state.showAdvancedFilter,
    });
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for advanced filter.
   */
  onShowAdvancedFilterButtonClick() {
    this.setState({
      showAdvancedFilter: !this.state.showAdvancedFilter,
      showSearchSelectLanguages: !this.state.showAdvancedFilter ? false : this.state.showSearchSelectLanguages,
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
    });

    const result = {
      ...this.props.data,
      ...list,
    };

    this.props.onChange(result);
  }

  /**
   * Event handler for advanced filter changes.
   * @param {*} value - advanced filter field value
   * @param {string} name - advanced filter field name
   */
  onAdvancedFilterChange(value, name) {
    const state = {
      [name]: value,
      filterMode: false,
    };

    if (this.constructor.isFieldLanguageVulnerability(name)) {
      const handlingResult = this.handleLanguageVulnerability(value);

      this.props.onChange({
        ...this.props.data,
        ...handlingResult.checked,
      });

      this.setState({
        ...state,
        ...handlingResult,
      });

      return;
    }

    this.setState(state);

    const result = {
      ...this.props.data,
      [name]: value,
    };

    this.props.onChange(result);
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

    languages.forEach((languageId) => {
      const language = this.getFlatLanguagesById(languageId);
      const languageVulnerability = !this.constructor.isLanguageVulnerabilitySet(language) ?
        language.vulnerability :
        language.vulnerability.toLowerCase();

      if (formattedLanguageVulnerability.indexOf(languageVulnerability) !== -1 && filtered.indexOf(languageId) < 0) {
        filtered.push(languageId);
        filtered = [
          ...filtered,
          ...this.getAllChildrenId(language)
        ];
      }
    });

    const filteredLanguages = [];
    const filteredDicts = [];

    filtered.forEach((itemId) => {
      const item = this.getFlatLanguagesById(itemId);

      if (!item) {
        filteredDicts.push(itemId);
      } else {
        filteredLanguages.push(itemId);
      }
    });

    return {
      languages: filteredLanguages,
      dictionaries: filteredDicts,
    };
  }

  /**
   * Gets all children (languages and dictionaries) ids of the language node on any depth
   * @param {Object} language - language node
   * @param {Array} container - array of ids
   */
  getAllChildrenId(language, container = []) {
    language.children.forEach((item) => {
      container.push(item.id);
      this.getAllChildrenId(item, container);
    });

    language.dictionaries.forEach((item) => {
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

    languages.forEach((languageItem) => {
      flatLanguages[getNodeValue(languageItem)] = {
        vulnerability: languageItem.additional_metadata.speakersAmount,
        children: languageItem.children,
        dictionaries: languageItem.dictionaries,
      };
      this.flattenLanguages(languageItem.children, flatLanguages);
    });
  }

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
        filterMode: false,
      };
    }

    return {
      checked: filteredChecked,
      filterMode: true,
    };
  }

  render() {
    const { checked } = this.state;
    const { languages, dictionaries } = checked;
    const { languagesTree } = this.state;
    const {
      checkAllButtonText, uncheckAllButtonText, showLanguagesTreeText, showAdvancedFilterText,
    } = this.props;
    const {
      hasAudio, kind, years, humanSettlement, authors, languageVulnerability,
    } = this.state;

    return (
      <div className={classNames.container}>
        <Segment.Group>
          <Segment className={classNames.buttonGroup}>
            <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
              {showLanguagesTreeText}
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
                getTranslation={getTranslation}
              />
            </Segment>
          </Segment.Group>
          <Languages
            onChange={this.onLangsDictsChange}
            languagesTree={languagesTree}
            langsChecked={languages}
            dictsChecked={dictionaries}
            showTree={this.state.showSearchSelectLanguages}
            filterMode={this.state.filterMode}
            checkAllButtonText={checkAllButtonText}
            uncheckAllButtonText={uncheckAllButtonText}
          />

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
        </Segment.Group>
      </div>
    );
  }
}

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {AdditionalFields} - component with added properties (data from API)
 */
const AdditionalFilterWrap = (props) => {
  const { languagesQuery } = props;
  const { error: languagesQueryError, loading: languagesQueryLoading } = languagesQuery;

  if (languagesQueryError || languagesQueryLoading) {
    return null;
  }

  const { translationsQuery } = props;
  const { error: translationsQueryError, loading: translationsQueryLoading } = translationsQuery;

  if (translationsQueryError || translationsQueryLoading) {
    return <AdditionalFilter {...props} />;
  }

  const { advanced_translation_search: translations } = translationsQuery;
  // TODO: translations
  const newProps = {
    ...props,
    showLanguagesTreeText: translations[0] ? translations[0].translation : undefined,
    checkAllButtonText: translations[1] ? translations[1].translation : undefined,
    uncheckAllButtonText: translations[2] ? translations[2].translation : undefined,
    showAdvancedFilterText: translations[3] ? translations[3].translation : undefined,
  };

  return <AdditionalFilter {...newProps} />;
};

AdditionalFilterWrap.propTypes = {
  languagesQuery: PropTypes.object.isRequired,
  translationsQuery: PropTypes.object.isRequired,
};

/* ----------- QUERIES ----------- */
const languagesWithDictionariesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translation
      dictionaries {
        id
        parent_id
        translation
        category
      }
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

// TODO: translations
const i18nQuery = gql`
  query {
    advanced_translation_search(
      searchstrings: [
        "Select languages",
        "Check all",
        "Uncheck all",
        "Select tags",
      ]
    ) {
      translation
    }
  }
`;

export default compose(
  graphql(languagesWithDictionariesQuery, {
    name: 'languagesQuery',
  }),
  graphql(i18nQuery, {
    name: 'translationsQuery',
  })
)(AdditionalFilterWrap);
