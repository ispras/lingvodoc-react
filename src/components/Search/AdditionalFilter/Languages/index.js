import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import Tree from "./Tree";

/* ----------- PROPS ----------- */

const classNames = {
  hide: "hide"
};

/* ----------- COMPONENT ----------- */
/**
 * Component for selecting languages and dictionaries.
 */
class Languages extends PureComponent {
  static propTypes = {
    langsChecked: PropTypes.array.isRequired,
    dictsChecked: PropTypes.array.isRequired,
    languagesTree: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    checkAllButtonText: PropTypes.string.isRequired,
    uncheckAllButtonText: PropTypes.string.isRequired,
    showTree: PropTypes.bool,
    filterMode: PropTypes.bool
  };

  static defaultProps = {
    showTree: false,
    filterMode: false
  };

  /**
   * Creates a list of ids from the internal format to the external format.
   * @param {Array} list - input list in internal format ["1,2", "3,4" ...] (array of strings)
   * @returns {Array} - output list in external format "[[1,2], [3,4]]" (array of arrays of integers)
   */
  static getListInExternalFormat(list) {
    return list.map(item => item.split(",")).map(item => item.map(idPart => parseInt(idPart, 10)));
  }

  /**
   * Creates a list of ids from the external format to the internal format.
   * @param {Array} list - input list in external format "[[1,2], [3,4]]" (array of arrays of integers)
   * @returns {Array} - output list in internal format ["1,2", "3,4" ...] (array of strings)
   */
  static getListInInternalFormat(list) {
    return list.map(item => item.join(","));
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
        type: "language",
        checked: this.constructor.getListInInternalFormat(languagesChecked)
      },
      {
        type: "dictionary",
        checked: this.constructor.getListInInternalFormat(dictionariesChecked)
      }
    ];
  }

  /**
   * Get data in external format from internal format for export to top.
   * @param {Array} data - data in internal format
   */
  getDataInExternalFormat(data) {
    let result = null;
    if (data[0] === "all") {
      result = {
        languages: [],
        dictionaries: []
      };
    } else {
      result = {
        languages: this.constructor.getListInExternalFormat(data[0].checked),
        dictionaries: this.constructor.getListInExternalFormat(data[1].checked)
      };
    }

    return result;
  }

  render() {
    const { languagesTree, langsChecked, dictsChecked, showTree, selectedLanguages } = this.props;
    // TODO: translations
    const { checkAllButtonText, uncheckAllButtonText } = this.props;
    const checkedData = this.getDataInInternalFormat(langsChecked, dictsChecked);

    return (
      <div className={!showTree ? classNames.hide : ""}>
        <Tree
          checked={checkedData}
          selectedLanguages={selectedLanguages}
          nodes={languagesTree}
          onChange={this.onFilterLangsChange}
          checkAllButtonText={checkAllButtonText}
          uncheckAllButtonText={uncheckAllButtonText}
          showTree={showTree}
          filterMode={this.props.filterMode}
        />
      </div>
    );
  }
}

export default Languages;
