import React from 'react';
import PropTypes from 'prop-types';
import { pure, onlyUpdateForKeys } from 'recompose';
import { Table } from 'semantic-ui-react';
import Entities from 'components/LexicalEntry';
import 'styles/main.scss';

const Cell = ({
  perspectiveId,
  entry,
  column,
  columns,
  mode,
  entitiesMode,
  disabled,
}) => {

  return (
    <Table.Cell className="entity gentium">
      <Entities
        perspectiveId={perspectiveId}
        column={column}
        columns={columns}
        entry={entry}
        mode={mode}
        entitiesMode={entitiesMode}
        disabled={disabled}
      />
    </Table.Cell>
  );
};

Cell.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
};

export default onlyUpdateForKeys(['perspectiveId', 'entry', 'mode', 'disabled'])(Cell);
