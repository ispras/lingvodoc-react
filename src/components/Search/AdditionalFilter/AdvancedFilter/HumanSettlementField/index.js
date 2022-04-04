import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import Field from "../Field";

class HumanSettlementField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.array.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired
  };

  render() {
    const { classNames, value, options, onChange, getTranslation } = this.props;
    const selectText = getTranslation("Select settlement");
    const noFoundText = getTranslation("No settlement found.");
    const label = getTranslation("Settlement");
    const selectAllText = getTranslation("Select all");
    const clearAllText = getTranslation("Clear all");

    return (
      <Field
        classNames={classNames}
        value={value}
        name="humanSettlement"
        options={options}
        onChange={onChange}
        label={label}
        selectAllText={selectAllText}
        clearAllText={clearAllText}
        selectText={selectText}
        noFoundText={noFoundText}
      />
    );
  }
}

export default HumanSettlementField;
