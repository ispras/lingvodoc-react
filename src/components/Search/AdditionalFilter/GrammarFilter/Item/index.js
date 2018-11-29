import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class GrammarItem extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      isChecked: PropTypes.bool.isRequired,
    }).isRequired,
  }

  constructor() {
    super();

    this.state = {};
  }

  render() {
    const { name, isChecked } = this.props.data;
    return (
      <div>
        <div>{name} - isChecked: {isChecked.toString()}</div>
      </div>
    );
  }
}

export default GrammarItem;
