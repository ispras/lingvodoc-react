import React from 'react';
import PropTypes from 'prop-types';

import LanguageItem from './LanguageItem';

const LanguageGroup = ({ data }) => {
  const { children } = data;
  return (
    <div>
      <button>+</button>
      <div>Группа</div>
      <div>
        {children.map(item => <LanguageItem key={item.id} data={item} />)}
      </div>
    </div>
  );
};

LanguageGroup.propTypes = {
  data: PropTypes.object.isRequired,
};

export default LanguageGroup;
