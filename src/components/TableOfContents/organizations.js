import React from "react";
import { useSearchParams } from "react-router-dom";
import { Container, List } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

import { getTocOrganizations } from "backend";
import Placeholder from "components/Placeholder";
import { useTranslations } from "hooks";

/** Table of contents for organizations */
const OrganizationsToc = () => {
  const { chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const { loading, error, data } = useQuery(getTocOrganizations, { fetchPolicy: "network-only" });

  if (loading) {
    return <Placeholder />;
  }

  if (error) {
    return null;
  }

  return (
    <Container className="container-gray">
      <List ordered className="lingvo-list">
        {data.organizations.map(organization => (
          <List.Item
            key={organization.id}
            as="a"
            onClick={() => {
              searchParams.set("entity", organization.id);
              setSearchParams(searchParams);
            }}
          >
            {chooseTranslation(organization.translations)}
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

export default OrganizationsToc;
