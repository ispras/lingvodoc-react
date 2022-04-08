import React from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Button, Menu } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import config from "config";
import { setIsAuthenticated } from "ducks/auth";

import Locale from "./Locale";
import Tasks from "./Tasks";
import User from "./User";

import "./style.scss";

const SyncButton = ({ synchronize }) => (
  <Menu.Item>
    <Button color="purple" onClick={synchronize}>
      {getTranslation("Sync")}
    </Button>
  </Menu.Item>
);

SyncButton.propTypes = {
  synchronize: PropTypes.func.isRequired
};

const Sync = compose(
  branch(() => config.buildType === "server", renderNothing),
  graphql(gql`
    query isAuthenticatedProxy {
      is_authenticated
    }
  `),
  graphql(
    gql`
      mutation {
        synchronize {
          triumph
        }
      }
    `,
    { name: "synchronize" }
  ),
  branch(({ data }) => data.loading || !data.is_authenticated, renderNothing)
)(SyncButton);

const NavBar = () => (
  <Menu fixed="top" className="top_menu" borderless>
    <div className="top-wrapper">
      <Menu.Item as={Link} to={config.homePath} className="top_menu top_menu__logo">
        <span className="lingvodoc-logo">Lingvodoc 3.0</span>
      </Menu.Item>

      <Menu.Menu position="right">
        <Sync />
        <User />
        <Tasks />
        <Locale />
      </Menu.Menu>
    </div>
  </Menu>
);

export default compose(
  graphql(gql`
    query isAuthenticated {
      is_authenticated
    }
  `),
  connect(
    (state, { data }) => ({ ...state.auth }),
    (dispatch, { data }) => {
      if (typeof data.is_authenticated !== "undefined") {
        dispatch(setIsAuthenticated({ isAuthenticated: data.is_authenticated }));
      }

      return { actions: bindActionCreators({ setIsAuthenticated }, dispatch) };
    }
  ),
  withRouter
)(NavBar);
