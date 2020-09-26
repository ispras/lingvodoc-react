import React from 'react';
import './styles.scss';
import Info from '../Info';
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import imageScholarship from '../../images/scholarship.png';
import imageLegalDocument from '../../images/legal-document.png';

import { getTranslation } from 'api/i18n';

function organizationRoute() {
  return (
    <div>
      <Container className="organizationRoute">
      <p className="organization">{getTranslation('Organization')}</p>
        <div className="block img-block">
         
          <Link to="/grants" className="background-img" ><img className="img " src={imageScholarship} /></Link>
          <p>{getTranslation('Grants and organizations')}</p>
        </div >
        <div className="block off-grant img-block" >

          <Link to="/without_grants" className="background-img" ><img className="img " src={imageLegalDocument} /></Link>
          <p>{getTranslation('Off-grant projects')}</p>
        </div>

      </Container>
      <Info />
    </div>
  );
}


export default organizationRoute;

