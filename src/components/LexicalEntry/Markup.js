import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';

import Entities from './index';

const Markup = (props) => {
  const {
    column, columns, entity: { content }, entry, mode, as: Component = 'li', className = '',
  } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Popup trigger={<Button content={content1(content)} />} />
        <Button icon="play" onClick={() => actions.openPlayer(content)} />
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

Markup.defaultProps = {
  as: 'li',
  className: '',
};

Markup.Edit = ({ onSave }) => <input type="file" multiple="false" onChange={e => onSave(e.target.files[0])} />;

Markup.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Markup.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

export default Markup;
