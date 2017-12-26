import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { find, isEqual } from 'lodash';
import { Button, Input, Checkbox } from 'semantic-ui-react';

import Entities from './index';

const TextEntityContent = onlyUpdateForKeys(['entity'])(({
  entity, mode, publish, accept, remove,
}) => {
  let control = null;
  switch (mode) {
    case 'edit':
      return (
        <div>
          {entity.content}
          <Button.Group basic icon size="mini">
            <Button icon="edit" />
            <Button icon="remove" onClick={() => remove(entity)} />
          </Button.Group>
        </div>
      );
    case 'publish':
      // control = entity.published ? (
      //   <Button icon="remove" onClick={() => publish(entity, false)} />
      // ) : (
      //   <Button icon="checkmark" onClick={() => publish(entity, true)} />
      // );
      // return (
      //   <div>
      //     {entity.content}
      //     <Button.Group basic icon size="mini">
      //       {control}
      //     </Button.Group>
      //   </div>
      // );
      return (
        <div>
          {entity.content}
          <Checkbox
            size="tiny"
            defaultChecked={entity.published}
            onChange={(e, { checked }) => publish(entity, checked)}
          />
        </div>
      );

    case 'view':
      return entity.content;
    case 'contributions':
      control = entity.accepted ? (
        <Button icon="remove" onClick={() => accept(entity, false)} />
      ) : (
        <Button icon="checkmark" onClick={() => accept(entity, true)} />
      );
      return (
        <Button.Group basic icon size="mini">
          <Button content={entity.content} />
          {control}
        </Button.Group>
      );
    default:
      return null;
  }
});

const Text = onlyUpdateForKeys(['entry', 'entity'])((props) => {
  const {
    perspectiveId,
    column,
    columns,
    entry,
    entity,
    mode,
    entitiesMode,
    as: Component,
    className,
    publish,
    accept,
    remove,
  } = props;

  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      <TextEntityContent entity={entity} mode={mode} publish={publish} accept={accept} remove={remove} />
      {subColumn && (
        <Entities
          perspectiveId={perspectiveId}
          column={subColumn}
          columns={columns}
          entry={entry}
          mode={mode}
          entitiesMode={entitiesMode}
          publish={publish}
          remove={remove}
          accept={accept}
        />
      )}
    </Component>
  );
});

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
  publish: PropTypes.func,
  accept: PropTypes.func,
  remove: PropTypes.func,
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
}

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
