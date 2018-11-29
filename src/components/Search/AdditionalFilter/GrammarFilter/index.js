import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import grammaticalSigns from './grammaticalSigns.json';
import GrammarGroup from './Group';
import './index.scss';

const classNames = {
  container: 'grammar-filter',
  row: 'grammar-filter__row',
};

// division of groups by index in array into rows and columns
const rowsDescription = [
  {
    id: '1',
    columns: [
      {
        id: '1',
        indexesOfSignGroup: [7],
      },
      {
        id: '2',
        indexesOfSignGroup: [1],
      },
    ],
  },
  {
    id: '4',
    columns: [
      {
        id: '5',
        indexesOfSignGroup: [0]
      },
      {
        id: '4',
        indexesOfSignGroup: [6, 8],
      },
    ],
  },
  {
    id: '2',
    columns: [
      {
        id: '3',
        indexesOfSignGroup: [2, 3],
      },
      {
        id: '6',
        indexesOfSignGroup: [4, 5],
      },
    ],
  },
];

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

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  renderRowGroup(signGroups) {
    return rowsDescription.map(rowDescription => this.renderRow(rowDescription, signGroups));
  }

  renderColumnGroup(columns, signGroups) {
    return columns.map(columnItem => this.renderColumn(columnItem, signGroups));
  }

  renderColumn(column, signGroups) {
    const renderSignGroups = column.indexesOfSignGroup.map((index) => {
      const group = signGroups[index];
      if (!group) {
        return null;
      }

      return <GrammarGroup
        key={group.name}
        data={group}
        onChange={this.onCheckedChange}
      />;
    });

    if (renderSignGroups.length === 0) {
      return null;
    }

    return (
      <Grid.Column key={column.id}>
        {renderSignGroups}
      </Grid.Column>
    );
  }

  renderRow(rowDescription, signGroups) {
    const columnGroup = this.renderColumnGroup(rowDescription.columns, signGroups);

    if (columnGroup.length === 0) {
      return null;
    }

    return (
      <Grid.Row key={rowDescription.id} className={classNames.row} stretched>
        {columnGroup}
      </Grid.Row>
    );
  }

  renderSigns(signGroups) {
    const rowsGroup = this.renderRowGroup(signGroups);

    return (
      <Grid columns={2}>
        {rowsGroup}
      </Grid>
    );
  }

  render() {
    const { checked } = this.props;
    const data = this.constructor.updateSignsWithChecked(grammaticalSigns, checked);
    const grammarBlock = this.renderSigns(data);

    return (
      <div className={classNames.container}>
        {grammarBlock}
      </div>
    );
  }
}

export default GrammarFilter;
