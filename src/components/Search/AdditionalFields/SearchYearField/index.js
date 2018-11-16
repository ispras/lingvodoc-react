import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SearchFieldSelect from '../SearchFieldSelect';

/* ----------- COMPONENT ----------- */
/**
 * Kind field.
 */
class SearchYearField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.array.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    selectAllText: PropTypes.string.isRequired,
    clearAllText: PropTypes.string.isRequired,
    selectText: PropTypes.string.isRequired,
    noFoundText: PropTypes.string.isRequired,
  }

  static getDropdownOptionsFromStrings(values) {
    return values.map(value => ({
      value,
      key: value,
      text: value,
    }));
  }

  /**
   * Check if component value is empty.
   * @param {string[]} value - array of options for selecting
   */
  static isValueEmpty(value) {
    return (value.length === 0);
  }

  constructor() {
    super();

    this.onValueChange = this.onValueChange.bind(this);
    this.onSelectAllButtonClick = this.onSelectAllButtonClick.bind(this);
    this.onClearAllButtonClick = this.onClearAllButtonClick.bind(this);
  }

  onValueChange(ev, { value }) {
    const { onChange } = this.props;
    onChange(value);
  }

  onSelectAllButtonClick() {
    this.props.onChange(this.props.options);
  }

  onClearAllButtonClick() {
    const { isValueEmpty } = this.constructor;
    const { value } = this.props;

    if (isValueEmpty(value)) {
      return;
    }

    this.props.onChange([]);
  }

  render() {
    const {
      value, classNames, options: valueStrings, selectAllText, clearAllText,
      label, selectText, noFoundText,
    } = this.props;
    const { getDropdownOptionsFromStrings } = this.constructor;

    return (
      <div className={classNames.field}>
        <div className={classNames.header}>{label}</div>
        {/* TODO: need some styles with height limitation and button margins */}
        <SearchFieldSelect
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

export default SearchYearField;
