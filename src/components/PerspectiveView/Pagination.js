import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'immutable';
import { onlyUpdateForPropTypes } from 'recompose';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

const Pagination = ({ current, total, to }) =>
  total > 1 && <Menu pagination>
    {
      Range(1, total + 1).map(page =>
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
      )
    }
  </Menu>;

Pagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
};

export default onlyUpdateForPropTypes(Pagination);
