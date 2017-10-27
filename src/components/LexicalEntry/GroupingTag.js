import React from 'react';
import { Button } from 'semantic-ui-react';


const GroupingTag = (props) => {
  const {
    entry,
    as: Component = 'div',
  } = props;

  return (
    <Component className="gentium">
      <Button basic as="button" content="Grouping Tag" icon="code" labelPosition="left" />
    </Component>
  );
};

export default GroupingTag;
