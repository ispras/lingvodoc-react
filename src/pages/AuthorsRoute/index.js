import React, { useContext } from "react";

import TranslationContext from "Layout/TranslationContext";

import Info from "../Info";

import "./styles.scss";

function AuthorsRoute() {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="authorsRoute">
      <div className="background-header">
        <h2 className="page-title">{getTranslation("Lingvodoc creators")}</h2>
      </div>
      <Info />
    </div>
  );
}

export default AuthorsRoute;
