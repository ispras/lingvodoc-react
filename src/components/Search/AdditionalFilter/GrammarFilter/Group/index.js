import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import GrammarItem from '../Item';

class GrammarGroup extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      children: PropTypes.array.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor() {
    super();

    this.onItemChange = this.onItemChange.bind(this);
  }

  onItemChange(item) {
    const { name: groupName } = this.props.data;
    this.sendDataToTop({
      ...item,
      groupName,
    });
  }

  getRenderItems(items) {
    return items.map(item => <GrammarItem
      key={item.value}
      data={item}
      onChange={this.onItemChange}
    />);
  }

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  render() {
    const { name, children: items } = this.props.data;
    const group = this.getRenderItems(items);
    return (
      <div>
        <div>{name}</div>
        <div>{group}</div>
      </div>
    );
  }
}

export default GrammarGroup;
