import { Map } from "immutable";

/* eslint-disable camelcase */
function singleColumn(name, value, columnTypes) {
  const result = { column_name: name };

  switch (value) {
    case "base":
      result.sentence_type = 1;
      result.field_id = columnTypes.get(name, new Map()).toArray();
      break;
    case "secondary":
      result.sentence_type = 2;
      result.field_id = columnTypes.get(name, new Map()).toArray();
      break;
  }

  return result;
}

function blobExport(blob, columnTypes, language, license) {
  const blob_id = blob.get("id").toArray();

  const translation_atoms = blob
    .get("translation", new Map())
    .filter(content => content && content.trim() !== "")
    .map((content, locale_id) => ({ content, locale_id }))
    .toArray();

  const parent_id = language.get("id", new Map()).toArray();

  const values = blob.get("values", new Map());

  const field_map = blob.getIn(["additional_metadata", "starling_fields"]).reduce((columnList, column, index) => {
    const columnIdStr = `${index}:${column}`;
    const value = values.get(columnIdStr);

    if (value != null) {
      columnList.push(singleColumn(columnIdStr, value, columnTypes));
    }

    return columnList;
  }, []);

  const result = {
    blob_id,
    translation_atoms,
    parent_id,
    field_map,
    license
  };

  return result;
}

export function buildExport({ linking, columnTypes, languages, licenses }) {
  return linking.reduce(
    (acc, blob, id) => [...acc, blobExport(blob, columnTypes.get(id), languages.get(id), licenses.get(id))],
    []
  );
}
