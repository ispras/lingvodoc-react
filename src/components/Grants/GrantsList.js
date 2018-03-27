import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderComponent, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import { Table, Button } from 'semantic-ui-react';

import Placeholder from 'components/Placeholder';

import { grantsQuery, createGrantPermissionMutation } from './graphql';

class GrantsList extends React.Component {
  constructor(props) {
    super(props);
    this.joinGrant = this.joinGrant.bind(this);
    this.isOwner = this.isOwner.bind(this);
  }

  joinGrant(grant) {
    const { createGrantPermission } = this.props;
    createGrantPermission({
      variables: { grantId: grant.id },
    }).then(() => {
      window.logger.suc('Request sent to grant owner.');
    });
  }

  isOwner(grant) {
    const { user } = this.data;
    return !!grant.owners.find(u => user.id === u.id);
  }

  render() {
    const { data } = this.props;
    const { grants } = data;

    return (
      <div style={{ overflowY: 'auto' }}>
        <Table celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Grant issuer</Table.HeaderCell>
              <Table.HeaderCell>Grant</Table.HeaderCell>
              <Table.HeaderCell>Issuer URL</Table.HeaderCell>
              <Table.HeaderCell>Grant URL</Table.HeaderCell>
              <Table.HeaderCell>Grant Number</Table.HeaderCell>
              <Table.HeaderCell>Begin</Table.HeaderCell>
              <Table.HeaderCell>End</Table.HeaderCell>
              <Table.HeaderCell>Owners</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {grants.map(grant => (
              <Table.Row key={grant.id}>
                <Table.Cell>{grant.issuer}</Table.Cell>
                <Table.Cell>{grant.translation}</Table.Cell>
                <Table.Cell>
                  <a href={grant.issuer_url}>{grant.issuer_url}</a>
                </Table.Cell>
                <Table.Cell>
                  <a href={grant.grant_url}>{grant.grant_url}</a>
                </Table.Cell>
                <Table.Cell>{grant.grant_number}</Table.Cell>
                <Table.Cell>b</Table.Cell>
                <Table.Cell>e</Table.Cell>
                <Table.Cell>{grant.owners.map(owner => <div key={owner.id}>{owner.name}</div>)}</Table.Cell>
                <Table.Cell>
                  {this.isOwner(grant) && (
                    <Button basic onClick={() => this.joinGrant(grant)}>
                      Join
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }
}

GrantsList.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  createGrantPermission: PropTypes.func.isRequired,
};

export default compose(
  graphql(grantsQuery),
  graphql(createGrantPermissionMutation, { name: 'createGrantPermission' }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing),
)(GrantsList);
