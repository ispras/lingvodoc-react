import React from 'react';
import { pure } from 'recompose';
import { Dropdown, Popup, Button } from 'semantic-ui-react';

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

function Column({ spread, name, value, fieldOptions }) {
  let button = (
    <Button
      size="tiny"
      className="column-button"
      color={valueColor(value)}
    >
      {name}
    </Button>
  );

  if (spread) {
    button = React.cloneElement(button, { inverted: true, color: 'red', disabled: true });
  }

  return (
    <div className="column-field-type">
      {button}
      <Popup
        trigger={<Button>Field Type</Button>}
        position="bottom center"
        on="click"
      >
        <Popup.Content className="popup-field-type">
          {
            fieldOptions.map(f =>
              <Button key={f.key}>{f.text}</Button>)
          }
        </Popup.Content>
      </Popup>
    </div>
  );
}

function Columns({ blob, spreads, fieldOptions }) {
  const values = blob.get('values');

  return (
    <div className="blob">
      <b className="blob-name">{blob.get('name')}</b>
      <div className="blob-columns">
        {
          values.map((value, column) =>
            <Column
              key={column}
              name={column}
              value={value}
              fieldOptions={fieldOptions}
            />
          ).toArray()
        }
        {
          spreads.map(spread =>
            <Column
              spread
              key={spread.get('from').join(spread.get('column'))}
              name={spread.get('column')}
              fieldOptions={fieldOptions}
            />
          )
        }
      </div>
    </div>
  );
}

function ColumnMapper({ state, spreads, types }) {
  const fieldOptions = types.reduce(
    (acc, blob) => [...acc, {
      key: blob.get('id').join('/'),
      value: blob.get('id').join('/'),
      text: blob.get('translation'),
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
          />
        ).toArray()
      }
    </div>
  );
}

export default pure(ColumnMapper);
