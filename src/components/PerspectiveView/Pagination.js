import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { pure, branch, renderNothing, compose } from 'recompose';
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

const WINDOW = 5;

const Pagination = ({ current, total, to }) => {
  return (
    <Pager size="tiny" pagination>
      <Menu.Item
        as={Link}
        name="1↢"
        active={current === 1}
        to={{
          pathname: to,
          search: '?page=1',
        }}
      />
      <Menu.Item
        disabled={current <= 1}
        as={Link}
        to={{
          pathname: to,
          search: `?page=${current - 1}`,
        }}
        icon="chevron left"
      />
      {Range(Math.max(1, current - WINDOW), Math.min(current + WINDOW + 1, total)).map(page => (
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
      <Menu.Item
        disabled={current >= total}
        as={Link}
        to={{
          pathname: to,
          search: `?page=${current + 1}`,
        }}
        icon="chevron right"
      />
      <Menu.Item
        as={Link}
        name={`↣${total}`}
        active={current === total}
        to={{
          pathname: to,
          search: `?page=${total}`,
        }}
      />
    </Pager>
  );
};

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  pure
)(Pagination);
