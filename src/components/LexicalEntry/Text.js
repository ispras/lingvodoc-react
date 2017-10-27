import React from 'react';
import { List } from 'semantic-ui-react';

function single(mode) {
  switch (mode) {
    case 'edit':
      return '+';
    default:
      return null;
  }
}

function all(mode) {
  switch (mode) {
    case 'edit':
      return <List.Item>+</List.Item>;
    default:
      return null;
  }
}

const Text = (props) => {
  const {
    entry,
    mode,
    as: Component = 'div',
  } = props;

  return (
    <Component className="gentium">
      <List>
        {
          entry.map(sub =>
            <List.Item key={`${sub.id[0]}/${sub.id[1]}`}>{sub.content} { single(mode) }</List.Item>)
        }
        { all(mode) }
      </List>
    </Component>
  );
};

export default Text;
