import { getTranslation } from "api/i18n";

const languagesInfo = languages => {
  const result = `${languages.length} ${getTranslation("selected")}`;

  return `${getTranslation("Languages")}: ${result}`;
};

export default languagesInfo;
