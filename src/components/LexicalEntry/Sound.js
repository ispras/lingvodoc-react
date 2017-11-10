import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Popup } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';
import { openPlayer } from 'ducks/player';
import Entities from './index';


function content1(c) {
  const MAX_CONTENT_LENGTH = 12;
  if (c.length <= MAX_CONTENT_LENGTH) {
    return c;
  }
  return `${c.substr(c.lastIndexOf('/') + 1).substr(0, MAX_CONTENT_LENGTH)}...`;
}

const Sound = (props) => {
  const {
    perspectiveId,
    column,
    columns,
    entity: { content },
    entry,
    mode,
    entitiesMode,
    as: Component = 'li',
    className = '',
    actions,
  } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Popup trigger={<Button content={content1(content)} />} />
        <Button icon="play" onClick={() => actions.openPlayer(content)} />
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
  perspectiveId: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  actions: PropTypes.object.isRequired,
};

Sound.defaultProps = {
  as: 'li',
  className: '',
};

Sound.Edit = ({ onSave }) => <input type="file" multiple="false" onChange={e => onSave(e.target.files[0])} />;

Sound.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Sound.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

const mapStateToProps = state => ({
  ...state,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openPlayer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sound);
