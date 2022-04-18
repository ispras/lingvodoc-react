import React from "react";
import { connect } from "react-redux";
import { Button, Divider, Header, Message, Step } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import Immutable, { fromJS } from "immutable";
import PropTypes from "prop-types";
import { branch, compose, pure, renderComponent, renderNothing, withProps } from "recompose";

import Requests from "components/Grants/Requests";

class UserRequests extends React.Component {
  render() {
    return <Requests />;
  }
}

UserRequests.propTypes = {};

export default UserRequests;
