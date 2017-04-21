import React from 'react';

function single(mode) {
  switch (mode) {
    default:
      return null;
  }
}

function all(mode) {
  switch (mode) {
    default:
      return null;
  }
}

const Sound = (props) => {
  const {
    entry,
    mode,
    as: Component = 'div',
  } = props;

  return (
    <Component className="gentium">
      Sound {entry.length}
      { all(mode) }
    </Component>
  );
};

export default Sound;
