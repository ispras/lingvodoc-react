import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';

import Column from './Column';

const TableHeader = ({ fields }) =>
  <Table.Header>
    <Table.Row>
      {
        fields.map(field =>
          <Column
            key={`${field.id[0]}/${field.id[1]}`}
            field={field}
          />
        )
      }
    </Table.Row>
  </Table.Header>;

TableHeader.propTypes = {
  fields: PropTypes.array.isRequired,
};

export default onlyUpdateForPropTypes(TableHeader);
