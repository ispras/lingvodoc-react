import React from "react";
import PropTypes from "prop-types";

import GrantsToc from "./grants";
import LanguagesToc from "./languages";
import OrganizationsToc from "./organizations";

/** Table of contents for languages, grants or organizations */
const TableOfContents = ({ sortMode, published, forCorpora = false }) => {
  switch (sortMode) {
    case "language":
      return <LanguagesToc published={published} category={forCorpora ? 1 : 0} />;
    case "grant":
      return <GrantsToc published={published} category={forCorpora ? 1 : 0} />;
    case "organization":
      return <OrganizationsToc published={published} category={forCorpora ? 1 : 0} />;
    default:
      return null;
  }
};

TableOfContents.propTypes = {
  sortMode: PropTypes.string.isRequired,
  published: PropTypes.bool,
  forCorpora: PropTypes.bool
};

export default TableOfContents;
