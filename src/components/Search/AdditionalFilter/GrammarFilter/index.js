import React, { PureComponent } from "react";
import { Button, Grid } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";

import grammaticalSignsRaw from "./grammaticalSigns.json";
import GridGenerator from "./GridGenerator";
import GrammarGroup from "./Group";
import signGroupDivision from "./signGroupDivision";

import "./index.scss";

const classNames = {
  container: "grammar-filter",
  buttons: "grammar-filter__buttons"
};

class GrammarFilter extends PureComponent {
  static propTypes = {
    checked: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  static isGroupEmpty(group) {
    if (group === null) {
      return true;
    }

    if (group.length > 0) {
      return false;
    }

    if (group.length === 0) {
      return true;
    }

    return Object.keys(group).length === 0;
  }

  static isItemInChecked(item, checked, groupName) {
    if (!checked || !checked[groupName]) {
      return false;
    }

    return checked[groupName][item.name] !== undefined;
  }

  static updateSignsWithChecked(signs, checked) {
    const data = signs.map(group => {
      const groupName = group.name;
      const newGroup = {
        name: groupName
      };

      newGroup.children = group.children.map(item => {
        const isChecked = this.isItemInChecked(item, checked, groupName);

        return {
          name: item.name,
          value: item.value,
          isChecked
        };
      });

      return newGroup;
    });

    return data;
  }

  static getGrammaticalSigns() {
    const grammaticalSigns = grammaticalSignsRaw.map(grammaticalGroup => {
      return {
        name: getTranslation(grammaticalGroup.name),
        children: grammaticalGroup.children.map(grammaticalSign => {
          return {
            name: getTranslation(grammaticalSign.name),
            value: grammaticalSign.value
          };
        })
      };
    });

    return grammaticalSigns;
  }

  constructor() {
    super();

    this.grammaticalSigns = this.constructor.getGrammaticalSigns();
    this.onCheckedChange = this.onCheckedChange.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
  }

  /**
   * Handles user check on grammatical sign item
   * @param {Object} item - grammatical sign
   */
  onCheckedChange(item) {
    const { checked } = this.props;
    const { name, value, isChecked, groupName } = item;
    const newChecked = {
      ...checked
    };

    if (!isChecked) {
      if (newChecked[groupName] && newChecked[groupName][name]) {
        delete newChecked[groupName][name];
      }

      if (this.constructor.isGroupEmpty(newChecked[groupName])) {
        delete newChecked[groupName];
      }
    } else {
      newChecked[groupName] = newChecked[groupName] || {};
      newChecked[groupName][name] = value;
    }

    this.sendDataToTop(newChecked);
  }

  getGridData(rowsData) {
    const { checked } = this.props;
    const { grammaticalSigns } = this;
    const grammaticalSignsData = this.constructor.updateSignsWithChecked(grammaticalSigns, checked);

    return rowsData.map(row => {
      const resultRow = {};

      resultRow.id = row.id;
      resultRow.columns = row.columns.map(column => {
        const resultColumn = {};

        resultColumn.id = column.id;
        resultColumn.blocksToRender = column.indexesOfSignGroup.map(index => {
          const grammaticalSignsGroup = grammaticalSignsData[index];

          if (!grammaticalSignsGroup) {
            return null;
          }

          return (
            <GrammarGroup
              key={grammaticalSignsGroup.name}
              data={grammaticalSignsGroup}
              onChange={this.onCheckedChange}
            />
          );
        });

        return resultColumn;
      });

      return resultRow;
    });
  }

  checkAll() {
    const newChecked = {};

    grammaticalSignsRaw.forEach(grammaticalGroup => {
      const groupName = grammaticalGroup.name;
      newChecked[groupName] = newChecked[groupName] || {};

      grammaticalGroup.children.forEach(grammaticalSign => {
        const { name, value } = grammaticalSign;
        newChecked[groupName][name] = value;
      });
    });

    this.sendDataToTop(newChecked);
  }

  uncheckAll() {
    const newChecked = {};

    this.sendDataToTop(newChecked);
  }

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  renderSigns() {
    const gridData = this.getGridData(signGroupDivision);

    return <GridGenerator data={gridData} GridComponent={Grid} RowComponent={Grid.Row} ColumnComponent={Grid.Column} />;
  }

  render() {
    const grammarBlock = this.renderSigns();
    const uncheckAllButtonText = getTranslation("Uncheck all");
    const checkAllButtonText = getTranslation("Check all");

    return (
      <div className={classNames.container}>
        <div className={classNames.buttons}>
          <Button primary basic onClick={this.uncheckAll}>
            {uncheckAllButtonText}
          </Button>
          <Button primary basic onClick={this.checkAll}>
            {checkAllButtonText}
          </Button>
        </div>
        {grammarBlock}
      </div>
    );
  }
}

export default GrammarFilter;
