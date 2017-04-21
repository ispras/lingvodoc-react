import React from 'react';

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
      return '+';
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
      {
        entry.map(sub =>
          <div key={`${sub.client_id}/${sub.object_id}`}>{sub.content} { single(mode) }</div>)
      }
      { all(mode) }
    </Component>
  );
};

export default Text;
