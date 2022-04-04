import React from "react";
import { getTranslation } from "api/i18n";

const Unknown = props => {
  const { as: Component = "div" } = props;

  return <Component>{getTranslation("Unknown type")}</Component>;
};

export default Unknown;
