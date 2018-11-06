import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import gql from 'graphql-tag';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import SearchSelectLanguages from './SearchSelectLanguages';
import SearchTagsFilter from './SearchTagsFilter';

/* ----------- COMPONENT ----------- */
/**
 * Additional fields for the search form.
 */
class AdditionalFields extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object,
    allChecked: PropTypes.bool,
    languagesQuery: PropTypes.object.isRequired,
    showLanguagesTreeText: PropTypes.string,
    checkAllButtonText: PropTypes.string,
    uncheckAllButtonText: PropTypes.string,
    showTagsText: PropTypes.string,
  }

  static defaultProps = {
    data: {
      languages: [],
      dictionaries: [],
    },
    allChecked: false,
    showLanguagesTreeText: 'Select languages',
    checkAllButtonText: 'Check all',
    uncheckAllButtonText: 'Uncheck all',
    showTagsText: 'Select tags',
  }

  /**
   * Get all nodes values for allChecked option
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

  constructor(props) {
    super();

    const rawLanguagesTree = buildLanguageTree(fromJS(props.languagesQuery.language_tree)).toJS();

    this.state = {
      languagesTree: this.constructor.getUpdatedLanguagesTree(rawLanguagesTree),
      showSearchSelectLanguages: false,
      showSearchTagsFilter: false,
    };

    this.state.checked = !props.allChecked ?
      props.data :
      this.constructor.getAllNodesValues(this.state.languagesTree);

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
    this.onShowTagsButtonClick = this.onShowTagsButtonClick.bind(this);
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for languages and dictionaries selection.
   */
  onShowLangsButtonClick() {
    this.setState({
      showSearchSelectLanguages: !this.state.showSearchSelectLanguages,
      showSearchTagsFilter: !this.state.showSearchSelectLanguages ? false : this.state.showSearchTagsFilter,
    });
  }

  /**
   * Event handler for clicking on the button to open or close
   * component for tags selection.
   */
  onShowTagsButtonClick() {
    this.setState({
      showSearchTagsFilter: !this.state.showSearchTagsFilter,
      showSearchSelectLanguages: !this.state.showSearchTagsFilter ? false : this.state.showSearchSelectLanguages,
    });
  }

  /**
   * Event handler for languages or dictionaries selecting.
   * @param {Object} list - checked languages and/or dictionaries
   */
  onLangsDictsChange(list) {
    this.setState({
      checked: list,
    });

    const result = {
      ...list,
    };

    this.props.onChange(result);
  }

  render() {
    const { languages, dictionaries } = this.state.checked;
    const { languagesTree } = this.state;
    const { checkAllButtonText, uncheckAllButtonText, showLanguagesTreeText, showTagsText } = this.props;
    return (
      <div>
        <Segment.Group>
          <Segment>
            <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
              {showLanguagesTreeText}
            </Button>
          </Segment>
          <SearchSelectLanguages
            onChange={this.onLangsDictsChange}
            languagesTree={languagesTree}
            langsChecked={languages}
            dictsChecked={dictionaries}
            showTree={this.state.showSearchSelectLanguages}
            checkAllButtonText={checkAllButtonText}
            uncheckAllButtonText={uncheckAllButtonText}
          />
        </Segment.Group>
        <Segment.Group>
          <Segment>
            <Button primary basic fluid onClick={this.onShowTagsButtonClick}>
              {showTagsText}
            </Button>
          </Segment>
          <SearchTagsFilter showTags={this.state.showSearchTagsFilter} />
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
const AdditionalFieldsWrap = (props) => {
  const { languagesQuery } = props;
  const { error: languagesQueryError, loading: languagesQueryLoading } = languagesQuery;

  if (languagesQueryError || languagesQueryLoading) {
    return null;
  }

  const { translationsQuery } = props;
  const { error: translationsQueryError, loading: translationsQueryLoading } = translationsQuery;

  if (translationsQueryError || translationsQueryLoading) {
    return <AdditionalFields {...props} />;
  }

  const { advanced_translation_search: translations } = translationsQuery;
  // TODO: translations
  const newProps = {
    ...props,
    showLanguagesTreeText: translations[0] ? translations[0].translation : undefined,
    checkAllButtonText: translations[1] ? translations[1].translation : undefined,
    uncheckAllButtonText: translations[2] ? translations[2].translation : undefined,
    showTagsText: translations[3] ? translations[3].translation : undefined,
  };

  return <AdditionalFields {...newProps} />;
};

AdditionalFieldsWrap.propTypes = {
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
)(AdditionalFieldsWrap);
