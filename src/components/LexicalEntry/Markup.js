import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';

import Entities from './index';

function single(mode) {
  switch (mode) {
    default:
      return null;
  }
}

function all(mode) {
  switch (mode) {
    default:
      return null;
  }
}

const Markup = (props) => {
  const { column, columns, entity, entry, mode, as: Component = 'li', className = '' } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));
  const content = entity.content;

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Button content={content.substr(content.lastIndexOf('/') + 1)} />
      </Button.Group>
      {subColumn && <Entities column={subColumn} columns={columns} entry={entry} mode={mode} />}
    </Component>
  );
};

Markup.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
};

Markup.Edit = () => <input type="file" multiple="false" onChange={e => this.props.onSave(e.target.files[0])} />;


Markup.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Markup.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

export default Markup;

