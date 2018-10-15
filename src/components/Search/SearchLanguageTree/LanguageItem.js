import React from 'react';
import PropTypes from 'prop-types';

import LanguageGroup from './LanguageGroup';

const LanguageItem = ({ data }) => {
  const isParent = data.children.length > 0;

  if (isParent) {
    return <LanguageGroup data={data} />;
  }

  return (
    <div>
      Язык
    </div>
  );
};

LanguageItem.propTypes = {
  data: PropTypes.object.isRequired,
};

export default LanguageItem;
