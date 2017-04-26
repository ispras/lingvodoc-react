import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';

import LexicalEntry from 'components/LexicalEntry';

const Row = ({ entry, columns, mode }) =>
  <Table.Row>
    {
      columns.map(({ key, dataType }) =>
        <LexicalEntry
          key={key}
          as={Table.Cell}
          mode={mode}
          dataType={dataType}
          entry={entry.contains[key]}
        />
      )
    }
  </Table.Row>;

Row.propTypes = {
  entry: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

export default onlyUpdateForPropTypes(Row);
