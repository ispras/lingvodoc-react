import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, branch, renderNothing } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Dropdown, Menu, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import config from 'config';

import User from './User';
import Tasks from './Tasks';
import Locale from './Locale';
import { getTranslation } from 'api/i18n';

const Logo = styled.span`
  font-size: 1.2em;
  font-weight: bold;
`;

const SyncButton = ({ synchronize }) => (
  <Menu.Item as={Button} negative onClick={synchronize}>
  {getTranslation("Sync")}
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

const Dashboard = (props) => {
  const { data: { loading, error, is_authenticated: isAuthenticated } } = props;
  if (loading || error || !isAuthenticated) {
    return null;
  }
  return (
    <Dropdown item text={getTranslation("Dashboard")}>
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/dashboard/create_dictionary">
        {getTranslation("Create dictionary")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/create_corpus">
        {getTranslation("Create corpus")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/dictionaries">
        {getTranslation("Dictionaries")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/corpora">
        {getTranslation("Corpora")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/import">
        {getTranslation("Import Starling dictionaries")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

Dashboard.propTypes = {
  data: PropTypes.shape({ loading: PropTypes.bool.isRequired }).isRequired,
};

const DashboardWithData = graphql(gql`
  query isAuthenticated {
    is_authenticated
  }
`)(Dashboard);

function openHelp() {
  window.open('https://github.com/ispras/lingvodoc-react/wiki', '_blank');
}

const NavBar = () => (
  <Menu fixed="top">
    <Menu.Item as={Link} to={config.homePath}>
      <Logo>Lingvodoc 3.0</Logo>
    </Menu.Item>

    <DashboardWithData />

    <Dropdown item text={getTranslation("Maps")}>
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/map">
        {getTranslation("Map")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/map_search">
        {getTranslation("Search")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text={getTranslation("Info")}>
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/info">
        {getTranslation("Authors")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/desktop">
        {getTranslation("Desktop")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/languages">
        {getTranslation("Languages")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Menu.Menu position="right">
      <Sync />
      <User />
      <Tasks />
      <Locale />
      <Menu.Item>
        <Button primary negative onClick={openHelp}>{getTranslation("Help")}</Button>
      </Menu.Item>
    </Menu.Menu>
  </Menu>
);

export default withRouter(NavBar);
