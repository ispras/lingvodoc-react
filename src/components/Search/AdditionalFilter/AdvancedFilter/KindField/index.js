import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class KindField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.oneOf([
      'Expedition', 'Archive', null,
    ]),
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    allSelectedText: PropTypes.string.isRequired,
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

  getDropdownOptions() {
    const { allSelectedText } = this.props;
    const { expedition, archive } = this.props.options;

    return [
      {
        key: 0,
        text: allSelectedText,
        value: 'all',
      },
      {
        key: 1,
        text: expedition,
        value: 'Expedition',
      },
      {
        key: 2,
        text: archive,
        value: 'Archive',
      },
    ];
  }

  render() {
    const { value, classNames, label } = this.props;
    const { getDropdownInnerValue } = this.constructor;
    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        <Dropdown
          selection
          options={this.getDropdownOptions()}
          value={getDropdownInnerValue(value)}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default KindField;
