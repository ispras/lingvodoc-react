import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { pure, branch, renderNothing, compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';

const Item = ({
  num,
  disabled,
  active,
  text,
  icon,
  to,
}) => {
  const extraProps = {};
  if (icon) {
    extraProps.icon = icon;
  } else {
    extraProps.name = text || num.toString();
  }

  return (
    <Menu.Item
      as={Link}
      active={active}
      disabled={disabled}
      to={{
        pathname: to,
        search: `?page=${num}`,
      }}
      {...extraProps}
    />
  );
};

Item.propTypes = {
  num: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  text: PropTypes.string,
  icon: PropTypes.string,
  to: PropTypes.string.isRequired,
};

Item.defaultProps = {
  disabled: false,
  active: false,
  text: null,
  icon: null,
};

const Pager = styled(Menu)`
  position: fixed;
  bottom: 10px;

  &:hover {
    opacity: 1;
  }
`;

const WINDOW = 5;

const Pagination = ({ current, total, to }) =>
  <Pager size="tiny" pagination>
    <Item num={1} text="1↢" active={current === 1} to={to} />
    <Item num={current - 1} icon="chevron left" disabled={current <= 1} to={to} />
    {Range(Math.max(1, current - WINDOW), Math.min(current + WINDOW + 1, total)).map(page => (
      <Item
        key={page}
        num={page}
        active={page === current}
        to={to}
      />
    ))}
    <Item num={current + 1} icon="chevron right" disabled={current >= total} to={to} />
    <Item num={total} text={`↣${total}`} active={current === total} to={to} />
  </Pager>;

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  pure
)(Pagination);
