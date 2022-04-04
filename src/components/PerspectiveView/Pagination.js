import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { pure, branch, renderNothing, compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import styled from 'styled-components';

import smoothScroll from 'utils/smoothscroll';

const Item = ({
  num,
  disabled,
  active,
  text,
  icon,
  to,
  checkEntries,
  resetCheckedColumn,
  resetCheckedAll,
}) => {
  const extraProps = {};
  if (icon) {
    extraProps.icon = icon;
  } else {
    extraProps.name = text || num.toString();
  }

  const handleItemClick = () => {
    const scrollContainer = document.querySelector('.lingvo-scrolling-tab__table');
    smoothScroll(0, 0, null, scrollContainer);

    if (checkEntries) {
      resetCheckedColumn();
      resetCheckedAll();
    }

  };

  return (
    <Menu.Item
      as={Link}
      active={active}
      disabled={disabled}
      onClick={handleItemClick}
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
  checkEntries: PropTypes.bool,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
};

Item.defaultProps = {
  disabled: false,
  active: false,
  text: null,
  icon: null,
  checkEntries: false,
  resetCheckedColumn: () => {},
  resetCheckedAll: () => {},
};

const Pager = styled(Menu)`
  position: fixed;
  bottom: 10px;

  &:hover {
    opacity: 1;
  }
`;

const WINDOW = 5;

const Pagination = ({
  current, 
  total, 
  to,
  checkEntries,
  resetCheckedColumn,
  resetCheckedAll,
}) =>
  <Pager size="tiny" pagination>
    <Item num={1} text="1↢" active={current === 1} to={to} 
      checkEntries={checkEntries} 
      resetCheckedColumn={resetCheckedColumn} 
      resetCheckedAll={resetCheckedAll} 
    />
    <Item num={current - 1} icon="chevron left" disabled={current <= 1} to={to} 
      checkEntries={checkEntries} 
      resetCheckedColumn={resetCheckedColumn} 
      resetCheckedAll={resetCheckedAll} 
    />
    {Range(Math.max(1, current - WINDOW), Math.min(current + WINDOW + 1, total)).map(page => (
      <Item
        key={page}
        num={page}
        active={page === current}
        to={to}
        checkEntries={checkEntries} 
        resetCheckedColumn={resetCheckedColumn} 
        resetCheckedAll={resetCheckedAll} 
      />
    ))}
    <Item num={current + 1} icon="chevron right" disabled={current >= total} to={to} 
      checkEntries={checkEntries} 
      resetCheckedColumn={resetCheckedColumn} 
      resetCheckedAll={resetCheckedAll} 
    />
    <Item num={total} text={`↣${total}`} active={current === total} to={to} 
      checkEntries={checkEntries} 
      resetCheckedColumn={resetCheckedColumn} 
      resetCheckedAll={resetCheckedAll} 
    />
  </Pager>;

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
  checkEntries: PropTypes.bool,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  pure
)(Pagination);
