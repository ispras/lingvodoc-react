import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';

const Column = ({ field }) =>
  <Table.HeaderCell>
    { field.translation }
  </Table.HeaderCell>;

Column.propTypes = {
  field: PropTypes.shape({
    translation: PropTypes.string.isRequired,
  }).isRequired,
};

export default onlyUpdateForPropTypes(Column);
