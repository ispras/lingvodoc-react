import React from 'react';
import PropTypes from 'prop-types';
import { find, isEqual } from 'lodash';
import { Button, Input } from 'semantic-ui-react';

import Entities from './index';

function getContent(entity, mode) {
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
  const {
    perspectiveId, column, columns, entry, entity, mode, entitiesMode, as: Component, className,
  } = props;

  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      {getContent(entity, mode)}
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

Text.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
};

Text.defaultProps = {
  as: 'li',
  className: '',
};

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onChange(event, target) {
    this.setState({ content: target.value });
  }

  onKeyPress(e) {
    const { onSave } = this.props;
    if (e.key === 'Enter') {
      onSave(this.state.content);
    }
  }

  onKeyDown(e) {
    const { onCancel } = this.props;
    if (e.keyCode === 27) {
      onCancel();
    }
  }

  render() {
    const { onSave, onCancel } = this.props;
    return (
      <Input
        size="mini"
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        onKeyDown={this.onKeyDown}
        action={
          <Button.Group basic size="mini">
            <Button icon="save" onClick={() => onSave(this.state.content)} />
            <Button icon="remove" onClick={onCancel} />
          </Button.Group>
        }
      />
    );
  }
};

Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {},
};

Text.Edit = Edit;

export default Text;
