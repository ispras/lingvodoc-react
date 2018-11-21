import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button } from 'semantic-ui-react';

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

  // static valueIsAll(value) {
  //   return value === 'All';
  // }

  // static getDropdownInnerValue(value) {
  //   return value === null ? null : value;
  // }

  constructor() {
    super();

    this.options = {
      archive: 'Archive',
      expedition: 'Expedition',
    };

    this.onChange = this.onChange.bind(this);
    this.onClearAllButtonClick = this.onClearAllButtonClick.bind(this);
  }

  /**
   * On value change event handler.
   * @param {string} value - field value
   */
  onChange(ev, { value }) {
    const { onChange } = this.props;

    // if (this.constructor.valueIsAll(value)) {
    //   onChange(null);
    // } else {
    //   onChange(value);
    // }

    onChange(value);
  }

  onClearAllButtonClick() {
    if (this.props.value === null) {
      return;
    }

    this.props.onChange(null);
  }

  getDropdownOptions() {
    const { expedition, archive } = this.options;

    return [
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
    // const { getDropdownInnerValue } = this.constructor;

    const label = getTranslation('Data source');
    const clearText = getTranslation('Clear');
    const placeholder = getTranslation('Select data source');

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        <Dropdown
          selection
          options={this.getDropdownOptions()}
          value={value}
          onChange={this.onChange}
          placeholder={placeholder}
        />
        <div>
          <Button primary basic onClick={this.onClearAllButtonClick}>
            {clearText}
          </Button>
        </div>
      </div>
    );
  }
}

export default KindField;
