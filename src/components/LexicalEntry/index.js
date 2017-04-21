import React from 'react';
import { pure } from 'recompose';

import Text from './Text';
import Sound from './Sound';
import Unknown from './Unknown';
import Empty from './Empty';

function getComponent(dataType) {
  return ({
    '1/47': Text,
    '1/51': Sound,
  })[dataType] || Unknown;
}

const LexicalEntry = (props) => {
  const {
    entry,
    dataType,
  } = props;

  if (!entry) {
    return <Empty {...props} />;
  }

  const Component = getComponent(dataType);

  return <Component {...props} />;
};

export default pure(LexicalEntry);
