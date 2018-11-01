import React, { PureComponent } from 'react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import gql from 'graphql-tag';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import SearchSelectLanguages from './SearchSelectLanguages';

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
  }

  static defaultProps = {
    data: {
      languages: [],
      dictionaries: [],
    },
    allChecked: false,
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

  // static isLanguageWithDictsDeep(language) {
  //   if (language.dictionaries.length > 0) {
  //     return true;
  //   }

  //   if (language.children.some(child => this.isLanguageWithDictsDeep(child))) {
  //     return true;
  //   }

  //   return false;
  // }

  // static updateLanguagesTreeItem(item) {
  //   item.hasDictsDeep = this.isLanguageWithDictsDeep(item);

  //   item.children.forEach(child => this.updateLanguagesTreeItem(child));
  // }

  // static getUpdatedLanguagesTree(rawLanguagesTree) {
  //   rawLanguagesTree.forEach(language => this.updateLanguagesTreeItem(language));

  //   return rawLanguagesTree;
  // }

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
    };

    this.state.checked = !props.allChecked ?
      props.data :
      this.constructor.getAllNodesValues(this.state.languagesTree);

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
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
    return (
      <SearchSelectLanguages
        onChange={this.onLangsDictsChange}
        languagesTree={languagesTree}
        langsChecked={languages}
        dictsChecked={dictionaries}
      />
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

  return <AdditionalFields {...props} />;
};

AdditionalFieldsWrap.propTypes = {
  languagesQuery: PropTypes.object.isRequired,
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

export default compose(graphql(languagesWithDictionariesQuery, {
  name: 'languagesQuery',
}))(AdditionalFieldsWrap);
