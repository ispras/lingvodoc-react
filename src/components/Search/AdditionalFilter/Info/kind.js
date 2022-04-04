import { getTranslation } from "api/i18n";

import info, { isValueBoolean } from "./info";

const kindInfo = kind => {
  let result = "";

  if (isValueBoolean(kind)) {
    if (kind === false) {
      result = info(getTranslation("Not chosen"));
    }
  } else {
    result = info(kind);
  }

  return `${getTranslation("Data source")}: ${result}`;
};

export default kindInfo;
