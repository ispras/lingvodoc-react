import React from "react";
import { connect } from "react-redux";
import { Button, Dropdown, Popup } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import { is } from "immutable";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { openCreateFieldModal } from "ducks/fields";

function valueColor(value) {
  if (value === "keep") {
    return "green";
  }

  if (value === "spread") {
    return "red";
  }

  if (value && value.includes("/")) {
    return "purple";
  }

  return null;
}

function FieldButton({ text, onClick, isSelected }) {
  const color = isSelected ? { color: "blue" } : {};

  return <Button onClick={onClick} content={text} {...color} />;
}

function Column({ spread, name, value, fieldOptions, type, onSetColumnType, actions }) {
  const isLink = value && value.includes("/");

  let columnButton = <Button className="column-button" color={valueColor(value)} content={name} />;

  if (spread) {
    columnButton = React.cloneElement(columnButton, { inverted: true, color: "red", disabled: true });
  }

  const selectedField = fieldOptions.find(x => is(x.id, type));
  const triggerColor = selectedField ? { color: "blue" } : {};

  /*
   * Without something in the text button can sometimes be not full height, so we in such cases we place
   * zero-width space there.
   */

  const triggerText = selectedField ? selectedField.text || "\u200b" : getTranslation("Field Type");

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
        <Dropdown
          style={{ marginTop: "0.5em", marginBottom: "0.25em" }}
          className="main-select"
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

const ColumnWithData = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ openCreateFieldModal }, dispatch)
  }))
)(Column);

function Columns({ blob, spreads, fieldOptions, columnTypes, onSetColumnType }) {
  const blobId = blob.get("id");
  const values = blob.get("values");

  return (
    <div className="blob">
      <b className="blob-name">{blob.get("name")}</b>
      <div className="blob-columns">
        {values
          .filter(value => value !== null)
          .map((value, columnIdStr) => (
            <ColumnWithData
              key={columnIdStr}
              name={columnIdStr.slice(columnIdStr.indexOf(":") + 1)}
              value={value}
              type={columnTypes.getIn([blobId, columnIdStr])}
              onSetColumnType={onSetColumnType(columnIdStr)}
              fieldOptions={fieldOptions}
            />
          ))
          .toArray()}
        {spreads.map(spread => (
          <ColumnWithData
            spread
            key={spread.get("from").join(spread.get("column"))}
            name={spread.get("column")}
            type={columnTypes.getIn([spread.get("from"), spread.get("column")])}
            fieldOptions={fieldOptions}
          />
        ))}
      </div>
    </div>
  );
}

function ColumnMapper({ state, spreads, types, columnTypes, onSetColumnType }) {
  const typesSortedFiltered = types
    .sortBy(type => type.get("translation"))
    .filter(type => type.get("translation").trim() != "");

  const fieldOptions = [];

  for (const type of typesSortedFiltered) {
    const id = type.get("id");
    const idStr = id.join("/");

    fieldOptions.push({
      key: idStr,
      value: idStr,
      id: id,
      text: type.get("translation")
    });

    fieldOptions[idStr] = id;
  }

  return (
    <div className="column-mapper">
      {state
        .map((v, id) => (
          <Columns
            key={id.join("/")}
            blob={v}
            fieldOptions={fieldOptions}
            spreads={spreads.get(id, [])}
            columnTypes={columnTypes}
            onSetColumnType={onSetColumnType(id)}
          />
        ))
        .toArray()}
    </div>
  );
}

export default ColumnMapper;
