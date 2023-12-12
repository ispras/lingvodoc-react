import React, { useContext } from "react";
import { connect } from "react-redux";
import { Button, Dropdown, Popup } from "semantic-ui-react";
import { is } from "immutable";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { openCreateFieldModal } from "ducks/fields";
import TranslationContext from "Layout/TranslationContext";

function FieldButton({ text, onClick, isSelected }) {
  const color = isSelected ? { color: "blue" } : {};

  return <Button onClick={onClick} content={text} {...color} />;
}

function Column({ index, fieldOptions, type, onSetColumnType, actions }) {
  const getTranslation = useContext(TranslationContext);
  const name = index ? "sentence" : "base sentence";
  const color = index ? "yellow" : "green";
  const columnButton = <Button className="column-button" color={color} content={getTranslation(name)} />;
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

  return (
    <div className="blob">
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        <ColumnWithData
          key={index}
          index={index}
          type={columnTypes.getIn([blobId, "sentence"])}
          onSetColumnType={onSetColumnType("sentence")}
          fieldOptions={fieldOptions}
        />
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
      text: `${T(type.get("translations").toJS())} (${type.get("data_type")})`,
      id
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
