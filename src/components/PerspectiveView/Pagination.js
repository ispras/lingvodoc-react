import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { Range } from "immutable";
import PropTypes from "prop-types";
import { branch, compose, pure, renderNothing } from "recompose";
import styled from "styled-components";

import smoothScroll from "utils/smoothscroll";

const Item = ({ num, disabled, active, text, icon, checkEntries, resetCheckedColumn, resetCheckedAll }) => {
  const extraProps = {};
  if (icon) {
    extraProps.icon = icon;
  } else {
    extraProps.name = text || num.toString();
  }

  const handleItemClick = () => {
    const scrollContainer = document.querySelector(".lingvo-scrolling-tab__table");
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
        pathname: window.location.pathname,
        search: `?page=${num}`
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
  checkEntries: PropTypes.bool,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func
};

Item.defaultProps = {
  disabled: false,
  active: false,
  text: null,
  icon: null,
  checkEntries: false,
  resetCheckedColumn: () => {},
  resetCheckedAll: () => {}
};

const Pager = styled(Menu)`
  position: fixed;
  bottom: 10px;

  &:hover {
    opacity: 1;
  }
`;

const WINDOW = 5;

const Pagination = ({ current, total, checkEntries, resetCheckedColumn, resetCheckedAll }) => (
  <Pager size="tiny" pagination>
    <Item
      num={1}
      text="1↢"
      active={current === 1}
      checkEntries={checkEntries}
      resetCheckedColumn={resetCheckedColumn}
      resetCheckedAll={resetCheckedAll}
    />
    <Item
      num={current - 1}
      icon="chevron left"
      disabled={current <= 1}
      checkEntries={checkEntries}
      resetCheckedColumn={resetCheckedColumn}
      resetCheckedAll={resetCheckedAll}
    />
    {Range(Math.max(1, current - WINDOW), Math.min(current + WINDOW + 1, total)).map(page => (
      <Item
        key={page}
        num={page}
        active={page === current}
        checkEntries={checkEntries}
        resetCheckedColumn={resetCheckedColumn}
        resetCheckedAll={resetCheckedAll}
      />
    ))}
    <Item
      num={current + 1}
      icon="chevron right"
      disabled={current >= total}
      checkEntries={checkEntries}
      resetCheckedColumn={resetCheckedColumn}
      resetCheckedAll={resetCheckedAll}
    />
    <Item
      num={total}
      text={`↣${total}`}
      active={current === total}
      checkEntries={checkEntries}
      resetCheckedColumn={resetCheckedColumn}
      resetCheckedAll={resetCheckedAll}
    />
  </Pager>
);

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  checkEntries: PropTypes.bool,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  pure
)(Pagination);
