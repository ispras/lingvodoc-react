import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { Table } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';

const Cell = (props) => {
  const { entities, column, columns, mode } = props;
  return (
    <Table.Cell className="entity gentium">
      <Entities
        column={column}
        columns={columns}
        entities={entities}
        mode={mode}
      />
    </Table.Cell>
  );
};

Cell.propTypes = {
  entities: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

export default pure(Cell);
