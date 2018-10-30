const i18n = new Map();

export const stringsToTranslate = [
  "Add Translation",
  "All",
  "Dictionary",
  "Field",
  "Grant",
  "Language",
  "Loading",
  "Perspective",
  "Save",
  "Service",
  "This page is available for administrator only"
];

export function getTranslation(string) {
  const translation = i18n.get(string);
  return (translation == undefined) ? string : translation;
}

export function setTranslation(string, translatedString) {
  if (translatedString == null || translatedString == undefined) {
    i18n.set(string, string);
  }
  else {
    i18n.set(string, translatedString);
  }
}
