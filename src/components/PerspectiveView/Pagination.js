import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { onlyUpdateForPropTypes, branch, renderNothing, compose } from 'recompose';
import { Link } from 'react-router-dom';
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

const Pagination = ({ current, total, to }) => {
  return <Pager size="tiny" pagination>
    <Menu.Item name="Page" />

    {current > 1 && (
      <Menu.Item
        as={Link}
        to={{
          pathname: to,
          search: `?page=${current - 1}`,
        }}
        icon="chevron left"
      />
    )}
    {Range(1, total + 1).map(page => (
      <Menu.Item
        key={page}
        name={page.toString()}
        active={page === current}
        as={Link}
        to={{
          pathname: to,
          search: `?page=${page}`,
        }}
      />
    ))}
    {current < (total) && (
      <Menu.Item
        as={Link}
        to={{
          pathname: to,
          search: `?page=${current + 1}`,
        }}
        icon="chevron right"
      />
    )}
  </Pager>;
};

Pagination['propTypes'] = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
};

export default compose(branch(({ total }) => total < 2, renderNothing), onlyUpdateForPropTypes)(Pagination);
