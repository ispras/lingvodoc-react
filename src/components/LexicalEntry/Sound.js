import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';
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

function content1(c) {
  const MAX_CONTENT_LENGTH = 12;
  if (c.length <= MAX_CONTENT_LENGTH) {
    return c;
  }
  return `${c.substr(c.lastIndexOf('/') + 1).substr(0, MAX_CONTENT_LENGTH)}...`;
}

const Sound = (props) => {
  const { perspectiveId, column, columns, entity, entry, mode, entitiesMode, as: Component = 'li', className = '' } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));
  const content = entity.content;

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Popup trigger={<Button content={content1(content)} />} content={content} />
        <Button icon="play" />
      </Button.Group>

      {subColumn && (
        <Entities
          perspectiveId={perspectiveId}
          column={subColumn}
          columns={columns}
          entry={entry}
          mode={mode}
          entitiesMode={entitiesMode}
        />
      )}
    </Component>
  );
};

Sound.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
};

Sound.Edit = () => <input type="file" multiple="false" onChange={e => this.props.onSave(e.target.files[0])} />;


Sound.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Sound.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

export default Sound;
