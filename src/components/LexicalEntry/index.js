import React from 'react';
import { pure } from 'recompose';

import Text from './Text';
import Sound from './Sound';
import Markup from './Markup';
import Link from './Link';
import GroupingTag from './GroupingTag';
import Unknown from './Unknown';
import Empty from './Empty';

function getComponent(dataType) {
  return ({
    Text,
    Sound,
    Markup,
    Link,
    'Grouping Tag': GroupingTag,
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
