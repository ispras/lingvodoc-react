import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Field from '../Field';

class AuthorsField extends PureComponent {
  static propTypes = {
    classNames: PropTypes.object.isRequired,
    value: PropTypes.array.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    getTranslation: PropTypes.func.isRequired,
  }

  render() {
    const {
      classNames, value, options, onChange, getTranslation,
    } = this.props;
    const selectText = getTranslation('Select authors');
    const noFoundText = getTranslation('No authors found.');
    const label = getTranslation('Authors');
    const selectAllText = getTranslation('Select all');
    const clearAllText = getTranslation('Clear all');

    return (
      <Field
        classNames={classNames}
        value={value}
        name="authors"
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

export default AuthorsField;
