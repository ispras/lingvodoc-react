import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LanguageGroup from './LanguageGroup';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree__item',
  translationWrap: 'search-language-tree__translation-wrap',
  translation: 'search-language-tree__translation',
  checkbox: 'search-language-tree__checkbox',
};

/* ----------- COMPONENT ----------- */
class LanguageItem extends PureComponent {
  constructor() {
    super();

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
  }

  onCheckboxChange(ev) {
    this.props.onChange(this.props.data.id, 'language', ev.target.checked);
  }

  render() {
    const { data } = this.props;
    const isParent = data.children.length > 0 || data.dictionaries.length > 0;

    if (isParent) {
      return <LanguageGroup data={data} onChange={this.props.onChange} />;
    }

    let checked = false;

    if (data && (data.checked === undefined || data.checked)) {
      checked = true;
    }

    return (
      <div className={classNames.container}>
        <div className={classNames.translationWrap}>
          <input
            className={classNames.checkbox}
            type="checkbox"
            checked={checked}
            onChange={this.onCheckboxChange}
          />
          <div className={classNames.translation}>
            {data.translation}
          </div>
        </div>
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
LanguageItem.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageItem;
