import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

const dropdownOptions = [
  {
    key: 2,
    text: 'All',
    value: 2,
  },
  {
    key: 1,
    text: 'Have audio',
    value: 1,
  },
  {
    key: 0,
    text: 'No audio',
    value: 0,
  },
];

/* ----------- COMPONENT ----------- */
/**
 * Audio field.
 */
class SearchAudioField extends PureComponent {
  static propTypes = {
    value: PropTypes.oneOf([
      true, false, null,
    ]),
    onChange: PropTypes.func.isRequired,
    classNames: PropTypes.object.isRequired,
  }

  /**
   * Get hasAudio value with dropdown format.
   * @param {boolean|null} value - hasAudio value with outer format
   */
  static getDropdownInnerValue(value) {
    if (value === null) {
      return 2;
    }

    return value ? 1 : 0;
  }

  /**
   * Get hasAudio value with outer format.
   * @param {number} value - hasAudio value with dropdown format
   */
  static getDropdownOuterValue(value) {
    if (value === 2) {
      return null;
    }

    if (value === 1) {
      return true;
    }

    return false;
  }

  constructor() {
    super();

    this.onDropdownValueChange = this.onDropdownValueChange.bind(this);
  }

  /**
   * On dropdown value change event handler.
   * @param {boolean|null} value - field value
   */
  onDropdownValueChange(ev, { value }) {
    const { onChange } = this.props;
    const { getDropdownOuterValue } = this.constructor;
    onChange(getDropdownOuterValue(value));
  }

  render() {
    const { value, classNames } = this.props;
    const { getDropdownInnerValue } = this.constructor;
    return (
      <div className={classNames.field}>
        <div className={classNames.header}>Audio</div>
        <Dropdown
          selection
          options={dropdownOptions}
          value={getDropdownInnerValue(value)}
          onChange={this.onDropdownValueChange}
        />
      </div>
    );
  }
}

export default SearchAudioField;
