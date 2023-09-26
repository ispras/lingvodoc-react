import React, { useContext } from "react";
import { Button, Checkbox, Dropdown, Grid, Icon, Popup } from "semantic-ui-react";
import { pure } from "recompose";

import TranslationContext from "Layout/TranslationContext";

function valueColor(value) {
  if (value === "base") {
    return "green";
  }

  if (value === "secondary") {
    return "purple";
  }

  return null;
}

function Column({ idStr, name, linkOptions, value, onChange }) {
  const getTranslation = useContext(TranslationContext);

  const trigger = (
    <Button size="tiny" className="column-button" color={valueColor(value)}>
      {name}
    </Button>
  );

  const selectValue = value && value.includes("/") ? value : null;

  return (
    <Popup className="column-popup" trigger={trigger} position="bottom center" on="click" style={{}} flowing hoverable>
      <Grid centered divided columns={3}>
        <Grid.Column textAlign="center">
          <Button
            color={value === "base" ? "green" : null}
            onClick={() => onChange(idStr, value === "base" ? null : "base", value)}
          >
            {value === "base" ? getTranslation("Base") : getTranslation("Secondary")}
          </Button>
        </Grid.Column>
      </Grid>
    </Popup>
  );
}

function Columns({ blob, index, linkOptions, onUpdateColumn, onToggleColumn, onDelete }) {
  const values = blob.get("values");
  const idStr = `${index}:sentence`;

  return (
    <div className="blob">
      <Button negative icon="trash" size="tiny" onClick={() => onDelete(blob.get("id"))} />
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        <Column
          key={idStr}
          idStr={idStr}
          name={'sentence'}
          linkOptions={linkOptions.filter(x => x.key !== blob.get("id").join("/"))}
          onChange={onUpdateColumn}
          value={values.get(idStr)}
        />
      </div>
      <Checkbox className="blob-checkbox" onClick={onToggleColumn} checked={blob.get("add")} />
    </div>
  );
}

function Linker({ blobs, state, onSelect, onDelete, onUpdateColumn, onToggleColumn }) {
  const getTranslation = useContext(TranslationContext);

  const stateOptions = blobs.reduce(
    (acc, blob) => [
      ...acc,
      {
        key: blob.get("id").join("/"),
        value: blob.get("id").join("/"),
        text: blob.get("name")
      }
    ],
    []
  );

  const first = state.first();

  const selected = first ? first.get("id").join("/") : null;

  function onChange(event, data) {
    onSelect(data.value.split("/").map(x => parseInt(x, 10)));
  }

  return (
    <div className="linker">
      <Dropdown
        className="main-select"
        search
        selection
        placeholder={getTranslation("Base blob")}
        options={stateOptions}
        value={selected}
        onChange={onChange}
      />
      {state
        .map((v, id) => (
          <Columns
            key={id.join("/")}
            blob={v}
            linkOptions={stateOptions}
            onUpdateColumn={onUpdateColumn(id)}
            onToggleColumn={onToggleColumn(id)}
            onDelete={onDelete}
          />
        ))
        .toArray()}
    </div>
  );
}

export default pure(Linker);
