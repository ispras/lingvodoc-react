import React from "react";
import { getTranslation } from "api/i18n";

import info from "./info";

const grammarGroupInfo = (name, values, needComma) => {
  return (
    <span key={name}>
      <strong>{name}</strong>: {info(values)}
      {needComma ? ", " : ""}
    </span>
  );
};

const grammarInfo = (grammar, onClickCallback) => {
  const grammarText = Object.keys(grammar).map((grammarGroupName, index, array) => {
    const grammarGroupValues = Object.keys(grammar[grammarGroupName]);
    let needComma = false;

    if (index + 1 !== array.length) {
      needComma = true;
    }

    return grammarGroupInfo(grammarGroupName, grammarGroupValues, needComma);
  });

  let result = grammarText;

  if (grammarText.length === 0) {
    result = getTranslation("Not chosen");
  }

  return (
    <div>
      {getTranslation("Grammar")}: <a onClick={onClickCallback}>{result}</a>
    </div>
  );
};

export default grammarInfo;
