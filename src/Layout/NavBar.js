import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql } from 'react-apollo';
import { compose, pure } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Dropdown, Menu, Icon, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import User from './User';
import Tasks from './Tasks';
import Locale from './Locale';

import config from 'config';

const Logo = styled.span`
  font-size: 1.2em;
  font-weight: bold;
`;

const SyncButton = ({synchronize}) => (
  <Menu.Item as={Button} negative onClick={synchronize}>
      Sync
  </Menu.Item>
);

const Sync = compose(
  graphql(gql`
    mutation {
      synchronize {
        triumph
      }
    }
  `, { name: 'synchronize' }),
  pure
)(SyncButton);

const NavBar = pure(({ location, synchronize }) => (
  <Menu fixed="top">
    <Menu.Item as={Link} to={config.homePath}>
      <Logo>
        Lingv<Icon name="talk outline" />doc
      </Logo>
    </Menu.Item>

    <Dropdown item text="Dashboard">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/dashboard/dictionaries">
          Dashboard
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/dashboard/corpora">
          Corpora
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/languages">
          Languages
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/import">
          Import Starling dictionaries
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text="Maps">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/map_search">
          Search
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/sociolinguistics">
          Sociolinguistics
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

    <Menu.Item as={Link} to="/desktop" active={location.pathname === '/desktop'}>
      Desktop software
    </Menu.Item>

    <Menu.Item as={Link} to="/info" active={location.pathname === '/info'}>
      Info
    </Menu.Item>

    <Menu.Menu position="right">
      {config.proxy && (
        <Sync />
      )}
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
