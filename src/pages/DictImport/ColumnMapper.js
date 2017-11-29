import React from 'react';
import { is } from 'immutable';
import { pure } from 'recompose';
import { Popup, Button } from 'semantic-ui-react';

function valueColor(value) {
  if (value === 'keep') {
    return 'green';
  }

  if (value === 'spread') {
    return 'red';
  }

  if (value && value.includes('/')) {
    return 'purple';
  }

  return null;
}

function FieldButton({ text, onClick, value, isSelected }) {
  const color = isSelected ? { color: 'blue' } : {};

  return (
    <Button
      onClick={onClick}
      content={text}
      {...color}
    />
  );
}

function Column({
  spread, name, value, fieldOptions, type, onSetColumnType,
}) {
  const isLink = value && value.includes('/');

  let columnButton = (
    <Button
      className="column-button"
      color={valueColor(value)}
      content={name}
    />
  );

  if (spread) {
    columnButton = React.cloneElement(columnButton, { inverted: true, color: 'red', disabled: true });
  }

  const selectedField = fieldOptions.find(x => is(x.value, type));
  const triggerColor = selectedField ? { color: 'blue' } : {};
  const triggerText = (selectedField && selectedField.text) || 'Field Type';

  let inner;

  if (spread) {
    inner = <Button disabled content={triggerText} {...triggerColor} />;
  }

  if (isLink) {
    inner = <Button disabled content="Relation" />;
  }

  if (!spread && !isLink) {
    const trigger = <Button content={triggerText} {...triggerColor} />;

    inner = (
      <Popup
        trigger={trigger}
        position="bottom center"
        on="click"
      >
        <Popup.Content className="popup-field-type">
          {
            fieldOptions.map(f =>
              <FieldButton
                key={f.key}
                onClick={() => onSetColumnType(f.value)}
                text={f.text}
                isSelected={is(type, f.value)}
              />
            )
          }
        </Popup.Content>
      </Popup>
    );
  }

  return (
    <div className="column-field-type">
      <Button.Group vertical>
        {columnButton}
        {inner}
      </Button.Group>
    </div>
  );
}

function Columns({
  blob, spreads, fieldOptions, columnTypes, onSetColumnType,
}) {
  const blobId = blob.get('id');
  const values = blob.get('values');

  return (
    <div className="blob">
      <b className="blob-name">{blob.get('name')}</b>
      <div className="blob-columns">
        {
          values
            .filter(value => value !== null)
            .map((value, column) =>
              <Column
                key={column}
                name={column}
                value={value}
                type={columnTypes.getIn([blobId, column])}
                onSetColumnType={onSetColumnType(column)}
                fieldOptions={fieldOptions}
              />)
            .toArray()
        }
        {
          spreads.map(spread =>
            <Column
              spread
              key={spread.get('from').join(spread.get('column'))}
              name={spread.get('column')}
              type={columnTypes.getIn([spread.get('from'), spread.get('column')])}
              fieldOptions={fieldOptions}
            />)
        }
      </div>
    </div>
  );
}

function ColumnMapper({
  state, spreads, types, columnTypes, onSetColumnType,
}) {
  const fieldOptions = types
    .sortBy(type => type.get('translation'))
    .reduce(
      (acc, type) => [...acc, {
        key: type.get('id').join('/'),
        value: type.get('id'),
        text: type.get('translation'),
      }],
      []
    );

  return (
    <div className="column-mapper">
      {
        state.map((v, id) =>
          <Columns
            key={id.join('/')}
            blob={v}
            fieldOptions={fieldOptions}
            spreads={spreads.get(id, [])}
            columnTypes={columnTypes}
            onSetColumnType={onSetColumnType(id)}
          />).toArray()
      }
    </div>
  );
}

export default pure(ColumnMapper);
