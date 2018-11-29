import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import grammaticalSigns from './grammaticalSigns.json';
import GrammarGroup from './Group';

class GrammarFilter extends PureComponent {
  static propTypes = {
    checked: PropTypes.object.isRequired,
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
        const isChecked = this.isItemInChecked(item, checked, newGroup);

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

  static getRenderGroups(groups) {
    return groups.map(group => <GrammarGroup key={group.name} data={group} />);
  }

  constructor() {
    super();

    this.state = {};
  }

  render() {
    const { checked } = this.props;
    const data = this.constructor.updateSignsWithChecked(grammaticalSigns, checked);
    const grammarBlock = this.constructor.getRenderGroups(data);

    return (
      <div>
        <div>Grammar</div>
        <div>{grammarBlock}</div>
      </div>
    );
  }
}

export default GrammarFilter;
