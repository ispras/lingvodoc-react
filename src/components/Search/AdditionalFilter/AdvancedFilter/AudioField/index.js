import React, { PureComponent } from "react";
import { Button, Dropdown } from "semantic-ui-react";
import PropTypes from "prop-types";

/* ----------- COMPONENT ----------- */
/**
 * Audio field.
 */
class AudioField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.oneOf([true, false, null]),
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired
  };

  /**
   * Get hasAudio value with dropdown format.
   * @param {boolean|null} value - hasAudio value with outer format
   */
  static getDropdownInnerValue(value) {
    if (value === null) {
      return null;
    }

    return value ? 1 : 0;
  }

  /**
   * Get hasAudio value with outer format.
   * @param {number} value - hasAudio value with dropdown format
   */
  static getDropdownOuterValue(value) {
    if (value === 0) {
      return false;
    }

    if (value === 1) {
      return true;
    }

    return null;
  }

  constructor(props) {
    super();

    const { getTranslation } = props;

    this.optionsText = {
      haveAudio: getTranslation("Has audio"),
      noAudio: getTranslation("No audio")
    };

    this.onDropdownValueChange = this.onDropdownValueChange.bind(this);
    this.onClearAllButtonClick = this.onClearAllButtonClick.bind(this);
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

  onClearAllButtonClick() {
    if (this.props.value === null) {
      return;
    }

    this.props.onChange(null);
  }

  getDropdownOptions() {
    const { haveAudio: haveAudioText, noAudio: noAudioText } = this.optionsText;

    return [
      {
        key: 1,
        text: haveAudioText,
        value: 1
      },
      {
        key: 0,
        text: noAudioText,
        value: 0
      }
    ];
  }

  render() {
    const { value, classNames, getTranslation } = this.props;
    const { getDropdownInnerValue } = this.constructor;

    const label = getTranslation("Audio");
    const clearText = getTranslation("Clear");
    const placeholder = getTranslation("Select audio");

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        <Dropdown
          selection
          options={this.getDropdownOptions()}
          value={getDropdownInnerValue(value)}
          onChange={this.onDropdownValueChange}
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

export default AudioField;
