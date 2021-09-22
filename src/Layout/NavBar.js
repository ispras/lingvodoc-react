import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, branch, renderNothing } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Dropdown, Menu, Button, List } from 'semantic-ui-react';
import styled from 'styled-components';
import config from 'config';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setIsAuthenticated } from 'ducks/auth';

import { getTranslation } from 'api/i18n';
import User from './User';
import Tasks from './Tasks';
import Locale from './Locale';

import './style.scss';

const Logo = styled.span`
  font-size: 1.4em;
  font-weight: bold;
`;

const SyncButton = ({ synchronize }) => (
  <Menu.Item>
    <Button color="purple" onClick={synchronize}>{getTranslation('Sync')}</Button>
  </Menu.Item>
);

SyncButton.propTypes = {
  synchronize: PropTypes.func.isRequired,
};

const Sync = compose(
  branch(() => config.buildType === 'server', renderNothing),
  graphql(gql`
      query isAuthenticatedProxy {
        is_authenticated
  }`),
  graphql(
    gql`
      mutation {
        synchronize {
          triumph
        }
      }
    `,
    { name: 'synchronize' }
  ),
  branch(({ data }) => data.loading || !data.is_authenticated, renderNothing),
)(SyncButton);


const NavBar =
  () => (

    <Menu fixed="top" className="top_menu" borderless>
      <Menu.Item as={Link} to={config.homePath} className="top_menu">
        <Logo>Lingvodoc 3.0</Logo>
      </Menu.Item>

      <Menu.Menu position="right">
        <Sync />
        <User />
        <Tasks />
        <Locale />
      </Menu.Menu>
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
        if ( typeof data.is_authenticated !== 'undefined') {
            dispatch(setIsAuthenticated({ isAuthenticated: data.is_authenticated }));
        }


      return { actions: bindActionCreators({ setIsAuthenticated }, dispatch) };
    }
  ),
  withRouter,
)(NavBar);
