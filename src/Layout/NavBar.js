import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql } from 'react-apollo';
import { compose, pure } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Dropdown, Menu, Icon, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import config from 'config';

import User from './User';
import Tasks from './Tasks';
import Locale from './Locale';

const Logo = styled.span`
  font-size: 1.2em;
  font-weight: bold;
`;

const SyncButton = ({ synchronize }) => (
  <Menu.Item as={Button} negative onClick={synchronize}>
    Sync
  </Menu.Item>
);

SyncButton.propTypes = {
  synchronize: PropTypes.func.isRequired,
};

const Sync = compose(
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
  pure
)(SyncButton);

const Dashboard = (props) => {
  const { data: { loading, error, is_authenticated: isAuthenticated } } = props;
  if (loading || error || !isAuthenticated) {
    return null;
  }
  return (
    <Dropdown item text="Dashboard">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/dashboard/create_dictionary">
          Create dictionary
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/dictionaries">
          Dictionaries
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/corpora">
          Corpora
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/import">
          Import Starling dictionaries
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

const NavBar = pure(({ location }) => (
  <Menu fixed="top">
    <Menu.Item as={Link} to={config.homePath}>
      <Logo>Lingvodoc 3.0</Logo>
    </Menu.Item>

    <DashboardWithData />

    <Dropdown item text="Maps">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/map">
          Map
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/map_search">
          Search
        </Dropdown.Item>
        {/* <Dropdown.Item as={Link} to="/sociolinguistics">
          Sociolinguistics
        </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text="Info">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/info">
          Info
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/desktop">
          Desktop
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/languages">
          Languages
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Menu.Menu position="right">
      {(config.buildType === 'desktop' || config.buildType === 'proxy') && <Sync />}
      <User />
      <Tasks />
      <Locale />
    </Menu.Menu>
  </Menu>
));

NavBar.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default withRouter(NavBar);
