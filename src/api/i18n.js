const i18n = new Map();

export const stringsToTranslate = [
  "Add Translation",
  "All",
  "Authors",
  "By Grants",
  "By Languages",
  "Corpora",
  "Create corpus",
  "Create dictionary",
  "Dashboard",
  "Desktop",
  "Dictionaries",
  "Dictionary",
  "Display mode",
  "Edit profile",
  "Field",
  "Grant",
  "Grants",
  "Help",
  "Import Starling dictionaries",
  "Info",
  "Language",
  "Languages",
  "Loading",
  "Map",
  "Maps",
  "My files",
  "Perspective",
  "Requests",
  "Save",
  "Search",
  "Select language",
  "Service",
  "Sign In",
  "Sign out",
  "Sign Up",
  "Start typing language name",
  "Sync",
  "Tasks",
  "This page is available for administrator only",
  "Up",
  "User",
  "User account activation/deactivation"
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
