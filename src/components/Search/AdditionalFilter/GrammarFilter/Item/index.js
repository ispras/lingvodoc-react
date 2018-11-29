import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'semantic-ui-react';

class GrammarItem extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      isChecked: PropTypes.bool.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
  }

  onChange(ev, { checked }) {
    this.sendDataToTop({
      ...this.props.data,
      isChecked: checked,
    });
  }

  sendDataToTop(data) {
    this.props.onChange(data);
  }

  render() {
    const { name, isChecked } = this.props.data;
    return (
      <div>
        <Checkbox
          label={name}
          checked={isChecked}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default GrammarItem;
