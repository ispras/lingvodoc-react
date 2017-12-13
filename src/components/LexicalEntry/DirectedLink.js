import React from 'react';
import { Button } from 'semantic-ui-react';


const DirectedLink = (props) => {
  const {
    entry,
    as: Component = 'div',
  } = props;

  return (
    <Component className="gentium">
      <Button basic as="button" content="Link" icon="code" labelPosition="left" />
    </Component>
  );
};

export default DirectedLink;
