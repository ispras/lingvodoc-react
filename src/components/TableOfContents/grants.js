import React from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Header, List } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getTocGrants } from "backend";
import Placeholder from "components/Placeholder";
import { useTranslations } from "hooks";

/** Table of contents for grants */
const GrantsToc = ({ queryGrants, onSelectId }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const { loading, error, data } = queryGrants;

  if (loading && !data) {
    return <Placeholder />;
  }

  if (error) {
    return null;
  }

  return (
    <Container className="container-gray">
      <Header>{`${getTranslation("The work is supported by the following grants")}:`}</Header>
      <List ordered className="lingvo-list">
        {data.grants.map(grant => (
          <List.Item
            key={grant.id}
            as="a"
            onClick={() => {
              onSelectId(String(grant.id));
              searchParams.set("grant", grant.id);
              setSearchParams(searchParams);
            }}
          >
            {`${chooseTranslation(grant.translations)} (${chooseTranslation(grant.issuer_translations)} ${
              grant.grant_number
            })`}
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

GrantsToc.propTypes = {};

export default GrantsToc;
