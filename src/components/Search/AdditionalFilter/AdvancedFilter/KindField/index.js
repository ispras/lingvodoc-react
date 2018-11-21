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
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired,
  }

  static valueIsAll(value) {
    return value === 'All';
  }

  static getDropdownInnerValue(value) {
    return value === null ? 'All' : value;
  }

  constructor() {
    super();

    this.options = {
      archive: 'Archive',
      expedition: 'Expedition',
      all: 'All',
    };

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
    const { expedition, archive, all } = this.options;

    return [
      {
        key: 0,
        text: all,
        value: all,
      },
      {
        key: 1,
        text: expedition,
        value: expedition,
      },
      {
        key: 2,
        text: archive,
        value: archive,
      },
    ];
  }

  render() {
    const { value, classNames, getTranslation } = this.props;
    const { getDropdownInnerValue } = this.constructor;

    const label = getTranslation('Data source');
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
