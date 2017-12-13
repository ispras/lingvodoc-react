import React from 'react';
import { pure } from 'recompose';
import { Dropdown, Button, Checkbox, Popup, Grid } from 'semantic-ui-react';

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

function Column({
  spread, name, linkOptions, value, onChange,
}) {
  const trigger = (
    <Button size="tiny" className="column-button" color={valueColor(value)}>
      {name}
    </Button>
  );

  if (spread) {
    return React.cloneElement(trigger, { inverted: true, color: 'red', disabled: true });
  }

  const selectValue = value && value.includes('/') ? value : null;

  return (
    <Popup className="column-popup" trigger={trigger} position="bottom center" on="click" style={{}} flowing hoverable>
      <Grid centered divided columns={3}>
        <Grid.Column textAlign="center">
          <Button
            color={value === 'keep' ? 'green' : null}
            onClick={() => onChange(name, value === 'keep' ? null : 'keep', value)}
          >
            Keep
          </Button>
        </Grid.Column>
        <Grid.Column textAlign="center">
          <Dropdown
            button
            placeholder="Link"
            icon={false}
            options={linkOptions}
            value={selectValue}
            onChange={(e, data) => onChange(name, data.value, value)}
          />
        </Grid.Column>
        <Grid.Column textAlign="center">
          <Button
            color={value === 'spread' ? 'red' : null}
            onClick={() => onChange(name, value === 'spread' ? null : 'spread', value)}
          >
            Spread
          </Button>
        </Grid.Column>
      </Grid>
    </Popup>
  );
}

function Columns({
  blob, spreads, linkOptions, onUpdateColumn, onToggleColumn,
}) {
  const columns = blob.getIn(['additional_metadata', 'starling_fields']);
  const values = blob.get('values');

  return (
    <div className="blob">
      <b className="blob-name">{blob.get('name')}</b>
      <div className="blob-columns">
        {columns.map(column => (
          <Column
            key={column}
            name={column}
            linkOptions={linkOptions.filter(x => x.key !== blob.get('id').join('/'))}
            onChange={onUpdateColumn}
            value={values.get(column)}
          />
        ))}
        {spreads.map(spread => (
          <Column spread key={spread.get('from').join(spread.get('column'))} name={spread.get('column')} />
        ))}
      </div>
      <Checkbox className="blob-checkbox" onClick={onToggleColumn} checked={blob.get('add')} />
    </div>
  );
}

function Linker({
  blobs, state, spreads, onSelect, onUpdateColumn, onToggleColumn,
}) {
  const stateOptions = blobs.reduce(
    (acc, blob) => [
      ...acc,
      {
        key: blob.get('id').join('/'),
        value: blob.get('id').join('/'),
        text: blob.get('name'),
      },
    ],
    []
  );

  const first = state.first();

  const selected = first ? first.get('id').join('/') : null;

  function onChange(event, data) {
    onSelect(data.value.split('/').map(x => parseInt(x, 10)));
  }

  return (
    <div className="linker">
      <Dropdown
        className="main-select"
        search
        selection
        placeholder="Base blob"
        options={stateOptions}
        value={selected}
        onChange={onChange}
      />
      {state
        .map((v, id) => (
          <Columns
            key={id.join('/')}
            blob={v}
            linkOptions={stateOptions}
            spreads={spreads.get(id, [])}
            onUpdateColumn={onUpdateColumn(id)}
            onToggleColumn={onToggleColumn(id)}
          />
        ))
        .toArray()}
    </div>
  );
}

export default pure(Linker);
