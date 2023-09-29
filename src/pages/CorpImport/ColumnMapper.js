import React, { useContext } from "react";
import { connect } from "react-redux";
import { Button, Dropdown, Popup } from "semantic-ui-react";
import { is } from "immutable";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { openCreateFieldModal } from "ducks/fields";
import TranslationContext from "Layout/TranslationContext";

function valueColor(value) {
  if (value === "base") {
    return "green";
  }

  if (value === "secondary") {
    return "yellow";
  }

  return null;
}

function FieldButton({ text, onClick, isSelected }) {
  const color = isSelected ? { color: "blue" } : {};

  return <Button onClick={onClick} content={text} {...color} />;
}

function Column({ name, value, fieldOptions, type, onSetColumnType, actions }) {
  const getTranslation = useContext(TranslationContext);
  let columnButton = <Button className="column-button" color={valueColor(value)} content={name} />;
  const selectedField = fieldOptions.find(x => is(x.id, type));
  const triggerColor = selectedField ? { color: "blue" } : {};

  /*
   * Without something in the text button can sometimes be not full height, so we in such cases we place
   * zero-width space there.
   */

  const triggerText = selectedField ? selectedField.text || "\u200b" : getTranslation("Field Type");

  let inner;

  const trigger = <Button content={triggerText} {...triggerColor} className="lingvo-column-mapper-selected" />;
  inner = (
    <Popup trigger={trigger} position="bottom center" on="click" className="lingvo-column-mapper-popup">
      <Popup.Header>
        <Button basic content={getTranslation("Create a new field")} onClick={() => actions.openCreateFieldModal(null, true)} />
      </Popup.Header>
      <Dropdown
        style={{ marginTop: "0.5em", marginBottom: "0.25em" }}
        className="main-select lingvo-column-mapper-select"
        search
        selection
        placeholder={`${getTranslation("Field selection")}...`}
        options={fieldOptions}
        value={selectedField && selectedField.value}
        onChange={(e, { value }) => onSetColumnType(fieldOptions[value])}
      />
      <Popup.Content className="popup-field-type">
        {fieldOptions.map(f => (
          <FieldButton key={f.key} onClick={() => onSetColumnType(f.id)} text={f.text} isSelected={is(type, f.id)} />
        ))}
      </Popup.Content>
    </Popup>
  );

  return (
    <div className="column-field-type">
      <Button.Group vertical>
        {columnButton}
        {inner}
      </Button.Group>
    </div>
  );
}

const ColumnWithData = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ openCreateFieldModal }, dispatch)
  }))
)(Column);

function Columns({ blob, index, fieldOptions, columnTypes, onSetColumnType }) {
  const getTranslation = useContext(TranslationContext);
  const blobId = blob.get("id");
  const values = blob.get("values");
  const column = index ? "sentence" : "base sentence";
  const columnIdStr = `${index}:${column}`;
  const value = values.get(columnIdStr);

  return (
    <div className="blob">
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        { value != null && (
          <ColumnWithData
            key={columnIdStr}
            name={getTranslation(column)}
            value={value}
            type={columnTypes.getIn([blobId, columnIdStr])}
            onSetColumnType={onSetColumnType(columnIdStr)}
            fieldOptions={fieldOptions}
          />
        )}
      </div>
    </div>
  );
}

function ColumnMapper({ state, types, columnTypes, onSetColumnType }) {
  const typesSortedFiltered = types
    .sortBy(type => T(type.get("translations").toJS()))
    .filter(type => T(type.get("translations").toJS()).trim() != "");

  const fieldOptions = [];

  for (const type of typesSortedFiltered) {
    const id = type.get("id");
    const idStr = id.join("/");

    fieldOptions.push({
      key: idStr,
      value: idStr,
      id: id,
      text: `${T(type.get("translations").toJS())} (${type.get("data_type")})`
    });

    fieldOptions[idStr] = id;
  }

  let i = 0;

  return (
    <div className="column-mapper">
      {state
        .map((v, id) => (
          <Columns
            key={id.join("/")}
            blob={v}
            index={i++}
            fieldOptions={fieldOptions}
            columnTypes={columnTypes}
            onSetColumnType={onSetColumnType(id)}
          />
        ))
        .toArray()}
    </div>
  );
}

export default ColumnMapper;
