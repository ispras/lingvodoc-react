import React from "react";

import { getTranslation } from "api/i18n";

export default React.createContext(getTranslation);
