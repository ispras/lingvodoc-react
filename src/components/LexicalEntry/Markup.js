import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Popup } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';
import { openViewer } from 'ducks/markup';

import Entities from './index';

function content1(c) {
  const MAX_CONTENT_LENGTH = 12;
  if (c.length <= MAX_CONTENT_LENGTH) {
    return c;
  }
  return `${c.substr(c.lastIndexOf('/') + 1).substr(0, MAX_CONTENT_LENGTH)}...`;
}

const Markup = (props) => {
  const {
    column, columns, entity, parentEntity, entry, mode, as: Component = 'li', className = '', actions,
  } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));
  const { content } = entity;

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Popup trigger={<Button content={content1(content)} />} />
        <Button icon="table" onClick={() => actions.openViewer(parentEntity, entity)} />
      </Button.Group>
      {subColumn && <Entities column={subColumn} columns={columns} entry={entry} parentEntity={entity} mode={mode} />}
    </Component>
  );
};

Markup.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  parentEntity: PropTypes.object,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  actions: PropTypes.object.isRequired,
};

Markup.defaultProps = {
  parentEntity: null,
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

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openViewer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Markup);