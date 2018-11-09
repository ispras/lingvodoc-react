import React from 'react';
import { is } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Popup, Button } from 'semantic-ui-react';
import { openCreateFieldModal } from 'ducks/fields';
import CreateFieldModal from 'components/CreateFieldModal';
import { getTranslation } from 'api/i18n';

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

function FieldButton({
  text, onClick, isSelected,
}) {
  const color = isSelected ? { color: 'blue' } : {};

  return <Button onClick={onClick} content={text} {...color} />;
}

function Column({
  spread, name, value, fieldOptions, type, onSetColumnType, actions,
}) {
  const isLink = value && value.includes('/');

  let columnButton = <Button className="column-button" color={valueColor(value)} content={name} />;

  if (spread) {
    columnButton = React.cloneElement(columnButton, { inverted: true, color: 'red', disabled: true });
  }

  const selectedField = fieldOptions.find(x => is(x.value, type));
  const triggerColor = selectedField ? { color: 'blue' } : {};
  const triggerText = (selectedField && selectedField.text) || getTranslation('Field Type');

  let inner;

  if (spread) {
    inner = <Button disabled content={triggerText} {...triggerColor} />;
  }

  if (isLink) {
    inner = <Button disabled content={getTranslation("Relation")} />;
  }

  if (!spread && !isLink) {
    const trigger = <Button content={triggerText} {...triggerColor} />;

    inner = (
      <Popup trigger={trigger} position="bottom center" on="click">
        <Popup.Header>
          <Button basic content={getTranslation("Create a new field")} onClick={actions.openCreateFieldModal} />
        </Popup.Header>
        <Popup.Content className="popup-field-type">
          {fieldOptions.map(f => (
            <FieldButton
              key={f.key}
              onClick={() => onSetColumnType(f.value)}
              text={f.text}
              isSelected={is(type, f.value)}
            />
          ))}
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

const ColumnWithData = compose(connect(null, dispatch => ({
  actions: bindActionCreators({ openCreateFieldModal }, dispatch),
})))(Column);

function Columns({
  blob, spreads, fieldOptions, columnTypes, onSetColumnType,
}) {
  const blobId = blob.get('id');
  const values = blob.get('values');

  return (
    <div className="blob">
      <b className="blob-name">{blob.get('name')}</b>
      <div className="blob-columns">
        {values
          .filter(value => value !== null)
          .map((value, column) => (
            <ColumnWithData
              key={column}
              name={column}
              value={value}
              type={columnTypes.getIn([blobId, column])}
              onSetColumnType={onSetColumnType(column)}
              fieldOptions={fieldOptions}
            />
          ))
          .toArray()}
        {spreads.map(spread => (
          <ColumnWithData
            spread
            key={spread.get('from').join(spread.get('column'))}
            name={spread.get('column')}
            type={columnTypes.getIn([spread.get('from'), spread.get('column')])}
            fieldOptions={fieldOptions}
          />
        ))}
      </div>
    </div>
  );
}

function ColumnMapper({
  state, spreads, types, columnTypes, onSetColumnType,
}) {
  const fieldOptions = types.sortBy(type => type.get('translation')).reduce(
    (acc, type) => [
      ...acc,
      {
        key: type.get('id').join('/'),
        value: type.get('id'),
        text: type.get('translation'),
      },
    ],
    []
  );

  return (
    <div className="column-mapper">
      {state
        .map((v, id) => (
          <Columns
            key={id.join('/')}
            blob={v}
            fieldOptions={fieldOptions}
            spreads={spreads.get(id, [])}
            columnTypes={columnTypes}
            onSetColumnType={onSetColumnType(id)}
          />
        ))
        .toArray()}
      <CreateFieldModal />
    </div>
  );
}

export default ColumnMapper;
