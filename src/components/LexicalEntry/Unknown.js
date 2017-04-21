import React from 'react';

const Unknown = (props) => {
  const {
    as: Component = 'div',
  } = props;

  return (
    <Component>Unknown type</Component>
  );
};

export default Unknown;
