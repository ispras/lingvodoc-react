import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import grammaticalSigns from './grammaticalSigns.json';
import GrammarGroup from './Group';

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

  getRenderGroups(groups) {
    return groups.map(group => <GrammarGroup
      key={group.name}
      data={group}
      onChange={this.onCheckedChange}
    />);
  }

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  render() {
    const { checked } = this.props;
    const data = this.constructor.updateSignsWithChecked(grammaticalSigns, checked);
    const grammarBlock = this.getRenderGroups(data);

    return (
      <div>
        <div>Grammar</div>
        <div>{grammarBlock}</div>
      </div>
    );
  }
}

export default GrammarFilter;
