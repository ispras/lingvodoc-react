import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/* ----------- COMPONENT ----------- */
/**
 * Audio field.
 */
class AudioField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.oneOf([
      true, false, null,
    ]),
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired,
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

  constructor(props) {
    super();

    const { getTranslation } = props;

    this.optionsText = {
      haveAudio: getTranslation('Have audio'),
      noAudio: getTranslation('No audio'),
      all: getTranslation('All'),
    };

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
    const {
      haveAudio: haveAudioText, noAudio: noAudioText, all: allText,
    } = this.optionsText;

    return [
      {
        key: 2,
        text: allText,
        value: 2,
      },
      {
        key: 1,
        text: haveAudioText,
        value: 1,
      },
      {
        key: 0,
        text: noAudioText,
        value: 0,
      },
    ];
  }

  render() {
    const { value, classNames, getTranslation } = this.props;
    const { getDropdownInnerValue } = this.constructor;

    const label = getTranslation('Audio');

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

export default AudioField;
