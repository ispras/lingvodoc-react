import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { Button } from 'semantic-ui-react';

import Entities from './index';

function content(mode, entity) {
  let control = null;
  switch (mode) {
    case 'edit':
      return (
        <Button.Group basic icon size="mini">
          <Button content={entity.content} />
          <Button icon="remove" />
        </Button.Group>
      );
    case 'publish':
      control = entity.published ? <Button icon="remove" /> : <Button icon="checkmark" />;
      return (
        <Button.Group basic icon size="mini">
          <Button content={entity.content} />
          {control}
        </Button.Group>
      );
    case 'view':
      return entity.content;
    case 'contributions':
      return entity.content;
    default:
      return null;
  }
}

const Text = (props) => {
  const { column, columns, entity, entities, mode, as: Component = 'li', className = '' } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      {content(mode, entity)}
      {subColumn && <Entities column={subColumn} columns={columns} entities={entities} mode={mode} />}
    </Component>
  );
};

Text.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entity: PropTypes.object.isRequired,
  entities: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
};

export default Text;
