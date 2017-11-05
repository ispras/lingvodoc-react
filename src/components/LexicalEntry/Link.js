import React from 'react';
import { Button } from 'semantic-ui-react';

const Link = (props) => {
  const { entry, as: Component = 'div' } = props;

  return (
    <Component className="gentium">
      <Button basic as="button" content="Backref" icon="code" labelPosition="left" />
    </Component>
  );
};

export default Link;
