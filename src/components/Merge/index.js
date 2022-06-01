import React from "react";
import PropTypes from "prop-types";

import Settings from "./Settings";

const Merge = props => (
  <div>
    <Settings id={props.id} />
  </div>
);

Merge.propTypes = {
  id: PropTypes.array.isRequired
};

export default Merge;
