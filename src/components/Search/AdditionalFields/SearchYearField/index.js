import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class SearchYearField extends PureComponent {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    classNames: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
  }

  static valueIsAll(value) {
    return value === 'all';
  }

  static getDropdownInnerValue(value) {
    return value === null ? 'all' : value;
  }

  static getDropdownOptions(values) {
    const options = [
      {
        value: 'all',
        key: 'all',
        text: 'All',
      },
    ];

    values.forEach((value) => {
      options.push({
        value,
        key: value,
        text: value,
      });
    });

    return options;
  }

  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
  }

  /**
   * On value change event handler.
   * @param {string} value - field value
   */
  onChange(ev, { value }) {
    const { onChange } = this.props;

    if (this.constructor.valueIsAll(value)) {
      onChange(null);
    } else {
      onChange(value);
    }
  }

  render() {
    const { value, classNames, options: rawOptions } = this.props;
    const { getDropdownInnerValue, getDropdownOptions } = this.constructor;
    return (
      <div className={classNames.field}>
        <div className={classNames.header}>Years</div>
        <Dropdown
          selection
          options={getDropdownOptions(rawOptions)}
          value={getDropdownInnerValue(value)}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default SearchYearField;
