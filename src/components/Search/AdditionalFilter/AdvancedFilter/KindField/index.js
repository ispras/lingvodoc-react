import React, { PureComponent } from "react";
import { Button, Dropdown } from "semantic-ui-react";
import PropTypes from "prop-types";

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class KindField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired
  };

  static getDropdownInnerValue(value) {
    if (value === false) {
      return null;
    }

    return value;
  }

  static getDropdownOuterValue(value) {
    if (value === null) {
      return false;
    }

    return value;
  }

  constructor(props) {
    super();

    const { getTranslation } = props;

    this.options = {
      archive: getTranslation("Archive"),
      expedition: getTranslation("Expedition")
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
    const { getDropdownOuterValue } = this.constructor;

    onChange(getDropdownOuterValue(value));
  }

  onClearAllButtonClick() {
    if (this.props.value === null) {
      return;
    }

    this.props.onChange(false);
  }

  getDropdownOptions() {
    const { expedition, archive } = this.options;

    return [
      {
        key: 1,
        text: expedition,
        value: expedition
      },
      {
        key: 2,
        text: archive,
        value: archive
      }
    ];
  }

  render() {
    const { value, classNames, getTranslation } = this.props;
    const { getDropdownInnerValue } = this.constructor;

    const label = getTranslation("Data source");
    const clearText = getTranslation("Clear");
    const placeholder = getTranslation("Select data source");

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        <Dropdown
          selection
          options={this.getDropdownOptions()}
          value={getDropdownInnerValue(value)}
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
