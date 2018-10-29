import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import LanguageTree from './LanguageTree';

/* ----------- COMPONENT ----------- */
/**
 * Component for selecting languages and dictionaries.
 */
class SearchSelectLanguages extends PureComponent {
  static propTypes = {
    defaultLangsChecked: PropTypes.array.isRequired,
    defaultDictsChecked: PropTypes.array.isRequired,
    languagesTree: PropTypes.array.isRequired,
    translations: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  /**
   * Creates a list of ids from the internal format to the external format.
   * @param {Array} list - input list in internal format ["1,2", "3,4" ...] (array of strings)
   * @returns {Array} - output list in external format "[[1,2], [3,4]]" (array of arrays of integers)
   */
  static getListInExternalFormat(list) {
    return list
      .map(item => item.split(','))
      .map(item => item.map(idPart => parseInt(idPart, 10)));
  }

  /**
   * Creates a list of ids from the external format to the internal format.
   * @param {Array} list - input list in external format "[[1,2], [3,4]]" (array of arrays of integers)
   * @returns {Array} - output list in internal format ["1,2", "3,4" ...] (array of strings)
   */
  static getListInInternalFormat(list) {
    return list
      .map(item => item.join(','));
  }

  constructor(props) {
    super();

    const languagesChecked = props.defaultLangsChecked;
    const dictionariesChecked = props.defaultDictsChecked;

    this.state = {
      showLangs: false,
      selectedLangs: [],
      checked: languagesChecked.length > 0 && dictionariesChecked.length > 0 ?
        [
          {
            type: 'language',
            checked: this.constructor.getListInInternalFormat(languagesChecked),
          },
          {
            type: 'dictionary',
            checked: this.constructor.getListInInternalFormat(dictionariesChecked),
          },
        ] :
        ['all'],
    };

    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
    this.onFilterLangsChange = this.onFilterLangsChange.bind(this);
  }
  /**
   * Event handler for clicking on the button to open or close
   * component for languages and dictionaries selection.
   */
  onShowLangsButtonClick() {
    this.setState({
      showLangs: !this.state.showLangs,
    });
  }

  /**
   * Event handler for changing selected languages or dictionaries.
   * @param {Array} checkedList - ["all"] if all languages and dictionaries selected or list of ids
   * in internal format ["1,2", "3,4" ...] (array of strings)
   */
  onFilterLangsChange(checkedList) {
    this.setState({
      checked: checkedList,
    });

    let checkedListToSend = null;

    if (checkedList[0] === 'all') {
      checkedListToSend = {
        languages: [],
        dictionaries: [],
      };
    } else {
      checkedListToSend = {
        languages: this.constructor.getListInExternalFormat(checkedList[0].checked),
        dictionaries: this.constructor.getListInExternalFormat(checkedList[1].checked),
      };
    }

    this.props.onChange(checkedListToSend);
  }

  /**
   * Сreates a block with the number of selected languages and dictionaries.
   */
  renderCount() {
    const { checked } = this.state;
    const isAll = checked[0] === 'all';
    let countText = null;

    if (isAll) {
      countText = 'all';
    } else {
      // languages
      countText = `${checked[0].checked.length} languages`;
      // dictioanries
      countText = `${countText}, ${checked[1].checked.length} dictionaries`;
    }

    return (
      <div>
        Selected: {countText}
      </div>
    );
  }

  render() {
    const { languagesTree } = this.props;
    const { selectedLangs } = this.state;
    const selectedLangsCount = selectedLangs.length;
    // TODO: translations
    const buttonTranslation = this.props.translations[0].translation;
    let checkAllButtonText;
    let uncheckAllButtonText;

    if (this.props.translations[1]) {
      checkAllButtonText = this.props.translations[1].translation;
    }

    if (this.props.translations[2]) {
      uncheckAllButtonText = this.props.translations[2].translation;
    }

    return (
      <Segment.Group>
        <Segment>
          {this.renderCount()}
        </Segment>
        <Segment>
          <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
            {buttonTranslation}
            <strong> {selectedLangsCount > 0 ? `(selected ${selectedLangsCount} languages)` : null}</strong>
          </Button>
        </Segment>
        {
          this.state.showLangs ?
            <Segment.Group>
              <Segment>
                <LanguageTree
                  checked={this.state.checked}
                  nodes={languagesTree}
                  onChange={this.onFilterLangsChange}
                  checkAllButtonText={checkAllButtonText}
                  uncheckAllButtonText={uncheckAllButtonText}
                />
              </Segment>
            </Segment.Group> :
            null
        }
      </Segment.Group>
    );
  }
}

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {SearchSelectLanguages} - component with added properties (data from API)
 */
const SearchSelectLanguagesWrap = (props) => {
  // TODO: translations
  const { translationsQuery } = props;
  const { error: translationsQueryError, loading: translationsQueryLoading } = translationsQuery;
  let translations = null;

  if (translationsQueryError || translationsQueryLoading) {
    // TODO: need to fix it, move the default values to the component itself
    translations = [{
      translation: 'Search languages',
    }];
  } else {
    translations = translationsQuery.advanced_translation_search;
  }

  // TODO: need to fix it, too many extra calculates
  const newProps = {
    ...props,
    translations,
  };

  return <SearchSelectLanguages {...newProps} />;
};

SearchSelectLanguagesWrap.propTypes = {
  translationsQuery: PropTypes.object.isRequired,
};

/* ----------- QUERIES ----------- */
// TODO: translations
const i18nQuery = gql`
  query {
    advanced_translation_search(
      searchstrings: [
        "Select languages",
        "Check all",
        "Uncheck all"
      ]
    ) {
      translation
    }
  }
`;

export default compose(graphql(i18nQuery, {
  name: 'translationsQuery',
}))(SearchSelectLanguagesWrap);
