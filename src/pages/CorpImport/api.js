import { Map } from "immutable";

export function corporaInfo({ linking, languages, licenses, mode }) {

  const result = [];

  for (const baseBlob of linking.values()) {
    const baseId = baseBlob.get("id");
    const language = languages.get(baseId);
    const license = licenses.get(baseId);

    const translation_atoms = baseBlob
      .get("translation", new Map())
      .filter(content => content && content.trim() !== "")
      .map((content, locale_id) => ({ content, locale_id }))
      .toArray();

    const parent_id = language.get("id", new Map()).toArray();

    result.push({
      translation_atoms,
      parent_id,
      license
    });

    // Only one target language for txt mode
    if (mode === 'txt') {
      break
    }
  }
  return result;
}

function blobExport(blob, columnType) {
  const blob_id = blob.get("id").toArray();
  const dedash = (blob.getIn(["values", "sentence"], "dash") === "dedash");
  const field_ids = [columnType.get("sentence", new Map()).toArray(),
                     columnType.get("to_sentence", new Map()).toArray()];

  return {
    blob_id,
    field_ids,
    dedash
  };
}

export function columnsInfo({ linking, columnTypes }) {
  return linking.reduce(
    (acc, blob, id) => [...acc, blobExport(blob, columnTypes.get(id))],
    []
  );
}
