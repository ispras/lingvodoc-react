import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

const Link = (props) => {
  const { as: Component } = props;

  return (
    <Component className="gentium">
      <Button basic as="button" content="Backref" icon="code" labelPosition="left" />
    </Component>
  );
};

Link.propTypes = {
  as: PropTypes.string,
};

Link.defaultProps = {
  as: 'div',
};

export default Link;
