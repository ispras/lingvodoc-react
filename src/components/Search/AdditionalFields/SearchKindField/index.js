import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

const dropdownOptions = [
  {
    key: 0,
    text: 'All',
    value: 'all',
  },
  {
    key: 1,
    text: 'Expedition',
    value: 'Expedition',
  },
  {
    key: 2,
    text: 'Archive',
    value: 'Archive',
  },
];

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class SearchKindField extends PureComponent {
  static propTypes = {
    value: PropTypes.oneOf([
      'Expedition', 'Archive', null,
    ]),
    onChange: PropTypes.func.isRequired,
    classNames: PropTypes.object.isRequired,
  }

  static valueIsAll(value) {
    return value === 'all';
  }

  static getDropdownInnerValue(value) {
    return value === null ? 'all' : value;
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
    const { value, classNames } = this.props;
    const { getDropdownInnerValue } = this.constructor;
    return (
      <div className={classNames.field}>
        <div className={classNames.header}>Data source</div>
        <Dropdown
          selection
          options={dropdownOptions}
          value={getDropdownInnerValue(value)}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default SearchKindField;
