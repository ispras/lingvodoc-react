import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/* ----------- COMPONENT ----------- */
/**
 * Audio field.
 */
class SearchAudioField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.oneOf([
      true, false, null,
    ]),
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    allSelectedText: PropTypes.string.isRequired,
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

  getDropdownOptions() {
    const { allSelectedText } = this.props;
    const { haveAudio, noAudio } = this.props.options;

    return [
      {
        key: 2,
        text: allSelectedText,
        value: 2,
      },
      {
        key: 1,
        text: haveAudio,
        value: 1,
      },
      {
        key: 0,
        text: noAudio,
        value: 0,
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
          onChange={this.onDropdownValueChange}
        />
      </div>
    );
  }
}

export default SearchAudioField;
