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
  font-size: 1.4em;
  font-weight: bold;
`;

const SyncButton = ({ synchronize }) => (
  <Menu.Item>
    <Button color="purple" onClick={synchronize}>{getTranslation("Sync")}</Button>
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
    <Dropdown item text={getTranslation("Dashboard")} className="top_menu">
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
        <Dropdown.Item as={Link} to="/import_dialeqt">
        {getTranslation("Import Dialeqt dictionary")}
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

function openMapStorage() {
  window.open('https://github.com/ispras/lingvodoc-react/wiki/%D0%A5%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B5-%D0%BA%D0%B0%D1%80%D1%82', '_blank');
}

const NavBar = () => (
  <Menu fixed="top" className="top_menu">
    <Menu.Item as={Link} to={config.homePath} className="top_menu">
      <Logo>Lingvodoc 3.0</Logo>
    </Menu.Item>

    <DashboardWithData />

    <Dropdown item text={getTranslation("Maps")} className="top_menu">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/map">
        {getTranslation("Map")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/map_search">
        {getTranslation("Search")}
        </Dropdown.Item>
        <Dropdown.Item onClick={openMapStorage}>
          {getTranslation("Storage")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text={getTranslation("Info")} className="top_menu">
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
