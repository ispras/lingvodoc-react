import React from 'react';
import './styles.scss';
import Info from '../Info';
import { Link } from 'react-router-dom';

import { getTranslation } from 'api/i18n';
class OrganizationRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='organizationRoute'>
          <div className="column-icon">
            <div className="block">
              <p>{getTranslation('Grants and organizations')}</p>
              <Link to='/grants' className='background-img'>
                <div>
                </div>
              </Link>
            </div >
            <div className="block" >
              <p>{getTranslation('Off-grant projects')}</p>
              <Link to='/no_grants' className='background-img'>
                <div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Info />
      </div>


    );
  }
}

export default OrganizationRoute;

