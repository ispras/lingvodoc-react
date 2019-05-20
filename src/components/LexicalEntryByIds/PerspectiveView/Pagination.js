import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { pure, branch, renderNothing, compose } from 'recompose';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';

const Item = ({
  num,
  disabled,
  active,
  text,
  icon,
  changePage,
}) => {
  const extraProps = {};
  if (icon) {
    extraProps.icon = icon;
  } else {
    extraProps.name = text || num.toString();
  }

  return (
    <Menu.Item
      active={active}
      disabled={disabled}
      onClick={changePage(num)}
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
  changePage: PropTypes.func.isRequired,
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

const Pagination = ({ current, total, changePage }) =>
  <Pager size="tiny" pagination>
    <Item num={1} text="1↢" active={current === 1} changePage={changePage} />
    <Item num={current - 1} icon="chevron left" disabled={current <= 1} changePage={changePage} />
    {Range(Math.max(1, current - WINDOW), Math.min(current + WINDOW + 1, total)).map(page => (
      <Item
        key={page}
        num={page}
        active={page === current}
        changePage={changePage}
      />
    ))}
    <Item num={current + 1} icon="chevron right" disabled={current >= total} changePage={changePage} />
    <Item num={total} text={`↣${total}`} active={current === total} changePage={changePage} />
  </Pager>;

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  pure
)(Pagination);
