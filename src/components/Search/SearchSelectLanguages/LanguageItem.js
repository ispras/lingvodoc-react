import React from 'react';
import PropTypes from 'prop-types';

import LanguageGroup from './LanguageGroup';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree__item',
  translationWrap: 'search-language-tree__translation-wrap',
  translation: 'search-language-tree__translation',
};

/* ----------- COMPONENT ----------- */
const LanguageItem = ({ data }) => {
  const isParent = data.children.length > 0;

  if (isParent) {
    return <LanguageGroup data={data} />;
  }

  return (
    <div className={classNames.container}>
      <div className={classNames.translationWrap}>
        <div className={classNames.translation}>
          {data.translation}
        </div>
      </div>
    </div>
  );
};

/* ----------- PROPS VALIDATION ----------- */
LanguageItem.propTypes = {
  data: PropTypes.object.isRequired,
};

export default LanguageItem;
