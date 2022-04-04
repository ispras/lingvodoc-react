import { getTranslation } from "api/i18n";

const dictionariesInfo = dictionaries => {
  const result = `${dictionaries.length} ${getTranslation("selected")}`;

  return `${getTranslation("Dictionaries")}: ${result}`;
};

export default dictionariesInfo;
