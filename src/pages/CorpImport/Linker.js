import React, { useContext, useEffect } from "react";
import { Button, Dropdown, Checkbox } from "semantic-ui-react";
import { pure } from "recompose";

import TranslationContext from "Layout/TranslationContext";

function Columns({ blob, index, mode, onDelete, onUpdateColumn }) {
  const getTranslation = useContext(TranslationContext);
  const color = (mode === 'json') ? "blue" : index ? "yellow" : "green";
  const name = (mode === 'json') ? "both sides" : index ? "sentence" : "base sentence";
  // We store 'dedash' flag in 'sentence' value because its value has no matter anywhere else
  const dedash = blob.getIn(["values", "sentence"], null) === "dedash";
  useEffect(() => {
    // On json format we have both sentences in one file,
    // so to_sentence is already selected, we store a random value there
    // to get 'Next Step' button active at once
    if (mode === 'json') {
      onUpdateColumn("to_sentence", "json_mode");
    }
  }, []);

  return (
    <div className="blob blob_corp">
      <Button negative icon="trash" size="tiny" onClick={() => onDelete(blob.get("id"))} />
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        <Button size="tiny" className="column-button" color={color}>
          {getTranslation(name)}
        </Button>
      </div>
      { !index && (mode === 'txt' || mode === 'marker') && (
        <Checkbox className="blob-checkbox"
          label={getTranslation("Hide dashes")}
          onClick={() => onUpdateColumn("sentence", dedash ? mode : "dedash")}
          checked={dedash} />
      ) || <div className="blob-checkbox" />}
    </div>
  );
}

function Linker({ blobs, state, onSelect, onSetMarked, onDelete, onUpdateColumn }) {
  const getTranslation = useContext(TranslationContext);

  const first = state.first();
  const firstId = first ? first.get("id") : null;
  const selected = firstId ? firstId.join("/") : null;
  const mode = first ? first.get("data_type") : null;
  const marked = (mode === 'marked');

  // Filtering stored files by type on mode current value
  // Note: 'marked' mode value means 'txt' files type
  const stateOptions = (
    blobs.filter(blob => !mode || blob.get("data_type") === (marked ? 'txt' : mode))
  ).reduce((acc, blob) =>
    [ ...acc,
      {
        key: blob.get("id").join("/"),
        value: blob.get("id").join("/"),
        text: blob.get("name")
      }
    ], []
  );

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
            mode={mode}
            onDelete={onDelete}
            onUpdateColumn={onUpdateColumn(id)}
          />
        ))
        .toArray()
      }
      { (mode === 'txt' || mode === 'marked') && (
        <div className="container-gray">
          <Checkbox className="blob-checkbox"
            label={getTranslation(ff)}
            onClick={onSetMarked}
            checked={marked}
          />
        </div>
      )}
    </div>
  );
}

export default pure(Linker);
