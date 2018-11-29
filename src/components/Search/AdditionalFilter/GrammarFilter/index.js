import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import grammaticalSigns from './grammaticalSigns.json';
import GrammarGroup from './Group';
import GridGenerator from './GridGenerator';
import signGroupDivision from './signGroupDivision';
import './index.scss';

const classNames = {
  container: 'grammar-filter',
};

class GrammarFilter extends PureComponent {
  static propTypes = {
    checked: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static isItemInChecked(item, checked, groupName) {
    if (!checked || !checked[groupName]) {
      return false;
    }

    return checked[groupName][item.name] !== undefined;
  }

  static updateSignsWithChecked(signs, checked) {
    const data = signs.map((group) => {
      const groupName = group.name;
      const newGroup = {
        name: groupName,
      };

      newGroup.children = group.children.map((item) => {
        const isChecked = this.isItemInChecked(item, checked, groupName);

        return {
          name: item.name,
          value: item.value,
          isChecked,
        };
      });

      return newGroup;
    });

    return data;
  }

  constructor() {
    super();

    this.onCheckedChange = this.onCheckedChange.bind(this);
  }

  /**
   * Handles user check on grammatical sign item
   * @param {Object} item - grammatical sign
   */
  onCheckedChange(item) {
    const { checked } = this.props;
    const {
      name, value, isChecked, groupName,
    } = item;
    const newChecked = {
      ...checked,
    };

    if (!isChecked) {
      if (newChecked[groupName] && newChecked[groupName][name]) {
        delete newChecked[groupName][name];
      }
    } else {
      newChecked[groupName] = newChecked[groupName] || {};
      newChecked[groupName][name] = value;
    }

    this.sendDataToTop(newChecked);
  }

  getGridData(rowsData) {
    const { checked } = this.props;
    const grammaticalSignsData = this.constructor.updateSignsWithChecked(grammaticalSigns, checked);

    return rowsData.map((row) => {
      const resultRow = {};

      resultRow.id = row.id;
      resultRow.columns = row.columns.map((column) => {
        const resultColumn = {};

        resultColumn.id = column.id;
        resultColumn.blocksToRender = column.indexesOfSignGroup.map((index) => {
          const grammaticalSignsGroup = grammaticalSignsData[index];

          if (!grammaticalSignsGroup) {
            return null;
          }

          return <GrammarGroup
            key={grammaticalSignsGroup.name}
            data={grammaticalSignsGroup}
            onChange={this.onCheckedChange}
          />;
        });

        return resultColumn;
      });

      return resultRow;
    });
  }

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  renderSigns() {
    const gridData = this.getGridData(signGroupDivision);

    return (
      <GridGenerator
        data={gridData}
        GridComponent={Grid}
        RowComponent={Grid.Row}
        ColumnComponent={Grid.Column}
      />
    );
  }

  render() {
    const grammarBlock = this.renderSigns();

    return (
      <div className={classNames.container}>
        {grammarBlock}
      </div>
    );
  }
}

export default GrammarFilter;
