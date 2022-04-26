import React, { useContext } from "react";

import TranslationContext from "Layout/TranslationContext";

const Unknown = props => {
  const { as: Component = "div" } = props;
  const getTranslation = useContext(TranslationContext);

  return <Component>{getTranslation("Unknown type")}</Component>;
};

export default Unknown;
