import React from "react";
import { getTranslation } from "api/i18n";

import Info from "../Info";

import "./styles.scss";

function authorsRoute() {
  return (
    <div className="authorsRoute">
      <div className="background-header">
        <h2 className="page-title">{getTranslation("Lingvodoc creators")}</h2>
      </div>
      <Info />
    </div>
  );
}

export default authorsRoute;
