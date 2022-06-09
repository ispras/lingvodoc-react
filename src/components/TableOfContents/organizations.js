import React from "react";
import { useSearchParams } from "react-router-dom";
import { List } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getTocOrganizations } from "backend";
import Placeholder from "components/Placeholder";
import { useTranslations } from "hooks";

/** Table of contents for organizations */
const OrganizationsToc = ({ queryOrganizations, onSelectId }) => {
  const { chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const { loading, error, data } = queryOrganizations;

  if (loading && !data) {
    return <Placeholder />;
  }

  if (error) {
    return null;
  }

  return (
    <div className="container-gray">
      <List ordered className="lingvo-list">
        {data.organizations.map(organization => (
          <List.Item
            key={organization.id}
            as="a"
            onClick={() => {
              onSelectId(String(organization.id));
              searchParams.set("organization", organization.id);
              setSearchParams(searchParams);
            }}
          >
            {chooseTranslation(organization.translations)}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

OrganizationsToc.propTypes = {};

export default OrganizationsToc;
