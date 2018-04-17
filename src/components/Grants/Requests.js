import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderComponent, renderNothing, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Table, Button, Tab } from 'semantic-ui-react';

import Placeholder from 'components/Placeholder';

import { grantsQuery, getUserRequestsQuery } from './graphql';

const panes = [
  { menuItem: 'Grants', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
  { menuItem: 'Dictionaries', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
  { menuItem: 'Organization users', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  { menuItem: 'Organization admins', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
];

const Requests = () => <Tab menu={{ fluid: true, vertical: true, tabular: 'right' }} panes={panes} />;

export default compose(
  graphql(getUserRequestsQuery),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing),
)(Requests);
