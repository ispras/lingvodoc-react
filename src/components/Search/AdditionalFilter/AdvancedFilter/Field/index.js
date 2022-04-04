import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import FieldSelect from "../FieldSelect";

/* ----------- COMPONENT ----------- */
/**
 * Advanced filter field.
 */
class Field extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    selectAllText: PropTypes.string.isRequired,
    clearAllText: PropTypes.string.isRequired,
    selectText: PropTypes.string.isRequired,
    noFoundText: PropTypes.string.isRequired
  };

  static getDropdownOptionsFromStrings(values) {
    return values.map(value => ({
      value,
      key: value,
      text: value
    }));
  }

  /**
   * Check if component value is empty.
   * @param {string[]} value - array of options for selecting
   */
  static isValueEmpty(value) {
    return value.length === 0;
  }

  constructor() {
    super();

    this.onValueChange = this.onValueChange.bind(this);
    this.onSelectAllButtonClick = this.onSelectAllButtonClick.bind(this);
    this.onClearAllButtonClick = this.onClearAllButtonClick.bind(this);
  }

  onValueChange(ev, { value }) {
    this.updateValue(value);
  }

  onSelectAllButtonClick() {
    const newValue = this.props.options;
    this.updateValue(newValue);
  }

  onClearAllButtonClick() {
    const { isValueEmpty } = this.constructor;
    const { value } = this.props;

    if (isValueEmpty(value)) {
      return;
    }

    this.updateValue([]);
  }

  updateValue(value) {
    const { onChange, name } = this.props;
    onChange(value, name);
  }

  render() {
    const {
      value,
      classNames,
      options: valueStrings,
      selectAllText,
      clearAllText,
      label,
      selectText,
      noFoundText
    } = this.props;
    const { getDropdownOptionsFromStrings } = this.constructor;

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        {/* TODO: need some styles with height limitation and button margins */}
        <FieldSelect
          value={value}
          options={getDropdownOptionsFromStrings(valueStrings)}
          onChange={this.onValueChange}
          onSelectAllButtonClick={this.onSelectAllButtonClick}
          onClearAllButtonClick={this.onClearAllButtonClick}
          placeholder={selectText}
          selectAllText={selectAllText}
          clearAllText={clearAllText}
          noResultsMessage={noFoundText}
        />
      </div>
    );
  }
}

export default Field;
