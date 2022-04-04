import React from "react";
import { Container } from "semantic-ui-react";
import { getTranslation } from "api/i18n";

const NotFound = () => (
  <Container>
    <h1>{getTranslation("Nothing here, sorry")}</h1>
  </Container>
);

export default NotFound;
