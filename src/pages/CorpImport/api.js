import { Map } from "immutable";

function baseInfo(baseBlob, language, license) {
  const translation_atoms = baseBlob
    .get("translation", new Map())
    .filter(content => content && content.trim() !== "")
    .map((content, locale_id) => ({ content, locale_id }))
    .toArray();

  const parent_id = language.get("id", new Map()).toArray();

  return {
    translation_atoms,
    parent_id,
    license
  };
}

function blobExport(blob, columnTypes) {
  const blob_id = blob.get("id").toArray();
  const values = blob.get("values", new Map());

  const field_map = {
    column_name: values.get("sentence", "Sentence in transliteration"),
    field_id: columnTypes.get("sentence", new Map()).toArray()
  };

  return {
    blob_id,
    field_map
  };
}

export function buildExport({ linking, columnTypes, languages, licenses }) {
  const baseBlob = linking.first();
  const baseId = baseBlob.get("id");

  const result = baseInfo(baseBlob, languages.get(baseId), licenses.get(baseId));

  result.columns = linking.reduce(
    (acc, blob, id) => [...acc, blobExport(blob, columnTypes.get(id))],
    []
  );

  return result;
}
