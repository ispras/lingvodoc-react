import React from 'react';
import { Container } from 'semantic-ui-react';

const Perspective = ({ match }) =>
  <Container fluid>
    <pre>
      { JSON.stringify(match.params, null, 2) }
    </pre>
  </Container>;

export default Perspective;
