import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Button, Divider, Header, Message, Step } from "semantic-ui-react";
import Immutable, { fromJS } from "immutable";
import PropTypes from "prop-types";
import { branch, compose, pure, renderComponent, renderNothing, withProps } from "recompose";

import GrantsList from "components/Grants/GrantsList";

class Grants extends React.Component {
  render() {
    return (
      <div className="background-content">
        <GrantsList />
      </div>
    );
  }
}

Grants.propTypes = {};

export default Grants;
