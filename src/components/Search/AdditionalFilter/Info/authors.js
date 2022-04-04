import { getTranslation } from "api/i18n";

import info from "./info";

const authorsInfo = authors => {
  let result = "";

  if (authors.length === 0) {
    result = info(getTranslation("Not chosen"));
  } else {
    result = info(authors);
  }

  return `${getTranslation("Authors")}: ${result}`;
};

export default authorsInfo;
