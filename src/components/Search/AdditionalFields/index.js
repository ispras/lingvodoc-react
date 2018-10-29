import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SearchSelectLanguages from './SearchSelectLanguages';

/**
 * Additional fields for the search form.
 */
class AdditionalFields extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultData: PropTypes.object.isRequired,
  }

  constructor() {
    super();

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
  }

  /**
   * Event handler for languages or dictionaries selecting.
   * @param {Object} list - checked languages and/or dictionaries
   */
  onLangsDictsChange(list) {
    const result = {
      ...list,
    };

    this.props.onChange(result);
  }

  render() {
    const { languages, dictionaries } = this.props.defaultData;
    return (
      <SearchSelectLanguages onChange={this.onLangsDictsChange} defaultLangs={languages} defaultDicts={dictionaries} />
    );
  }
}

export default AdditionalFields;
