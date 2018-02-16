import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes, branch, renderNothing, compose } from 'recompose';
import styled from 'styled-components';

const Container = styled('div')`
  position: fixed;
  bottom: 10px;
  opacity: 0.2;
  transition: opacity 0.2s linear;

  &:hover {
    opacity: 1;
  }
`;

const Player = (props) => {
  const { text } = props;
  return <Container>{text}</Container>;
};

Player.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default compose(branch(({ visible }) => !visible, renderNothing), onlyUpdateForPropTypes)(Player);
