import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { onlyUpdateForPropTypes, branch, renderNothing, compose } from 'recompose';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';

const Pager = styled(Menu)`
  position: fixed;
  bottom: 10px;
  opacity: 0.2;
  transition: opacity 0.2s linear;
  &:hover {
    opacity: 1;
  }
`;

const Pagination = ({ current, total, changePage }) => (
  <Pager size="tiny" pagination>
    <Menu.Item name="Page" />

    {current > 1 && <Menu.Item onClick={() => changePage(current - 1)} icon="chevron left" />}
    {Range(1, total).map(page => (
      <Menu.Item key={page} name={page.toString()} active={page === current} onClick={() => changePage(page)} />
    ))}
    {current < total - 1 && <Menu.Item onClick={() => changePage(current + 1)} icon="chevron right" />}
  </Pager>
);

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
};

export default compose(branch(({ total }) => total < 2, renderNothing), onlyUpdateForPropTypes)(Pagination);
