import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import GrammarItem from '../Item';

class GrammarGroup extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      children: PropTypes.array.isRequired,
    }).isRequired,
  }

  static getRenderItems(items) {
    return items.map(item => <GrammarItem key={item.value} data={item} />);
  }

  constructor() {
    super();

    this.state = {};
  }

  render() {
    const { name, children: items } = this.props.data;
    const group = this.constructor.getRenderItems(items);
    return (
      <div>
        <div>{name}</div>
        <div>{group}</div>
      </div>
    );
  }
}

export default GrammarGroup;
