import React, { useContext } from "react";
import { Container } from "semantic-ui-react";

import TranslationContext from "Layout/TranslationContext";

const NotFound = () => {
  const getTranslation = useContext(TranslationContext);
  return (
    <Container>
      <h1>{getTranslation("Nothing here, sorry")}</h1>
    </Container>
  );
};

export default NotFound;
