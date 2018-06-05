import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderComponent, renderNothing, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Table, Button, Tab, Card } from 'semantic-ui-react';
import { groupBy, isEqual } from 'lodash';
import moment from 'moment';

import Placeholder from 'components/Placeholder';

import { getUserRequestsQuery, acceptMutation } from './graphql';

const timestampToDate = ts => moment(ts * 1000).format('LLLL');
const objectById = (id, objs) => objs.find(o => o.id === id);
const objectByCompositeId = (id, objs) => objs.find(o => isEqual(o.id, id));

function acceptRequest(mutation, id, accept) {
  mutation({
    variables: {
      id,
      accept,
    },
    refetchQueries: [
      {
        query: getUserRequestsQuery,
      },
    ],
  });
}

const Subject = ({
  request, grants, users, dictionaries, accept,
}) => {
  switch (request.type) {
    case 'add_dict_to_grant':
      const { subject } = request;
      const dictionary = objectByCompositeId(subject.dictionary_id, dictionaries);
      const grant = objectById(subject.grant_id, grants);
      return <Card header={grant.translation} meta={grant.grant_number} description={dictionary.translation} />;
    case 'grant_permission':
    case 'participate_org':
    case 'administrate_org':
    default:
      return <div>Unknow request type!</div>;
  }
};

const RequestsPane = ({
  requests, grants, users, dictionaries, accept,
}) => (
  <Tab.Pane>
    <Table celled padded>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>User</Table.HeaderCell>
          <Table.HeaderCell>Subject</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Message</Table.HeaderCell>
          <Table.HeaderCell>Action</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {requests.length === 0 && (
          <Table.Row>
            <Table.Cell>No entries</Table.Cell>
          </Table.Row>
        )}
        {requests.map(r => (
          <Table.Row key={r.broadcast_uuid}>
            <Table.Cell>{objectById(r.sender_id, users).intl_name}</Table.Cell>

            <Table.Cell>
              <Subject request={r} grants={grants} users={users} dictionaries={dictionaries} />
            </Table.Cell>
            <Table.Cell>{timestampToDate(r.created_at)}</Table.Cell>
            <Table.Cell>{r.message}</Table.Cell>
            <Table.Cell>
              <Button positive size="mini" onClick={() => acceptRequest(accept, r.id, true)}>
                Accept
              </Button>
              <Button negative size="mini" onClick={() => acceptRequest(accept, r.id, false)}>
                Reject
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </Tab.Pane>
);

const Requests = ({ data, accept }) => {
  const {
    userrequests, grants, users, dictionaries,
  } = data;
  const requestsByType = groupBy(userrequests, u => u.type);

  const panes = [
    {
      menuItem: 'Dictionaries',
      render: () => (
        <RequestsPane
          requests={requestsByType.add_dict_to_grant || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          accept={accept}
        />
      ),
    },
    {
      menuItem: 'Grants',
      render: () => (
        <RequestsPane
          requests={requestsByType.grant_permission || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          accept={accept}
        />
      ),
    },
    {
      menuItem: 'Organization users',
      render: () => (
        <RequestsPane
          requests={requestsByType.participate_org || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          accept={accept}
        />
      ),
    },
    {
      menuItem: 'Organization admins',
      render: () => (
        <RequestsPane
          requests={requestsByType.administrate_org || []}
          grants={grants}
          users={users}
          dictionaries={dictionaries}
          accept={accept}
        />
      ),
    },
  ];

  return <Tab menu={{ fluid: true, vertical: true, tabular: 'right' }} panes={panes} />;
};

export default compose(
  graphql(getUserRequestsQuery),
  graphql(acceptMutation, { name: 'accept' }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing)
)(Requests);
