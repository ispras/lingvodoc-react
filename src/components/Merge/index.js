import React from "react";
import { connect } from "react-redux";
import { Button, Dimmer, Header, Icon, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
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
