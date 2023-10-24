import React, { useContext, useEffect } from "react";
import { Button, Dropdown, Checkbox } from "semantic-ui-react";
import { pure } from "recompose";

import TranslationContext from "Layout/TranslationContext";

function Columns({ blob, index, onDelete, onUpdateColumn }) {
  const getTranslation = useContext(TranslationContext);
  const color = index ? "yellow" : "green";
  const name = index ? "sentence" : "base sentence";
  useEffect(() => { onUpdateColumn("sentence", "dash") }, []);
  const value = blob.getIn(["values", "sentence"], "dash");

  return (
    <div className="blob blob_corp">
      { !index && (
        <Checkbox className="blob-checkbox"
          onClick={() => onUpdateColumn("sentence", value === "dash" ? "dedash" : "dash", value)}
          checked={value === "dedash"} />
      )}
      <Button negative icon="trash" size="tiny" onClick={() => onDelete(blob.get("id"))} />
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        <Button size="tiny" className="column-button" color={color}>
          {getTranslation(name)}
        </Button>
      </div>
    </div>
  );
}

function Linker({ blobs, state, onSelect, onDelete, onUpdateColumn }) {
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

  let i = 0;

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
            index={i++}
            onDelete={onDelete}
            onUpdateColumn={onUpdateColumn(id)}
          />
        ))
        .toArray()}
    </div>
  );
}

export default pure(Linker);
