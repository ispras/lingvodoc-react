import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Button, Dimmer, Header, Icon, Table } from "semantic-ui-react";
import gql from "graphql-tag";
import { drop, find, flow, groupBy, isEqual, reverse, sortBy, take } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, pure, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

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
