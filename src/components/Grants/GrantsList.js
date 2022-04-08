import React from "react";
import { Button, Table } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { branch, compose, renderComponent, renderNothing } from "recompose";

import Placeholder from "components/Placeholder";

import { createGrantPermissionMutation, grantsQuery } from "./graphql";

function dateFormat(timestamp) {
  const date = new Date(timestamp * 1000);

  return `${date.getUTCFullYear().toString().padStart(4, "0")}.${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getUTCDate().toString().padStart(2, "0")}`;
}

class GrantsList extends React.Component {
  constructor(props) {
    super(props);
    this.joinGrant = this.joinGrant.bind(this);
    this.isOwner = this.isOwner.bind(this);
  }

  joinGrant(grant) {
    const { createGrantPermission } = this.props;
    createGrantPermission({
      variables: { grantId: grant.id }
    }).then(() => {
      window.logger.suc(getTranslation("Request has been sent to the grant's owner."));
    });
  }

  isOwner(grant) {
    const {
      data: { user }
    } = this.props;
    return !!grant.owners.find(u => user && user.id === u.id);
  }

  render() {
    const { data } = this.props;
    const { grants } = data;

    return (
      <div style={{ overflowY: "auto" }}>
        <Table celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{getTranslation("Grant Issuer")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Grant")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Issuer URL")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Grant URL")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Grant Number")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Begin")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("End")}</Table.HeaderCell>
              <Table.HeaderCell>{getTranslation("Owners")}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {grants.map(grant => (
              <Table.Row key={grant.id}>
                <Table.Cell>{grant.issuer}</Table.Cell>
                <Table.Cell>{grant.translation}</Table.Cell>
                <Table.Cell className="lingvo-column-issuer-url">
                  <a href={grant.issuer_url}>{grant.issuer_url}</a>
                </Table.Cell>
                <Table.Cell className="lingvo-column-grant-url">
                  <a href={grant.grant_url}>{grant.grant_url}</a>
                </Table.Cell>
                <Table.Cell>{grant.grant_number}</Table.Cell>
                <Table.Cell>{dateFormat(grant.begin)}</Table.Cell>
                <Table.Cell>{dateFormat(grant.end)}</Table.Cell>
                <Table.Cell>
                  {grant.owners.map(owner => (
                    <div key={owner.id}>{owner.name}</div>
                  ))}
                </Table.Cell>
                <Table.Cell>
                  {!this.isOwner(grant) && (
                    <Button positive onClick={() => this.joinGrant(grant)}>
                      {getTranslation("Join")}
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
    loading: PropTypes.bool.isRequired
  }).isRequired,
  createGrantPermission: PropTypes.func.isRequired
};

export default compose(
  graphql(grantsQuery),
  graphql(createGrantPermissionMutation, { name: "createGrantPermission" }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing)
)(GrantsList);
