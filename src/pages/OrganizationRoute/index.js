import React from 'react';
import './styles.scss';
import Info from '../Info';
import { Link } from 'react-router-dom';
import { Container, Segment } from 'semantic-ui-react';

import { getTranslation } from 'api/i18n';

function organizationRoute() {
  return (
    <div>
      <Container className="organizationRoute">

        <div className="block">
          <p>{getTranslation('Grants and organizations')}</p>
          <Link to="/grants" className="background-img" />
        </div >
        <div className="block off-grant" >
          <p>{getTranslation('Off-grant projects')}</p>
          <Link to="/no_grants" className="background-img" />
        </div>

      </Container>
      <Info />
    </div>
  );
}


export default organizationRoute;

