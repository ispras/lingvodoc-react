import React from 'react';

import './styles.scss';
import image from '../../images/maps.png';
import { Link } from 'react-router-dom';

class OrganizationRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className='organizationRoute'>
          <div className='background-img'></div>
          <p>Organization</p>
        


        </div>
      </div>

    );
  }
}

export default OrganizationRoute;