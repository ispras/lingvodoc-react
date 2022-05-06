import React from "react";
import PropTypes from "prop-types";

import GrantsToc from "./grants";
import LanguagesToc from "./languages";
import OrganizationsToc from "./organizations";

/** Table of contents for languages, grants or organizations */
const TableOfContents = ({ kind }) => {
  switch (kind) {
    case "language":
      return <LanguagesToc />;
    case "grant":
      return <GrantsToc />;
    case "organization":
      return <OrganizationsToc />;
    default:
      return null;
  }
};

TableOfContents.propTypes = {
  kind: PropTypes.string.isRequired
};

export default TableOfContents;
