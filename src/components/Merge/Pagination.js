import React, { useContext } from "react";
import { Menu } from "semantic-ui-react";
import { Range } from "immutable";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForPropTypes, renderNothing } from "recompose";
import styled from "styled-components";

import TranslationContext from "Layout/TranslationContext";

const Pager = styled(Menu)`
  position: fixed;
  bottom: 10px;
  opacity: 0.2;
  transition: opacity 0.2s linear;
  &:hover {
    opacity: 1;
  }
`;

const Pagination = ({ current, total, changePage }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <Pager size="tiny" pagination>
      <Menu.Item name={getTranslation("Page")} />

      {current > 1 && <Menu.Item onClick={() => changePage(current - 1)} icon="chevron left" />}
      {Range(1, total).map(page => (
        <Menu.Item key={page} name={page.toString()} active={page === current} onClick={() => changePage(page)} />
      ))}
      {current < total - 1 && <Menu.Item onClick={() => changePage(current + 1)} icon="chevron right" />}
    </Pager>
  );
};

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired
};

export default compose(
  branch(({ total }) => total < 2, renderNothing),
  onlyUpdateForPropTypes
)(Pagination);
