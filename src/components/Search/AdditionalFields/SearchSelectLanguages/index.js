import React, { PureComponent } from 'react';
import { Segment, Button } from 'semantic-ui-react';
// import { graphql } from 'react-apollo';
// import { compose } from 'recompose';
import PropTypes from 'prop-types';
// import gql from 'graphql-tag';
import LanguageTree from './LanguageTree';

/* ----------- COMPONENT ----------- */
/**
 * Component for selecting languages and dictionaries.
 */
class SearchSelectLanguages extends PureComponent {
  static propTypes = {
    langsChecked: PropTypes.array.isRequired,
    dictsChecked: PropTypes.array.isRequired,
    languagesTree: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    checkAllButtonText: PropTypes.string.isRequired,
    uncheckAllButtonText: PropTypes.string.isRequired,
    showTree: PropTypes.bool,
  }

  static defaultProps = {
    showTree: false,
  }

  /**
   * Сreates a block with the number of selected languages and dictionaries.
   */
  static renderCount(checked) {
    return (
      <div>
        Selected: {checked[0].checked.length + ' languages, ' + checked[1].checked.length +  ' dictionaries'}
      </div>
    );
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

  constructor() {
    super();

    this.onFilterLangsChange = this.onFilterLangsChange.bind(this);
  }

  /**
   * Event handler for changing selected languages or dictionaries.
   * @param {Array} checkedList - ["all"] if all languages and dictionaries selected or list of ids
   * in internal format ["1,2", "3,4" ...] (array of strings)
   */
  onFilterLangsChange(checkedList) {
    this.props.onChange(this.getDataInExternalFormat(checkedList));
  }

  /**
   * Get data in internal format from external format for next works.
   * @param {Array} languagesChecked - checked languages ids
   * @param {Array} dictionariesChecked - checked dictionaries ids
   */
  getDataInInternalFormat(languagesChecked, dictionariesChecked) {
    return [
      {
        type: 'language',
        checked: this.constructor.getListInInternalFormat(languagesChecked),
      },
      {
        type: 'dictionary',
        checked: this.constructor.getListInInternalFormat(dictionariesChecked),
      },
    ];
  }

  /**
   * Get data in external format from internal format for export to top.
   * @param {Array} data - data in internal format
   */
  getDataInExternalFormat(data) {
    let result = null;
    if (data[0] === 'all') {
      result = {
        languages: [],
        dictionaries: [],
      };
    } else {
      result = {
        languages: this.constructor.getListInExternalFormat(data[0].checked),
        dictionaries: this.constructor.getListInExternalFormat(data[1].checked),
      };
    }

    return result;
  }

  render() {
    const { languagesTree, langsChecked, dictsChecked } = this.props;
    // TODO: translations
    const { checkAllButtonText, uncheckAllButtonText } = this.props;
    const checkedData = this.getDataInInternalFormat(langsChecked, dictsChecked);
    return (
      <Segment.Group>
        <Segment>
          {this.constructor.renderCount(checkedData)}
        </Segment>
        {
          this.props.showTree ?
            <Segment.Group>
              <Segment>
                <LanguageTree
                  checked={checkedData}
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

export default SearchSelectLanguages;
